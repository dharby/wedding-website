"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RSVP_CATEGORIES, rsvpCategoryLabel, isRSVPCategory, type RSVPCategory } from "@/lib/types";

interface Guest {
  id: string;
  guest_name: string;
  invitation_token: string;
  rsvp_status: string;
  rsvp_category: string | null;
  rsvp_id: string | null;
  reference_number: string | null;
}

interface Form {
  name: string;
  contact: string;
  attending: "" | "yes" | "no";
  category: "" | RSVPCategory;
  notes: string;
}

interface Errors {
  name?: string;
  contact?: string;
  attending?: string;
  category?: string;
}

const reveal = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

export default function RSVP() {
  const [step, setStep] = useState<"search" | "form" | "result">("search");
  const [searchName, setSearchName] = useState("");
  const [searchResults, setSearchResults] = useState<Guest[]>([]);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [isNewGuest, setIsNewGuest] = useState(false);
  const [form, setForm] = useState<Form>({ name: "", contact: "", attending: "", category: "", notes: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<"accepted" | "declined" | null>(null);
  const [refNum, setRefNum] = useState("");
  const [error, setError] = useState("");
  const [searching, setSearching] = useState(false);
  const [isExistingRsvp, setIsExistingRsvp] = useState(false);
  const [categoryConfirming, setCategoryConfirming] = useState<RSVPCategory | null>(null);

  const searchGuests = async () => {
    if (searchName.trim().length < 2) {
      setError("Please enter at least 2 characters");
      return;
    }
    setSearching(true);
    setError("");
    setSearchResults([]);

    try {
      const response = await fetch(`/api/guests/search?name=${encodeURIComponent(searchName.trim())}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Search failed");
      }

      if (data.guests.length === 0) {
        setError("No guest found with that name. Please contact the couple.");
      } else {
        setSearchResults(data.guests);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setSearching(false);
    }
  };

  const selectGuest = (guest: Guest) => {
    setSelectedGuest(guest);
    setIsNewGuest(false);
    // If guest already RSVP'd, show their existing result directly
    if (guest.rsvp_status === "accepted" || guest.rsvp_status === "declined") {
      setIsExistingRsvp(true);
      setForm((p) => ({
        ...p,
        category: isRSVPCategory(guest.rsvp_category) ? guest.rsvp_category : "",
        attending: guest.rsvp_status === "accepted" ? "yes" : "no",
      }));
      setRefNum(guest.reference_number || guest.invitation_token || "");
      setResult(guest.rsvp_status === "accepted" ? "accepted" : "declined");
      setStep("result");
      return;
    }
    setIsExistingRsvp(false);
    // Preselect the guest's existing list; they can still change it.
    setForm((p) => ({ ...p, category: isRSVPCategory(guest.rsvp_category) ? guest.rsvp_category : "" }));
    setStep("form");
    setError("");
  };

  const continueAsNewGuest = () => {
    setSelectedGuest(null);
    setIsNewGuest(true);
    setForm((p) => ({ ...p, category: "" }));
    setStep("form");
    setError("");
  };

  // Auto-open new guest form when URL hash is #rsvp=new
  useEffect(() => {
    const checkHash = () => {
      if (window.location.hash === "#rsvp=new") {
        continueAsNewGuest();
        window.history.replaceState(null, "", "#rsvp");
      }
    };
    checkHash();
    window.addEventListener("hashchange", checkHash);
    return () => window.removeEventListener("hashchange", checkHash);
  }, []);

  const validate = (): boolean => {
    const e: Errors = {};
    if (isNewGuest) {
      const nameParts = form.name.trim().split(/\s+/).filter(Boolean);
      if (!form.name.trim()) {
        e.name = "Please enter your full name";
      } else if (nameParts.length < 2) {
        e.name = "Please enter your first name and last name";
      }
    }
    if (!form.category) e.category = "Please choose who you are registering under";
    if (!form.contact.trim()) e.contact = "Please enter your email or phone number";
    if (!form.attending) e.attending = "Please let us know if you can make it";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate() || (!selectedGuest && !isNewGuest)) return;
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invitation_id: selectedGuest ? selectedGuest.id : null,
          guest_name: isNewGuest ? form.name.trim() : selectedGuest?.guest_name,
          guest_contact: form.contact,
          attendance: form.attending,
          rsvp_category: form.category,
          guest_count: 1,
          meal_preference: null,
          message: form.notes || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit RSVP");
      }

      setRefNum(data.reference_number);
      setResult(form.attending === "yes" ? "accepted" : "declined");
      setStep("result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const update = (field: keyof Form, value: string) => {
    setForm((p) => ({ ...p, [field]: value }));
    if (errors[field as keyof Errors]) setErrors((p) => ({ ...p, [field]: undefined }));
  };

  return (
    <section id="rsvp" className="py-16 md:py-24 bg-cream">
      <div className="max-w-2xl mx-auto px-5">
        <motion.div
          custom={0}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={reveal}
          className="text-center mb-10 md:mb-14"
        >
          <p className="text-[0.85rem] sm:text-[0.9rem] font-script text-gold/70 tracking-wide mb-3">
            We would love to have you
          </p>
          <h2 className="text-[2rem] sm:text-[2.2rem] font-serif font-light text-emerald mb-2">
            Will you celebrate with us?
          </h2>
          <div className="flex items-center justify-center gap-4 mb-4">
            <span className="w-10 h-px bg-gold/30" />
            <span className="w-1.5 h-1.5 rounded-full bg-gold/40" />
            <span className="w-10 h-px bg-gold/30" />
          </div>
          <p className="text-[0.85rem] sm:text-[0.9rem] text-ink-muted font-sans max-w-md mx-auto leading-relaxed">
            Search for your name — or RSVP as a new guest if you&apos;re not listed.
          </p>
          <div className="mt-4 max-w-md mx-auto p-3 bg-gold/10 border border-gold/40 rounded-[2px]">
            <p className="text-[0.7rem] sm:text-[0.75rem] text-ink-soft font-sans leading-relaxed">
              🔒 This website is a private invitation for intended guests only. Please do not share or forward it to anyone.
            </p>
          </div>
          <div className="mt-3 max-w-md mx-auto p-3 bg-emerald/5 border border-emerald/20 rounded-[2px]">
            <p className="text-[0.7rem] sm:text-[0.75rem] text-ink-soft font-sans leading-relaxed">
              ⚠️ Each guest can only RSVP <strong>once</strong>. Please ensure your details are correct before submitting.
            </p>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* STEP 1: Search */}
          {step === "search" && (
            <motion.div
              key="search"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div>
                <label className="block text-[0.7rem] sm:text-[0.75rem] uppercase tracking-[0.18em] font-sans text-ink-muted mb-1.5">
                  Search Your Name *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && searchGuests()}
                    placeholder="Enter your full name"
                    className="flex-1 h-12 px-4 bg-white border border-sage-border/60 rounded-[2px] text-[0.95rem] font-sans text-ink placeholder:text-ink-muted/40 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={searchGuests}
                    disabled={searching}
                    className="h-12 px-6 bg-emerald text-cream text-[0.8rem] uppercase tracking-[0.15em] font-sans font-medium border border-gold/30 rounded-[2px] transition-all duration-300 hover:bg-emerald-mid disabled:opacity-50"
                  >
                    {searching ? "Searching..." : "Search"}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-[2px] text-center">
                  <p className="text-[0.85rem] text-red-600 font-sans">{error}</p>
                </div>
              )}

              <div className="text-center">
                <button
                  type="button"
                  onClick={continueAsNewGuest}
                  className="text-[0.75rem] text-gold/80 font-sans underline hover:text-gold"
                >
                  Can&apos;t find your name? RSVP as a new guest
                </button>
              </div>

              {searchResults.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[0.7rem] sm:text-[0.75rem] uppercase tracking-[0.15em] text-ink-muted/60 font-sans">
                    Select your name:
                  </p>
                  {searchResults.map((guest) => (
                    <button
                      key={guest.id}
                      type="button"
                      onClick={() => selectGuest(guest)}
                      className="w-full p-4 bg-white border border-sage-border/60 rounded-[2px] text-left transition-all duration-300 hover:border-emerald hover:bg-emerald/5"
                    >
                      <p className="text-[0.95rem] font-serif text-emerald font-medium">
                        {guest.guest_name}
                      </p>
                      <p className="text-[0.65rem] uppercase tracking-[0.15em] text-gold/80 font-sans mt-1">
                        {rsvpCategoryLabel(guest.rsvp_category)}
                      </p>
                      {guest.rsvp_status !== "pending" && (
                        <p className="text-[0.7rem] text-gold/70 font-sans mt-1">
                          Already RSVP&apos;d: {guest.rsvp_status === "accepted" ? "Attending" : "Not Attending"} — tap to view access card
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 2: RSVP Form */}
          {step === "form" && (selectedGuest || isNewGuest) && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="mb-6 p-4 bg-emerald/5 border border-emerald/20 rounded-[2px] text-center">
                <p className="text-[0.7rem] sm:text-[0.75rem] uppercase tracking-[0.15em] text-ink-muted/60 font-sans mb-1">
                  {isNewGuest ? "New Guest RSVP" : "Guest Found"}
                </p>
                {!isNewGuest && selectedGuest && (
                  <p className="text-[1.1rem] font-serif text-emerald font-medium">
                    {selectedGuest.guest_name}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => { setStep("search"); setSelectedGuest(null); setIsNewGuest(false); setSearchResults([]); setForm((p) => ({ ...p, category: "" })); setCategoryConfirming(null); }}
                  className="mt-2 text-[0.7rem] text-gold/70 font-sans underline hover:text-gold"
                >
                  Not you? Search again
                </button>
              </div>

              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-[2px] text-center">
                  <p className="text-[0.85rem] text-red-600 font-sans">{error}</p>
                </div>
              )}

              <form onSubmit={submit} className="space-y-5" noValidate>
                <div>
                  <label className="block text-[0.7rem] sm:text-[0.75rem] uppercase tracking-[0.18em] font-sans text-ink-muted mb-2">
                    Who are you registering under? *
                  </label>
                  <div className="space-y-2">
                    {RSVP_CATEGORIES.map((cat) => (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => setCategoryConfirming(cat.value)}
                        className={`w-full p-3 rounded-[2px] text-left border transition-all duration-300 ${
                          form.category === cat.value
                            ? "bg-emerald text-cream border-gold/40"
                            : "bg-white text-ink-soft border-sage-border/60 hover:border-emerald-soft/40"
                        }`}
                      >
                        <p className={`text-[0.85rem] font-sans font-semibold tracking-wide ${form.category === cat.value ? "text-cream" : "text-emerald"}`}>
                          {cat.label}
                        </p>
                        <p className={`text-[0.7rem] font-sans mt-0.5 ${form.category === cat.value ? "text-cream/70" : "text-ink-muted/70"}`}>
                          {cat.detail}
                        </p>
                      </button>
                    ))}
                  </div>
                  {errors.category && <p className="mt-1 text-[0.7rem] text-red-500 font-sans">{errors.category}</p>}
                </div>
                {isNewGuest && (
                  <div>
                    <label className="block text-[0.7rem] sm:text-[0.75rem] uppercase tracking-[0.18em] font-sans text-ink-muted mb-1.5">
                      Your First & Last Name *
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => update("name", e.target.value)}
                      placeholder="e.g. Ada Okonkwo"
                      className={`w-full h-12 px-4 bg-white border ${errors.name ? "border-red-400" : "border-sage-border/60"} rounded-[2px] text-[0.95rem] font-sans text-ink placeholder:text-ink-muted/40 transition-colors`}
                    />
                    {errors.name && <p className="mt-1 text-[0.7rem] text-red-500 font-sans">{errors.name}</p>}
                  </div>
                )}
                <div>
                  <label className="block text-[0.7rem] sm:text-[0.75rem] uppercase tracking-[0.18em] font-sans text-ink-muted mb-1.5">
                    Email or Phone Number *
                  </label>
                  <input
                    type="text"
                    value={form.contact}
                    onChange={(e) => update("contact", e.target.value)}
                    placeholder="your@email.com or 0801 234 5678"
                    className={`w-full h-12 px-4 bg-white border ${errors.contact ? "border-red-400" : "border-sage-border/60"} rounded-[2px] text-[0.95rem] font-sans text-ink placeholder:text-ink-muted/40 transition-colors`}
                  />
                  {errors.contact && <p className="mt-1 text-[0.7rem] text-red-500 font-sans">{errors.contact}</p>}
                </div>

                <div>
                  <label className="block text-[0.7rem] sm:text-[0.75rem] uppercase tracking-[0.18em] font-sans text-ink-muted mb-2">
                    Will you be attending? *
                  </label>
                  <div className="flex gap-3">
                    {[
                      { val: "yes", label: "Yes, I'll Be There" },
                      { val: "no", label: "No, Unfortunately I Can't" },
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() => update("attending", opt.val)}
                        className={`flex-1 h-12 rounded-[2px] text-[0.75rem] sm:text-[0.8rem] uppercase tracking-[0.12em] font-sans font-medium border transition-all duration-400 ${
                          form.attending === opt.val
                            ? "bg-emerald text-cream border-gold/30"
                            : "bg-white text-ink-soft/70 border-sage-border/60 hover:border-emerald-soft/40"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  {errors.attending && <p className="mt-1 text-[0.7rem] text-red-500 font-sans">{errors.attending}</p>}
                </div>

                <div>
                  <label className="block text-[0.7rem] sm:text-[0.75rem] uppercase tracking-[0.18em] font-sans text-ink-muted mb-1.5">
                    Optional Message
                  </label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => update("notes", e.target.value)}
                    rows={3}
                    placeholder="Leave a message for the couple..."
                    className="w-full px-4 py-3 bg-white border border-sage-border/60 rounded-[2px] text-[0.95rem] font-sans text-ink placeholder:text-ink-muted/40 transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-12 bg-emerald text-cream text-[0.8rem] sm:text-[0.85rem] uppercase tracking-[0.2em] font-sans font-medium border border-gold/30 rounded-[3px] transition-all duration-300 hover:bg-emerald-mid hover:border-gold/50 hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <span className="inline-flex items-center gap-2">
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Sending...
                    </span>
                  ) : "Send RSVP"}
                </button>
              </form>
            </motion.div>
          )}

          {/* Category Confirmation Overlay */}
          <AnimatePresence>
            {categoryConfirming && (
              <motion.div
                key="category-confirm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-5"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  className="bg-white rounded-[4px] border border-sage-border/40 shadow-xl max-w-sm w-full p-6 text-center"
                >
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gold/10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                    </svg>
                  </div>
                  <p className="text-[0.7rem] sm:text-[0.75rem] uppercase tracking-[0.15em] text-ink-muted/60 font-sans mb-2">
                    Confirm Your Category
                  </p>
                  <p className="text-[1rem] sm:text-[1.1rem] font-serif text-emerald font-medium mb-1">
                    {RSVP_CATEGORIES.find((c) => c.value === categoryConfirming)?.label}
                  </p>
                  <p className="text-[0.75rem] font-sans text-ink-muted/70 mb-5">
                    {RSVP_CATEGORIES.find((c) => c.value === categoryConfirming)?.detail}
                  </p>
                  <p className="text-[0.85rem] font-sans text-ink-soft mb-6 leading-relaxed">
                    Are you sure you want to register under <strong className="text-emerald">{RSVP_CATEGORIES.find((c) => c.value === categoryConfirming)?.label}</strong>?
                  </p>
                  <div className="flex flex-col gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        update("category", categoryConfirming);
                        setCategoryConfirming(null);
                      }}
                      className="w-full h-11 bg-emerald text-cream text-[0.75rem] sm:text-[0.8rem] uppercase tracking-[0.18em] font-sans font-medium border border-gold/30 rounded-[3px] transition-all duration-300 hover:bg-emerald-mid hover:border-gold/50"
                    >
                      Yes, I&apos;m Sure
                    </button>
                    <button
                      type="button"
                      onClick={() => setCategoryConfirming(null)}
                      className="w-full h-11 bg-white text-ink-soft text-[0.75rem] sm:text-[0.8rem] uppercase tracking-[0.18em] font-sans font-medium border border-sage-border/60 rounded-[3px] transition-all duration-300 hover:border-emerald-soft/40"
                    >
                      Cancel, Let Me Change
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* STEP 3: Result */}
          {step === "result" && result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="w-14 h-14 mx-auto mb-6 rounded-full bg-emerald flex items-center justify-center">
                <span className="text-cream text-xl">{result === "accepted" ? "✓" : "♥"}</span>
              </div>
              <h3 className="text-[1.5rem] sm:text-[1.5rem] font-serif text-emerald mb-2">
                {isExistingRsvp
                  ? `Welcome back, ${(isNewGuest ? form.name.trim().split(" ")[0] : selectedGuest?.guest_name.split(" ")[0])} ❤️`
                  : `Thank you, ${(isNewGuest ? form.name.trim().split(" ")[0] : selectedGuest?.guest_name.split(" ")[0])} ❤️`}
              </h3>
              <p className="text-[0.95rem] sm:text-[1.05rem] text-ink-soft font-sans mb-4 leading-relaxed">
                {isExistingRsvp
                  ? `You have already RSVP'd as "${result === "accepted" ? "Attending" : "Not Attending"}". Here are your access details.`
                  : result === "accepted"
                    ? "We cannot wait to celebrate with you."
                    : "You will be dearly missed, but we are grateful for your love and warm wishes."}
              </p>
              <div className="bg-white border border-sage-border/40 rounded-[2px] py-4 px-6 mb-4 inline-block">
                <p className="text-[0.7rem] sm:text-[0.75rem] uppercase tracking-[0.2em] text-ink-muted/60 font-sans mb-1">
                  Registered Under
                </p>
                <p className="text-[0.95rem] sm:text-[1.05rem] font-serif text-emerald font-medium mb-3">
                  {rsvpCategoryLabel(form.category)}
                </p>
                <p className="text-[0.7rem] sm:text-[0.75rem] uppercase tracking-[0.2em] text-ink-muted/60 font-sans mb-1">
                  Your Access Number
                </p>
                <p className="text-[1rem] sm:text-[1.25rem] font-serif text-emerald font-medium tracking-wide">
                  {refNum}
                </p>
              </div>
              <p className="text-[0.7rem] sm:text-[0.75rem] text-ink-muted/60 font-sans mb-4">
                Please present this access number at the entrance.
              </p>
              <p className="text-[0.7rem] sm:text-[0.75rem] text-ink-muted/50 font-sans mb-6">
                This invitation admits one guest only. Plus-ones are not permitted.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
                <button
                  type="button"
                  onClick={async () => {
                    const W = 800;
                    const H = 500;
                    const canvas = document.createElement("canvas");
                    canvas.width = W * 3;
                    canvas.height = H * 3;
                    const ctx = canvas.getContext("2d");
                    if (!ctx) return;
                    ctx.scale(3, 3);

                    // Background
                    ctx.fillStyle = "#FBF9F4";
                    ctx.fillRect(0, 0, W, H);

                    // Border
                    ctx.strokeStyle = "#2D5A3D";
                    ctx.lineWidth = 4;
                    ctx.strokeRect(12, 12, W - 24, H - 24);

                    // Inner border
                    ctx.strokeStyle = "#C5A05940";
                    ctx.lineWidth = 1;
                    ctx.strokeRect(20, 20, W - 40, H - 40);

                    // Header label
                    ctx.fillStyle = "#C5A059";
                    ctx.font = "600 11px sans-serif";
                    ctx.textAlign = "center";
                    ctx.letterSpacing = "4px";
                    ctx.fillText("WEDDING INVITATION", W / 2, 55);

                    // Couple names
                    ctx.fillStyle = "#2D5A3D";
                    ctx.font = "500 28px serif";
                    ctx.fillText("Anuoluwapo & Tochukwu", W / 2, 95);

                    // Event details
                    ctx.fillStyle = "#666";
                    ctx.font = "400 11px sans-serif";
                    ctx.fillText("NOVEMBER 28, 2026  ·  AMEN CENTER, LAGOS", W / 2, 118);

                    // Divider line
                    ctx.strokeStyle = "#2D5A3D40";
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(120, 140);
                    ctx.lineTo(W - 120, 140);
                    ctx.stroke();

                    // Guest Name label
                    ctx.fillStyle = "#999";
                    ctx.font = "600 10px sans-serif";
                    ctx.fillText("GUEST NAME", W / 2, 172);

                    // Guest Name value
                    const guestName = (isNewGuest ? form.name.trim() : selectedGuest?.guest_name) || "";
                    ctx.fillStyle = "#2D5A3D";
                    ctx.font = "500 22px serif";
                    ctx.fillText(guestName, W / 2, 202);

                    // Divider line
                    ctx.beginPath();
                    ctx.moveTo(120, 222);
                    ctx.lineTo(W - 120, 222);
                    ctx.stroke();

                    // Category label
                    ctx.fillStyle = "#999";
                    ctx.font = "600 10px sans-serif";
                    ctx.fillText("CATEGORY", W / 2, 252);

                    // Category value
                    ctx.fillStyle = "#2D5A3D";
                    ctx.font = "500 16px serif";
                    ctx.fillText(rsvpCategoryLabel(form.category), W / 2, 278);

                    // Divider line
                    ctx.beginPath();
                    ctx.moveTo(120, 298);
                    ctx.lineTo(W - 120, 298);
                    ctx.stroke();

                    // Access Number label
                    ctx.fillStyle = "#999";
                    ctx.font = "600 10px sans-serif";
                    ctx.fillText("ACCESS NUMBER", W / 2, 328);

                    // Access Number box
                    ctx.fillStyle = "#ffffff80";
                    ctx.fillRect(W / 2 - 120, 338, 240, 44);
                    ctx.strokeStyle = "#2D5A3D40";
                    ctx.lineWidth = 1;
                    ctx.strokeRect(W / 2 - 120, 338, 240, 44);

                    // Access Number value
                    ctx.fillStyle = "#2D5A3D";
                    ctx.font = "700 22px monospace";
                    ctx.fillText(refNum, W / 2, 366);

                    // Footer text
                    ctx.fillStyle = "#C5A059";
                    ctx.font = "600 9px sans-serif";
                    ctx.fillText("PRESENT THIS CARD AT THE ENTRANCE", W / 2, 420);

                    // Download
                    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.userAgent.includes("Mac") && "ontouchend" in document);
                    if (isIOS) {
                      const win = window.open();
                      if (win) {
                        win.document.write(`<html><head><title>Access Card</title><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;display:flex;flex-direction:column;justify-content:center;align-items:center;min-height:100vh;background:#f5f5f5;font-family:-apple-system,sans-serif"><img src="${canvas.toDataURL("image/png")}" style="max-width:90%;height:auto;border-radius:8px;box-shadow:0 2px 12px rgba(0,0,0,0.15)" /><p style="margin-top:20px;color:#666;font-size:14px;text-align:center;padding:0 20px">Screenshot this or long-press the image to save it safely to your Photos.</p></body></html>`);
                      }
                    } else {
                      const link = document.createElement("a");
                      link.download = `Access-Card-${refNum.replace(/[^a-zA-Z0-9]/g, "")}.png`;
                      link.href = canvas.toDataURL("image/png");
                      link.click();
                    }
                  }}
                  className="inline-flex items-center gap-2 h-12 px-6 bg-emerald text-cream text-[0.75rem] sm:text-[0.8rem] uppercase tracking-[0.18em] font-sans font-medium border border-gold/30 rounded-[3px] transition-all duration-300 hover:bg-emerald-mid hover:border-gold/50 hover:-translate-y-0.5 active:scale-[0.98]"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4 8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Download Access Card
                </button>
              </div>
              <p className="text-[0.7rem] sm:text-[0.75rem] text-ink-muted/50 font-sans mb-6">
                Download your access card and save it to your device gallery.
              </p>
              <button
                type="button"
                onClick={() => { setStep("search"); setSearchName(""); setSearchResults([]); setSelectedGuest(null); setIsNewGuest(false); setIsExistingRsvp(false); setResult(null); setForm({ name: "", contact: "", attending: "", category: "", notes: "" }); setCategoryConfirming(null); }}
                className="text-[0.75rem] text-gold/70 font-sans underline hover:text-gold"
              >
                RSVP for another guest
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}