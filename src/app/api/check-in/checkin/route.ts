import { NextRequest, NextResponse } from "next/server";
import { requireUsher } from "@/lib/checkin-auth";
import { isCheckinCategory } from "@/lib/checkin-categories";
import { getSupabaseServer } from "@/lib/supabase";

const GENERIC = "Something went wrong. Please try again.";

export async function POST(req: NextRequest) {
  try {
    if (!(await requireUsher())) {
      return NextResponse.json({ error: "Session expired. Please log in again." }, { status: 401 });
    }
    const body = await req.json().catch(() => null);
    const id = typeof body?.id === "string" ? body.id.trim() : "";
    const category = body?.category;

    if (!id || !isCheckinCategory(category)) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    const supabase = getSupabaseServer();
    const nowIso = new Date().toISOString();

    // Probe once to see if check-in columns exist
    const probe = await supabase
      .from("invitations")
      .select("id")
      .eq("rsvp_category", category)
      .eq("is_active", true)
      .limit(1);
    const hasCheckIn = !probe.error || !String(probe.error?.message || "").includes("check_in_status");

    // Fetch the guest
    let row: any = null;
    if (hasCheckIn) {
      const { data } = await supabase
        .from("invitations")
        .select("id, guest_name, guest_contact, rsvp_category, rsvp_status, invitation_token, check_in_status, check_in_time")
        .eq("id", id)
        .eq("is_active", true)
        .maybeSingle();
      row = data;
    } else {
      const { data } = await supabase
        .from("invitations")
        .select("id, guest_name, guest_contact, rsvp_category, rsvp_status, invitation_token")
        .eq("id", id)
        .eq("is_active", true)
        .maybeSingle();
      row = data;
    }

    if (!row) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    if (row.rsvp_category !== category) {
      return NextResponse.json(
        { error: "category_mismatch", actualCategory: row.rsvp_category },
        { status: 409 }
      );
    }

    // Already checked in?
    const alreadyIn = hasCheckIn
      ? row.check_in_status === "checked_in"
      : row.rsvp_status === "accepted";

    if (alreadyIn) {
      return NextResponse.json({
        already: true,
        guest: {
          id: row.id,
          name: row.guest_name,
          category: row.rsvp_category,
          rsvpStatus: row.rsvp_status,
          checkInStatus: "checked_in",
          checkInTime: row.check_in_time || null,
          code: null,
        },
      });
    }

    if (hasCheckIn) {
      // Atomic update: only succeeds if still not_checked_in
      const { data: updated, error: updateErr } = await supabase
        .from("invitations")
        .update({ check_in_status: "checked_in", check_in_time: nowIso, checked_in_by: "usher" })
        .eq("id", id)
        .eq("rsvp_category", category)
        .eq("check_in_status", "not_checked_in")
        .select("id, guest_name, guest_contact, rsvp_category, rsvp_status, check_in_status, check_in_time");

      if (updateErr || !updated || updated.length === 0) {
        const { data: current } = await supabase
          .from("invitations")
          .select("id, guest_name, guest_contact, rsvp_category, rsvp_status, check_in_status, check_in_time")
          .eq("id", id)
          .maybeSingle();
        if (current && (current as any).check_in_status === "checked_in") {
          return NextResponse.json({ already: true, guest: { ...(current as any), checkInStatus: "checked_in", code: null } });
        }
        console.error("check-in update error:", updateErr);
        return NextResponse.json({ error: GENERIC }, { status: 500 });
      }
      return NextResponse.json({
        checkedIn: true,
        guest: {
          ...updated[0],
          checkInStatus: "checked_in",
          checkInTime: nowIso,
          code: null,
        },
      });
    } else {
      // Fallback: no check-in columns yet → mark as accepted
      const { error: updateErr } = await supabase
        .from("invitations")
        .update({ rsvp_status: "accepted" })
        .eq("id", id)
        .eq("rsvp_category", category);
      if (updateErr) {
        console.error("fallback update error:", updateErr);
        return NextResponse.json({ error: GENERIC }, { status: 500 });
      }
      return NextResponse.json({
        checkedIn: true,
        guest: {
          id: row.id,
          name: row.guest_name,
          contact: row.guest_contact,
          category: row.rsvp_category,
          rsvpStatus: "accepted",
          checkInStatus: "checked_in",
          checkInTime: nowIso,
          code: null,
        },
      });
    }
  } catch (e) {
    console.error("check-in failed:", e);
    return NextResponse.json({ error: GENERIC }, { status: 500 });
  }
}
