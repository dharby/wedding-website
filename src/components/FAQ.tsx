"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  { q: "What should I wear?", a: "The official wedding colors are Emerald Green, Antique Gold, and Sage Green. For the traditional wedding, feel free to wear your finest traditional attire. For the white wedding and reception, formal wear in the color code is appreciated." },
  { q: "Where is the venue?", a: "Amen Center, 2nd Ave, Ipaja, Lagos 102213, Lagos. There is adequate parking available at the venue." },
  { q: "Can I bring a plus one?", a: "No. Each invitation is for the guest specified on the invitation. Children are welcome but must be accompanied and supervised by their parent or guardian." },
  { q: "Are children invited?", a: "Yes. Children are welcome, but we kindly ask parents to look after their wards throughout the celebration." },
  { q: "When should I RSVP?", a: "As soon as possible. Kindly respond before the wedding day so we can plan accordingly." },
  { q: "Where can I get the Aso Ebi?", a: "Please contact Moyin for the bride's side or Princess for the groom's side. Their contact details are in the Aso Ebi section." },
  { q: "Is there parking?", a: "Yes, Amen Center has adequate parking space for all guests." },
  { q: "Can I send a gift?", a: "Yes. Cash gifts are warmly appreciated. Please see the Gifting Us section for bank transfer details." },
  { q: "What time should I arrive?", a: "Please arrive early so you can settle in and enjoy the celebration." },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-14 md:py-20 bg-sage-light/40">
      <div className="max-w-2xl mx-auto px-5">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8 md:mb-12"
        >
          <p className="text-[0.7rem] sm:text-[0.75rem] uppercase tracking-[0.3em] text-gold/70 font-sans mb-3">
            Questions & Answers
          </p>
          <h2 className="text-[1.8rem] sm:text-[2.2rem] font-serif text-emerald mb-2">
            Frequently Asked Questions
          </h2>
          <div className="flex items-center justify-center gap-4">
            <span className="w-10 h-px bg-gold/30" />
            <span className="w-1.5 h-1.5 rounded-full bg-gold/40" />
            <span className="w-10 h-px bg-gold/30" />
          </div>
        </motion.div>

        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.6 }}
              className="border border-sage-border/40 rounded-[2px] bg-white/60 overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left"
              >
                <span className="text-[0.95rem] sm:text-[1rem] font-sans text-emerald font-medium pr-4">
                  {faq.q}
                </span>
                <motion.span
                  animate={{ rotate: openIndex === i ? 45 : 0 }}
                  transition={{ duration: 0.25 }}
                  className="text-gold text-lg flex-shrink-0"
                >
                  +
                </motion.span>
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-4 text-[0.85rem] sm:text-[0.9rem] text-ink-muted font-sans leading-relaxed border-t border-sage-border/20 pt-3">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 mt-12">
        <span className="w-8 h-px bg-gold/20" />
        <span className="w-1 h-1 rounded-full bg-gold/30" />
        <span className="w-8 h-px bg-gold/20" />
      </div>
    </section>
  );
}
