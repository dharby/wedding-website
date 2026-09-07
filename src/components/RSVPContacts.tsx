"use client";

import { motion } from "framer-motion";

const contacts = [
  { name: "Moyin", phone: "08134234560", display: "0813 423 4560" },
  { name: "Princess", phone: "07010180279", display: "0701 018 0279" },
];

const reveal = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

export default function RSVPContacts() {
  const wa = (num: string) => `https://wa.me/234${num.startsWith("0") ? num.slice(1) : num}`;

  return (
    <section className="py-10 md:py-16 bg-cream">
      <div className="max-w-2xl mx-auto px-5">
        <motion.p
          custom={0}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={reveal}
          className="text-center text-[0.7rem] sm:text-[0.75rem] uppercase tracking-[0.3em] text-ink-muted/60 font-sans mb-8"
        >
          Need Help With Your RSVP?
        </motion.p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {contacts.map((c, i) => (
            <motion.div
              key={c.name}
              custom={i + 1}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={reveal}
              className="text-center py-6 px-5 border border-sage-border/40 rounded-[2px]"
            >
              <p className="text-[1.1rem] font-serif text-emerald font-medium mb-0.5">{c.name}</p>
              <p className="text-[0.8rem] sm:text-[0.85rem] text-ink-muted font-sans mb-4">{c.display}</p>
              <div className="flex items-center justify-center gap-3">
                <a
                  href={`tel:${c.phone}`}
                  className="h-8 px-4 flex items-center justify-center text-[0.7rem] sm:text-[0.75rem] uppercase tracking-[0.15em] font-sans text-emerald border border-emerald/20 rounded-[2px] transition-all duration-300 hover:bg-emerald hover:text-cream hover:-translate-y-0.5 active:scale-[0.98]"
                >
                  Call
                </a>
                <a
                  href={wa(c.phone)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-8 px-4 flex items-center justify-center text-[0.7rem] sm:text-[0.75rem] uppercase tracking-[0.15em] font-sans text-cream bg-emerald border border-gold/30 rounded-[2px] transition-all duration-300 hover:bg-emerald-mid hover:-translate-y-0.5 active:scale-[0.98]"
                >
                  WhatsApp
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
