"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  CHECKIN_CATEGORIES,
  checkinCategoryLabel,
  type CheckinCategory,
} from "@/lib/checkin-categories";

const QrScanner = dynamic(() => import("@/components/checkin/QrScanner"), { ssr: false });

type Screen = "loading" | "login" | "categories" | "desk" | "allchecked";
type DeskTab = "search" | "scan" | "checked";

interface Guest {
  id: string;
  name: string;
  contact: string | null;
  category: string;
  rsvpStatus: string;
  attendance?: string | null;
  code: string | null;
  checkInStatus: string;
  checkInTime: string | null;
}

interface Counts {
  categories: { category: string; registered: number; checkedIn: number }[];
  totalCheckedIn: number;
  totalRegistered: number;
}

type Overlay =
  | { kind: "success"; guest: Guest; time: string | null }
  | { kind: "already"; guest: Guest }
  | { kind: "mismatch"; guestName: string; actualCategory: string }
  | { kind: "notfound"; message: string }
  | null;

function formatTime(iso: string | null): string {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      timeZone: "Africa/Lagos",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

function rsvpLabel(s: string): string {
  if (s === "accepted") return "RSVP Confirmed";
  if (s === "declined") return "Declined";
  return "RSVP Pending";
}

async function api(path: string, init?: RequestInit) {
  const res = await fetch(path, init);
  const data = await res.json().catch(() => ({}));
  return { res, data };
}

const inputCls =
  "w-full h-14 px-4 text-lg rounded-md bg-white border border-[#0E281E]/20 text-[#0E281E] placeholder:text-[#0E281E]/35 outline-none focus:border-[#C5A059]";

export default function CheckInApp() {
  const [screen, setScreen] = useState<Screen>("loading");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginBusy, setLoginBusy] = useState(false);

  const [counts, setCounts] = useState<Counts | null>(null);
  const [category, setCategory] = useState<CheckinCategory | null>(null);
  const [tab, setTab] = useState<DeskTab>("search");

  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<Guest[]>([]);
  const [searched, setSearched] = useState(false);

  const [detail, setDetail] = useState<Guest | null>(null);
  const [detailBusy, setDetailBusy] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);

  const [overlay, setOverlay] = useState<Overlay>(null);
  const [cameraBlocked, setCameraBlocked] = useState(false);
  const [scanKey, setScanKey] = useState(0); // remount scanner to resume
  const handledScan = useRef<string | null>(null);
  const overlayTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [checkedList, setCheckedList] = useState<Guest[]>([]);
  const [checkedTotal, setCheckedTotal] = useState(0);
  const [checkedQuery, setCheckedQuery] = useState("");
  const [checkedLoading, setCheckedLoading] = useState(false);

  const goLogin = useCallback(() => {
    setScreen("login");
    setCategory(null);
    setDetail(null);
    setOverlay(null);
    setResults([]);
    setSearched(false);
  }, []);

  const expired = useCallback(() => {
    goLogin();
    setLoginError("Session expired. Please log in again.");
  }, [goLogin]);

  // ---- boot: check existing session ----
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api("/api/check-in/session");
        setScreen(data.authenticated ? "categories" : "login");
      } catch {
        setScreen("login");
      }
    })();
  }, []);

  const loadCounts = useCallback(async () => {
    try {
      const { res, data } = await api("/api/check-in/counts");
      if (res.status === 401) {
        expired();
        return;
      }
      if (res.ok) setCounts(data);
    } catch {
      /* keep old counts; usher can retry by revisiting */
    }
  }, [expired]);

  // ---- poll counts on the category screen (multi-usher freshness) ----
  useEffect(() => {
    if (screen !== "categories") return;
    loadCounts();
    const id = setInterval(loadCounts, 15000);
    return () => clearInterval(id);
  }, [screen, loadCounts]);

  // ---- auto-dismiss success overlay back to the desk ----
  useEffect(() => {
    if (overlay?.kind === "success") {
      overlayTimer.current = setTimeout(() => {
        setOverlay(null);
        setDetail(null);
        setTab("search");
      }, 1600);
    }
    return () => {
      if (overlayTimer.current) clearTimeout(overlayTimer.current);
    };
  }, [overlay]);

  const doLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!password || loginBusy) return;
    setLoginBusy(true);
    setLoginError("");
    try {
      const { res, data } = await api("/api/check-in/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setPassword("");
        setScreen("categories");
      } else {
        setLoginError(data.error || "Incorrect password. Please try again.");
      }
    } catch {
      setLoginError("Network error. Please check connection and try again.");
    } finally {
      setLoginBusy(false);
    }
  };

  const doLogout = async () => {
    try {
      await api("/api/check-in/logout", { method: "POST" });
    } catch {
      /* fall through to login screen regardless */
    }
    goLogin();
  };

  const pickCategory = (c: CheckinCategory) => {
    setCategory(c);
    setTab("search");
    setQuery("");
    setResults([]);
    setSearched(false);
    setDetail(null);
    setOverlay(null);
    setCameraBlocked(false);
    handledScan.current = null;
    setScreen("desk");
    loadCounts();
  };

  const loadCheckedList = useCallback(async (search?: string, cat?: string) => {
    setCheckedLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("q", search);
      if (cat) params.set("category", cat);
      const qs = params.toString() ? `?${params.toString()}` : "";
      const { res, data } = await api(`/api/check-in/all-checked-in${qs}`);
      if (res.status === 401) { expired(); return; }
      if (res.ok) {
        setCheckedList(data.guests || []);
        setCheckedTotal(data.total || 0);
      }
    } catch { /* keep old list */ } finally {
      setCheckedLoading(false);
    }
  }, [expired]);

  const doSearch = async () => {
    if (!category || searching) return;
    const q = query.trim();
    if (q.length < 2) return;
    setSearching(true);
    setSearched(false);
    try {
      const { res, data } = await api(
        `/api/check-in/search?q=${encodeURIComponent(q)}&category=${category}`
      );
      if (res.status === 401) {
        expired();
        return;
      }
      if (!res.ok) throw new Error();
      const guests: Guest[] = data.guests || [];
      setResults(guests);
      setSearched(true);
      if (guests.length === 0) {
        setOverlay({
          kind: "notfound",
          message: "We couldn't find this guest in the selected guest category.",
        });
      }
    } catch {
      setOverlay({ kind: "notfound", message: "Something went wrong. Please try again." });
    } finally {
      setSearching(false);
    }
  };

  const openDetail = async (id: string) => {
    if (!category || detailBusy) return;
    setDetailBusy(true);
    try {
      const { res, data } = await api(`/api/check-in/guest?id=${encodeURIComponent(id)}&category=${category}`);
      if (res.status === 401) {
        expired();
        return;
      }
      if (res.status === 409) {
        setOverlay({ kind: "mismatch", guestName: "", actualCategory: data.actualCategory || "" });
        return;
      }
      if (!res.ok || !data.guest) throw new Error();
      setDetail(data.guest);
    } catch {
      setOverlay({ kind: "notfound", message: "Something went wrong. Please try again." });
    } finally {
      setDetailBusy(false);
    }
  };

  const doCheckIn = async () => {
    if (!category || !detail || checkingIn) return;
    setCheckingIn(true);
    try {
      const { res, data } = await api("/api/check-in/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: detail.id, category }),
      });
      if (res.status === 401) {
        expired();
        return;
      }
      if (res.status === 409) {
        setOverlay({
          kind: "mismatch",
          guestName: detail.name,
          actualCategory: data.actualCategory || "",
        });
        return;
      }
      if (res.status === 404) {
        setOverlay({
          kind: "notfound",
          message: "We couldn't find this guest in the selected guest category.",
        });
        return;
      }
      if (!res.ok) throw new Error();
      const g: Guest = data.guest;
      if (data.already) {
        setOverlay({ kind: "already", guest: g });
      } else {
        setOverlay({ kind: "success", guest: g, time: g.checkInTime });
      }
      loadCounts();
      // Refresh the visible list so the card flips to checked-in immediately.
      if (searched && query.trim().length >= 2) {
        const { res: r2, data: d2 } = await api(
          `/api/check-in/search?q=${encodeURIComponent(query.trim())}&category=${category}`
        );
        if (r2.ok) setResults(d2.guests || []);
      }
    } catch {
      setOverlay({ kind: "notfound", message: "Something went wrong. Please try again." });
    } finally {
      setCheckingIn(false);
    }
  };

  const handleScan = async (text: string) => {
    if (!category || handledScan.current === text) return;
    handledScan.current = text;
    try {
      const { res, data } = await api(`/api/check-in/lookup?code=${encodeURIComponent(text)}`);
      if (res.status === 401) {
        expired();
        return;
      }
      if (res.status === 404 || !data.guest) {
        setOverlay({
          kind: "notfound",
          message: "This invitation could not be matched to a registered guest.",
        });
        return;
      }
      const g: Guest = data.guest;
      if (g.category !== category) {
        setOverlay({ kind: "mismatch", guestName: g.name, actualCategory: g.category });
        return;
      }
      setDetail(g);
    } catch {
      setOverlay({ kind: "notfound", message: "Something went wrong. Please try again." });
    }
  };

  const retryScan = () => {
    handledScan.current = null;
    setOverlay(null);
    setScanKey((k) => k + 1);
  };

  const backToDesk = () => {
    setOverlay(null);
    setDetail(null);
    if (tab === "scan") retryScan();
  };

  const catCount = (c: string) => counts?.categories.find((x) => x.category === c);

  /* ================= RENDER ================= */

  if (screen === "loading") {
    return (
      <div className="min-h-dvh bg-[#FBF9F4] flex items-center justify-center">
        <p className="text-[#0E281E]/60 tracking-[0.2em] text-xs uppercase">Loading…</p>
      </div>
    );
  }

  // ---------- LOGIN ----------
  if (screen === "login") {
    return (
      <div className="min-h-dvh bg-[#FBF9F4] text-[#0E281E] flex flex-col overflow-x-hidden">
        <div className="flex-1 flex flex-col items-center justify-center px-6 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] w-full max-w-md mx-auto">
          <p className="text-xs uppercase tracking-[0.35em] text-[#C5A059] mb-3">Anuoluwapo &amp; Tochukwu</p>
          <h1 className="text-3xl font-serif mb-1">Guest Check-in</h1>
          <p className="text-sm text-[#0E281E]/60 mb-8">Enter usher password</p>
          <form onSubmit={doLogin} className="w-full space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoComplete="current-password"
              className={`${inputCls} text-center tracking-[0.2em]`}
            />
            {loginError && (
              <p className="text-center text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-4 py-3">
                {loginError}
              </p>
            )}
            <button
              type="submit"
              disabled={loginBusy || !password}
              className="w-full h-14 rounded-md bg-[#0E281E] text-[#FBF9F4] text-sm uppercase tracking-[0.2em] font-medium border border-[#C5A059]/40 disabled:opacity-50 touch-manipulation active:scale-[0.99]"
            >
              {loginBusy ? "Checking…" : "Enter Check-in"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const header = (
    <div className="pt-[env(safe-area-inset-top)] bg-[#0E281E] text-[#FBF9F4] border-b border-[#C5A059]/40">
      <div className="px-5 pt-4 pb-3 flex items-center justify-between max-w-md mx-auto w-full">
        <div>
          <p className="text-[0.6rem] uppercase tracking-[0.3em] text-[#C5A059]">Anuoluwapo &amp; Tochukwu</p>
          <p className="text-lg font-serif">Guest Check-in</p>
        </div>
        <button
          onClick={doLogout}
          className="h-10 px-4 rounded-md border border-[#C5A059]/50 text-xs uppercase tracking-[0.15em] text-[#FBF9F4]/90 touch-manipulation active:scale-[0.97]"
        >
          Log out
        </button>
      </div>
    </div>
  );

  // ---------- CATEGORY SELECTION ----------
  if (screen === "categories") {
    return (
      <div className="min-h-dvh bg-[#FBF9F4] text-[#0E281E] flex flex-col overflow-x-hidden">
        {header}
        <div className="flex-1 w-full max-w-md mx-auto px-5 py-6 pb-[env(safe-area-inset-bottom)]">
          <p className="text-xs uppercase tracking-[0.25em] text-[#0E281E]/60 mb-4 text-center">
            Select guest category
          </p>
          <div className="space-y-3">
            {CHECKIN_CATEGORIES.map((c) => {
              const n = catCount(c.value);
              return (
                <button
                  key={c.value}
                  onClick={() => pickCategory(c.value)}
                  className="w-full min-h-[5.5rem] p-5 rounded-lg bg-[#0E281E] text-[#FBF9F4] border border-[#C5A059]/50 text-left touch-manipulation active:scale-[0.99]"
                >
                  <span className="block text-base font-medium uppercase tracking-[0.12em]">{c.label}</span>
                  <span className="block mt-1 text-sm text-[#FBF9F4]/70">
                    {n ? `${n.checkedIn} checked in · ${n.registered} registered` : "Tap to open this list"}
                  </span>
                </button>
              );
            })}
          </div>
          {counts && (
            <button
              onClick={() => {
                setScreen("allchecked");
                loadCheckedList();
              }}
              className="mt-5 p-4 rounded-lg bg-white border border-[#0E281E]/10 text-center w-full touch-manipulation active:scale-[0.99]"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-[#0E281E]/60">Total checked in</p>
              <p className="text-3xl font-serif mt-1">{counts.totalCheckedIn}</p>
              <p className="text-xs text-[#C5A059] mt-1 uppercase tracking-wider">View all guests ›</p>
            </button>
          )}
        </div>
      </div>
    );
  }

  // ---------- ALL CHECKED-IN LIST ----------
  if (screen === "allchecked") {
    return (
      <div className="min-h-dvh bg-[#FBF9F4] text-[#0E281E] flex flex-col overflow-x-hidden">
        {header}
        <div className="flex-1 w-full max-w-md mx-auto px-5 py-4 pb-[env(safe-area-inset-bottom)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-[#0E281E]/60">All checked-in guests</p>
              <p className="text-2xl font-serif mt-0.5">{checkedTotal}</p>
            </div>
            <button
              onClick={() => { setScreen("categories"); loadCounts(); }}
              className="h-10 px-4 rounded-md border border-[#0E281E]/20 text-xs uppercase tracking-[0.15em] text-[#0E281E]/70 touch-manipulation active:scale-[0.97]"
            >
              Back
            </button>
          </div>
          <div className="flex gap-2 mb-4">
            <input
              value={checkedQuery}
              onChange={(e) => setCheckedQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && loadCheckedList(checkedQuery)}
              placeholder="Search by name, phone, or category"
              className={inputCls}
            />
            <button
              onClick={() => loadCheckedList(checkedQuery)}
              disabled={checkedLoading}
              className="shrink-0 h-14 px-5 rounded-md bg-[#0E281E] text-[#FBF9F4] text-sm uppercase tracking-[0.12em] font-medium border border-[#C5A059]/40 disabled:opacity-50 touch-manipulation active:scale-[0.98]"
            >
              {checkedLoading ? "…" : "Go"}
            </button>
          </div>
          <button
            onClick={() => loadCheckedList(checkedQuery)}
            className="w-full text-right text-xs text-[#C5A059] uppercase tracking-wider mb-3"
          >
            Refresh
          </button>
          {checkedList.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-[#0E281E]/40 text-sm">No guests checked in yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {checkedList.map((g) => (
                <div
                  key={g.id}
                  className="p-4 rounded-lg bg-white border border-[#0E281E]/15"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-base font-medium truncate">{g.name}</p>
                      <p className="text-xs uppercase tracking-[0.15em] text-[#C5A059] mt-0.5">
                        {checkinCategoryLabel(g.category)}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-1">
                      ✓ In
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-[#0E281E]/60 space-y-0.5">
                    {g.contact && <p>{g.contact}</p>}
                    {g.code && <p className="font-mono">{g.code}</p>}
                    {g.checkInTime && (
                      <p>Checked in at {formatTime(g.checkInTime)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ---------- CHECK-IN DESK ----------
  const activeLabel = category ? checkinCategoryLabel(category) : "";
  const activeCheckedIn = category ? catCount(category)?.checkedIn : undefined;

  return (
    <div className="min-h-dvh bg-[#FBF9F4] text-[#0E281E] flex flex-col overflow-x-hidden">
      {header}

      {/* Active category banner */}
      <div className="bg-[#0E281E] text-[#FBF9F4] border-t border-[#C5A059]/20">
        <div className="px-5 py-3 max-w-md mx-auto w-full flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[0.6rem] uppercase tracking-[0.25em] text-[#C5A059]">Guest category</p>
            <p className="text-base font-medium truncate">{activeLabel}</p>
            <p className="text-sm text-[#FBF9F4]/70">
              Checked in: {activeCheckedIn !== undefined ? activeCheckedIn : "…"}
            </p>
          </div>
          <button
            onClick={() => {
              setScreen("categories");
              setDetail(null);
              setOverlay(null);
              loadCounts();
            }}
            className="shrink-0 h-11 px-4 rounded-md border border-[#C5A059]/60 text-xs uppercase tracking-[0.15em] touch-manipulation active:scale-[0.97]"
          >
            Change
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-5 pt-4 max-w-md mx-auto w-full">
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-lg bg-[#0E281E]/5 border border-[#0E281E]/10">
          {(["search", "scan", "checked"] as DeskTab[]).map((t) => (
            <button
              key={t}
              onClick={() => {
                setTab(t);
                setOverlay(null);
                if (t === "scan") {
                  handledScan.current = null;
                  setCameraBlocked(false);
                  setScanKey((k) => k + 1);
                }
                if (t === "checked") {
                  loadCheckedList("", category || undefined);
                  loadCounts();
                }
              }}
              className={`h-12 rounded-md text-xs uppercase tracking-[0.1em] font-medium touch-manipulation ${
                tab === t ? "bg-[#0E281E] text-[#FBF9F4]" : "text-[#0E281E]/60"
              }`}
            >
              {t === "search" ? "Search" : t === "scan" ? "Scan QR" : `Checked (${counts?.totalCheckedIn ?? "…"})`}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 w-full max-w-md mx-auto px-5 py-4 pb-[env(safe-area-inset-bottom)]">
        {tab === "search" && !detail && (
          <>
            <div className="flex gap-2">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && doSearch()}
                placeholder="Name, phone, or code"
                enterKeyHint="search"
                className={inputCls}
              />
              <button
                onClick={doSearch}
                disabled={searching || query.trim().length < 2}
                className="shrink-0 h-14 px-5 rounded-md bg-[#0E281E] text-[#FBF9F4] text-sm uppercase tracking-[0.12em] font-medium border border-[#C5A059]/40 disabled:opacity-50 touch-manipulation active:scale-[0.98]"
              >
                {searching ? "…" : "Go"}
              </button>
            </div>

            {searched && results.length > 0 && (
              <div className="mt-4 space-y-2">
                {results.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => openDetail(g.id)}
                    className="w-full p-4 rounded-lg bg-white border border-[#0E281E]/15 text-left touch-manipulation active:scale-[0.99]"
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="text-lg font-medium truncate">{g.name}</span>
                      {g.checkInStatus === "checked_in" ? (
                        <span className="shrink-0 text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-1">
                          ✓ In
                        </span>
                      ) : (
                        <span className="shrink-0 text-xs uppercase tracking-wider text-[#0E281E]/50">View guest ›</span>
                      )}
                    </span>
                    <span className="block mt-1 text-xs uppercase tracking-[0.15em] text-[#C5A059]">
                      {checkinCategoryLabel(g.category)}
                    </span>
                    <span className="block mt-0.5 text-xs text-[#0E281E]/60">
                      {g.rsvpStatus === "accepted" ? "RSVP Confirmed" : g.rsvpStatus === "declined" ? "Declined" : "RSVP Pending"}
                      {g.code ? ` · ${g.code}` : ""}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {tab === "scan" && !detail && (
          <div>
            {!cameraBlocked ? (
              <QrScanner
                key={scanKey}
                onScan={handleScan}
                onCameraError={() => setCameraBlocked(true)}
              />
            ) : (
              <div className="p-5 rounded-lg bg-white border border-[#0E281E]/15 text-center">
                <p className="font-medium">Camera unavailable</p>
                <p className="mt-1 text-sm text-[#0E281E]/60">
                  Please allow camera access, or search for the guest instead.
                </p>
                <button
                  onClick={() => setTab("search")}
                  className="mt-4 w-full h-13 min-h-[3.25rem] rounded-md bg-[#0E281E] text-[#FBF9F4] text-sm uppercase tracking-[0.15em] font-medium touch-manipulation active:scale-[0.99]"
                >
                  Search guest instead
                </button>
              </div>
            )}
            <p className="mt-3 text-center text-xs text-[#0E281E]/50">
              Point the camera at the guest&apos;s invitation code
            </p>
          </div>
        )}

        {tab === "checked" && !detail && (
          <div>
            <div className="flex gap-2 mb-4">
              <input
                value={checkedQuery}
                onChange={(e) => setCheckedQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && loadCheckedList(checkedQuery, category || undefined)}
                placeholder="Search checked-in guests"
                className={inputCls}
              />
              <button
                onClick={() => loadCheckedList(checkedQuery, category || undefined)}
                disabled={checkedLoading}
                className="shrink-0 h-14 px-5 rounded-md bg-[#0E281E] text-[#FBF9F4] text-sm uppercase tracking-[0.12em] font-medium border border-[#C5A059]/40 disabled:opacity-50 touch-manipulation active:scale-[0.98]"
              >
                {checkedLoading ? "…" : "Go"}
              </button>
            </div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs uppercase tracking-[0.2em] text-[#0E281E]/60">
                {checkedTotal} guest{checkedTotal !== 1 ? "s" : ""} checked in
              </p>
              <button
                onClick={() => loadCheckedList(checkedQuery, category || undefined)}
                className="text-xs text-[#C5A059] uppercase tracking-wider"
              >
                Refresh
              </button>
            </div>
            {checkedList.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-[#0E281E]/40 text-sm">No guests checked in yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {checkedList.map((g) => (
                  <div
                    key={g.id}
                    className="p-4 rounded-lg bg-white border border-[#0E281E]/15"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-base font-medium truncate">{g.name}</p>
                        <p className="text-xs uppercase tracking-[0.15em] text-[#C5A059] mt-0.5">
                          {checkinCategoryLabel(g.category)}
                        </p>
                      </div>
                      <span className="shrink-0 text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-1">
                        ✓ In
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-[#0E281E]/60 space-y-0.5">
                      {g.contact && <p>{g.contact}</p>}
                      {g.code && <p className="font-mono">{g.code}</p>}
                      {g.checkInTime && (
                        <p>Checked in at {formatTime(g.checkInTime)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {detail && (
          <div className="rounded-lg bg-white border border-[#0E281E]/15 p-5">
            <p className="text-2xl font-serif">{detail.name}</p>
            <div className="mt-3 space-y-1.5 text-sm">
              <p>
                <span className="text-[#0E281E]/55">Guest category: </span>
                <span className="font-medium">{checkinCategoryLabel(detail.category)}</span>
              </p>
              <p>
                <span className="text-[#0E281E]/55">RSVP: </span>
                <span className="font-medium">{rsvpLabel(detail.rsvpStatus)}</span>
              </p>
              {detail.code && (
                <p>
                  <span className="text-[#0E281E]/55">Code: </span>
                  <span className="font-mono font-medium">{detail.code}</span>
                </p>
              )}
              {detail.checkInStatus === "checked_in" && detail.checkInTime && (
                <p>
                  <span className="text-[#0E281E]/55">Checked in at: </span>
                  <span className="font-medium">{formatTime(detail.checkInTime)}</span>
                </p>
              )}
            </div>
            {detail.checkInStatus === "checked_in" ? (
              <div className="mt-5 p-4 rounded-md bg-emerald-50 border border-emerald-200 text-center">
                <p className="font-medium text-emerald-900">✓ ALREADY CHECKED IN</p>
                {detail.checkInTime && (
                  <p className="text-sm text-emerald-900/70 mt-1">
                    Checked in at {formatTime(detail.checkInTime)}
                  </p>
                )}
              </div>
            ) : (
              <button
                onClick={doCheckIn}
                disabled={checkingIn}
                className="mt-5 w-full h-14 rounded-md bg-[#0E281E] text-[#FBF9F4] text-sm uppercase tracking-[0.2em] font-medium border border-[#C5A059]/40 disabled:opacity-60 touch-manipulation active:scale-[0.99]"
              >
                {checkingIn ? "Checking in…" : "Check in guest"}
              </button>
            )}
            <button
              onClick={backToDesk}
              className="mt-2 w-full h-12 rounded-md border border-[#0E281E]/20 text-sm uppercase tracking-[0.15em] text-[#0E281E]/70 touch-manipulation active:scale-[0.99]"
            >
              Back to check-in
            </button>
          </div>
        )}
      </div>

      {/* ---------- OVERLAYS ---------- */}
      {overlay?.kind === "success" && (
        <div className="fixed inset-0 z-50 bg-[#0E281E] text-[#FBF9F4] flex flex-col items-center justify-center px-8 text-center">
          <span className="w-16 h-16 rounded-full bg-[#C5A059] text-[#0E281E] text-3xl flex items-center justify-center">
            ✓
          </span>
          <p className="mt-5 text-xs uppercase tracking-[0.3em] text-[#C5A059]">Checked in</p>
          <p className="mt-2 text-3xl font-serif">{overlay.guest.name}</p>
          <p className="mt-1 text-sm text-[#FBF9F4]/70">{checkinCategoryLabel(overlay.guest.category)}</p>
          {overlay.time && (
            <p className="mt-1 text-sm text-[#FBF9F4]/70">Checked in at {formatTime(overlay.time)}</p>
          )}
        </div>
      )}

      {overlay?.kind === "already" && (
        <div className="fixed inset-0 z-50 bg-[#0E281E]/97 text-[#FBF9F4] flex flex-col items-center justify-center px-8 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-[#C5A059]">✓ Already checked in</p>
          <p className="mt-2 text-3xl font-serif">{overlay.guest.name}</p>
          <p className="mt-1 text-sm text-[#FBF9F4]/70">{checkinCategoryLabel(overlay.guest.category)}</p>
          {overlay.guest.checkInTime && (
            <p className="mt-1 text-sm text-[#FBF9F4]/70">Checked in at {formatTime(overlay.guest.checkInTime)}</p>
          )}
          <button
            onClick={backToDesk}
            className="mt-6 w-full max-w-xs h-13 min-h-[3.25rem] rounded-md border border-[#C5A059]/60 text-sm uppercase tracking-[0.15em] touch-manipulation active:scale-[0.99]"
          >
            Back to check-in
          </button>
        </div>
      )}

      {overlay?.kind === "mismatch" && (
        <div className="fixed inset-0 z-50 bg-[#0E281E]/97 text-[#FBF9F4] flex flex-col items-center justify-center px-8 text-center overflow-y-auto">
          <p className="text-xs uppercase tracking-[0.3em] text-red-300">Category mismatch</p>
          <p className="mt-3 text-sm text-[#FBF9F4]/80">This guest belongs to:</p>
          <p className="mt-1 text-xl font-medium text-[#C5A059]">
            {checkinCategoryLabel(overlay.actualCategory)}
          </p>
          <p className="mt-3 text-sm text-[#FBF9F4]/80">but you are currently checking in:</p>
          <p className="mt-1 text-xl font-medium">{category ? checkinCategoryLabel(category) : ""}</p>
          <p className="mt-3 text-sm text-[#FBF9F4]/70">Please select the correct guest category.</p>
          <button
            onClick={() => {
              setOverlay(null);
              setDetail(null);
              setScreen("categories");
              loadCounts();
            }}
            className="mt-6 w-full max-w-xs h-13 min-h-[3.25rem] rounded-md bg-[#C5A059] text-[#0E281E] text-sm uppercase tracking-[0.15em] font-medium touch-manipulation active:scale-[0.99]"
          >
            Change category
          </button>
          <button
            onClick={backToDesk}
            className="mt-2 w-full max-w-xs h-12 rounded-md border border-[#FBF9F4]/30 text-sm uppercase tracking-[0.15em] text-[#FBF9F4]/80 touch-manipulation active:scale-[0.99]"
          >
            Back
          </button>
        </div>
      )}

      {overlay?.kind === "notfound" && (
        <div className="fixed inset-0 z-50 bg-[#0E281E]/97 text-[#FBF9F4] flex flex-col items-center justify-center px-8 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-[#C5A059]">Guest not found</p>
          <p className="mt-3 text-sm text-[#FBF9F4]/80 max-w-xs">{overlay.message}</p>
          <button
            onClick={backToDesk}
            className="mt-6 w-full max-w-xs h-13 min-h-[3.25rem] rounded-md bg-[#C5A059] text-[#0E281E] text-sm uppercase tracking-[0.15em] font-medium touch-manipulation active:scale-[0.99]"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  );
}
