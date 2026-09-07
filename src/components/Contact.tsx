"use client";

import { motion } from "framer-motion";

const reveal = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

export default function Contact() {
  const wa = (num: string) => `https://wa.me/234${num.startsWith("0") ? num.slice(1) : num}`;

  const contacts = [
    { name: "Moyin", phone: "08134234560", display: "0813 423 4560" },
    { name: "Princess", phone: "07010180279", display: "0701 018 0279" },
  ];

  return (
    <section id="contact" className="py-14 md:py-20 bg-cream">
      <div className="max-w-2xl mx-auto px-5">
        <motion.div
          custom={0}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={reveal}
          className="text-center mb-10 md:mb-14"
        >
          <p className="text-[0.7rem] sm:text-[0.75rem] uppercase tracking-[0.3em] text-gold/70 font-sans mb-3">
            Need Help?
          </p>
          <div className="flex items-center justify-center gap-4 mb-4">
            <span className="w-10 h-px bg-gold/30" />
            <span className="w-1.5 h-1.5 rounded-full bg-gold/40" />
            <span className="w-10 h-px bg-gold/30" />
          </div>
          <p className="text-[0.85rem] sm:text-[0.9rem] text-ink-muted font-sans max-w-md mx-auto leading-relaxed">
            Have questions? Our wedding team is here to help.
          </p>
        </motion.div>

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
              <p className="text-[1rem] font-serif text-emerald font-medium mb-0.5">{c.name}</p>
              <p className="text-[0.8rem] sm:text-[0.85rem] text-ink-muted font-sans mb-4">{c.display}</p>
              <div className="flex items-center justify-center gap-3">
                <a href={`tel:${c.phone}`}
                  className="h-8 px-4 flex items-center justify-center text-[0.7rem] sm:text-[0.75rem] uppercase tracking-[0.15em] font-sans text-emerald border border-emerald/20 rounded-[2px] transition-all duration-300 hover:bg-emerald hover:text-cream hover:-translate-y-0.5 active:scale-[0.98]">
                  Call
                </a>
                <a href={wa(c.phone)} target="_blank" rel="noopener noreferrer"
                  className="h-8 px-4 flex items-center justify-center text-[0.7rem] sm:text-[0.75rem] uppercase tracking-[0.15em] font-sans text-cream bg-emerald border border-gold/30 rounded-[2px] transition-all duration-300 hover:bg-emerald-mid hover:-translate-y-0.5 active:scale-[0.98]">
                  WhatsApp
                </a>
              </div>
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
