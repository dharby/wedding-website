"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const reveal = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

export default function GiftRegistry() {
  const [showForm, setShowForm] = useState(false);
  const [sent, setSent] = useState(false);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSent(true);
    setSubmitting(false);
  };

  return (
    <section id="registry" className="py-14 md:py-20 bg-cream">
      <div className="max-w-2xl mx-auto px-5">
        <motion.div
          custom={0}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={reveal}
          className="text-center mb-8 md:mb-12"
        >
          <p className="text-[0.7rem] sm:text-[0.75rem] uppercase tracking-[0.3em] text-gold/70 font-sans mb-3">
            Gifting Us
          </p>
          <h2 className="text-[2rem] sm:text-[2.2rem] font-serif font-light text-emerald mb-2">
            Your Presence Is Our Greatest Gift
          </h2>
          <div className="flex items-center justify-center gap-4 mb-5">
            <span className="w-10 h-px bg-gold/30" />
            <span className="w-1.5 h-1.5 rounded-full bg-gold/40" />
            <span className="w-10 h-px bg-gold/30" />
          </div>
          <p className="text-[0.85rem] sm:text-[0.9rem] text-ink-muted font-sans max-w-md mx-auto leading-relaxed">
            Your presence is the greatest gift, but if you would like to bless us further, we would be deeply grateful for your kind gift.
          </p>
        </motion.div>

        {!showForm && !sent && (
          <motion.div
            custom={1}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={reveal}
            className="text-center"
          >
            {/* Bank details */}
            <div className="bg-white border border-sage-border/40 rounded-[2px] py-6 px-6 mb-6">
              <p className="text-[0.7rem] sm:text-[0.75rem] uppercase tracking-[0.2em] text-ink-muted/60 font-sans mb-3">
                Bank Transfer Details
              </p>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[0.8rem] sm:text-[0.85rem] text-ink-muted font-sans">Bank</span>
                  <span className="text-[0.9rem] sm:text-[0.95rem] font-serif text-emerald font-medium">Providus Bank</span>
                </div>
                <div className="w-full h-px bg-gold/15" />
                <div className="flex justify-between items-center">
                  <span className="text-[0.8rem] sm:text-[0.85rem] text-ink-muted font-sans">Account Name</span>
                  <span className="text-[0.9rem] sm:text-[0.95rem] font-serif text-emerald font-medium">Anuoluwapo Adeoye</span>
                </div>
                <div className="w-full h-px bg-gold/15" />
                <div className="flex justify-between items-center">
                  <span className="text-[0.8rem] sm:text-[0.85rem] text-ink-muted font-sans">Account Number</span>
                  <span className="text-[1rem] sm:text-[1.05rem] font-serif text-emerald font-medium tracking-wider">6508493584</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowForm(true)}
              className="h-12 px-8 bg-emerald text-cream text-[0.75rem] sm:text-[0.8rem] uppercase tracking-[0.18em] font-sans font-medium border border-gold/30 rounded-[3px] transition-all duration-300 hover:bg-emerald-mid hover:border-gold/50 hover:-translate-y-0.5 active:scale-[0.98]"
            >
              I Have Sent a Gift
            </button>
          </motion.div>
        )}

        {showForm && !sent && (
          <motion.form
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            onSubmit={handleConfirm}
            className="space-y-4"
          >
            <div>
              <label className="block text-[0.7rem] sm:text-[0.75rem] uppercase tracking-[0.18em] font-sans text-ink-muted mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                required
                className="w-full h-12 px-4 bg-white border border-sage-border/60 rounded-[2px] text-[0.95rem] font-sans text-ink placeholder:text-ink-muted/40 transition-colors"
              />
            </div>
            <div>
              <label className="block text-[0.7rem] sm:text-[0.75rem] uppercase tracking-[0.18em] font-sans text-ink-muted mb-1.5">
                Phone / Email (Optional)
              </label>
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="Optional"
                className="w-full h-12 px-4 bg-white border border-sage-border/60 rounded-[2px] text-[0.95rem] font-sans text-ink placeholder:text-ink-muted/40 transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={submitting || !name.trim()}
              className="w-full h-12 bg-emerald text-cream text-[0.8rem] sm:text-[0.85rem] uppercase tracking-[0.2em] font-sans font-medium border border-gold/30 rounded-[3px] transition-all duration-300 hover:bg-emerald-mid hover:border-gold/50 hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Confirming..." : "Confirm Gift Sent"}
            </button>
          </motion.form>
        )}

        {sent && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-emerald flex items-center justify-center">
              <span className="text-cream text-xl">♥</span>
            </div>
            <h3 className="text-[1.35rem] sm:text-[1.6rem] font-serif text-emerald mb-2">
              Thank you, {name.split(" ")[0]} ❤️
            </h3>
            <p className="text-[0.85rem] sm:text-[0.9rem] text-ink-muted font-sans leading-relaxed">
              Your kindness means so much to us.
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
}
