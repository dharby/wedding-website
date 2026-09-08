"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Guest {
  id: string;
  guest_name: string;
  invitation_token: string;
  rsvp_status: string;
  rsvp_id: string | null;
}

interface Form {
  contact: string;
  attending: "" | "yes" | "no";
  notes: string;
}

interface Errors {
  contact?: string;
  attending?: string;
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
  const [form, setForm] = useState<Form>({ contact: "", attending: "", notes: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<"accepted" | "declined" | null>(null);
  const [refNum, setRefNum] = useState("");
  const [error, setError] = useState("");
  const [searching, setSearching] = useState(false);

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
    setStep("form");
    setError("");
  };

  const validate = (): boolean => {
    const e: Errors = {};
    if (!form.contact.trim()) e.contact = "Please enter your email or phone number";
    if (!form.attending) e.attending = "Please let us know if you can make it";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate() || !selectedGuest) return;
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invitation_id: selectedGuest.id,
          guest_name: selectedGuest.guest_name,
          guest_contact: form.contact,
          attendance: form.attending,
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
            Search for your name to confirm your invitation and RSVP.
          </p>
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
                      {guest.rsvp_status !== "pending" && (
                        <p className="text-[0.7rem] text-gold/70 font-sans mt-1">
                          Already RSVP&apos;d: {guest.rsvp_status}
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 2: RSVP Form */}
          {step === "form" && selectedGuest && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="mb-6 p-4 bg-emerald/5 border border-emerald/20 rounded-[2px] text-center">
                <p className="text-[0.7rem] sm:text-[0.75rem] uppercase tracking-[0.15em] text-ink-muted/60 font-sans mb-1">
                  Guest Found
                </p>
                <p className="text-[1.1rem] font-serif text-emerald font-medium">
                  {selectedGuest.guest_name}
                </p>
                <button
                  type="button"
                  onClick={() => { setStep("search"); setSelectedGuest(null); setSearchResults([]); }}
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
                Thank you, {selectedGuest?.guest_name.split(" ")[0]} ❤️
              </h3>
              <p className="text-[0.95rem] sm:text-[1.05rem] text-ink-soft font-sans mb-4 leading-relaxed">
                {result === "accepted"
                  ? "We cannot wait to celebrate with you."
                  : "You will be dearly missed, but we are grateful for your love and warm wishes."}
              </p>
              <div className="bg-white border border-sage-border/40 rounded-[2px] py-4 px-6 mb-4 inline-block">
                <p className="text-[0.7rem] sm:text-[0.75rem] uppercase tracking-[0.2em] text-ink-muted/60 font-sans mb-1">
                  Your Reference Number
                </p>
                <p className="text-[1rem] sm:text-[1.25rem] font-serif text-emerald font-medium tracking-wide">
                  {refNum}
                </p>
              </div>
              <p className="text-[0.7rem] sm:text-[0.75rem] text-ink-muted/50 font-sans mb-6">
                This invitation admits one guest only. Plus-ones are not permitted.
              </p>
              <button
                type="button"
                onClick={() => { setStep("search"); setSearchName(""); setSearchResults([]); setSelectedGuest(null); setResult(null); setForm({ contact: "", attending: "", notes: "" }); }}
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