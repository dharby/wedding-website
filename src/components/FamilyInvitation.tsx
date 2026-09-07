"use client";

import { motion } from "framer-motion";

const reveal = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.8, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

export default function FamilyInvitation() {
  return (
    <section className="py-14 md:py-20 bg-cream">
      <div className="max-w-2xl mx-auto px-5 text-center">
        <motion.p
          custom={0}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={reveal}
          className="text-[0.7rem] sm:text-[0.75rem] uppercase tracking-[0.3em] text-gold/70 font-sans mb-4"
        >
          The Entire Families Of
        </motion.p>

        <motion.p
          custom={1}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={reveal}
          className="text-[1.25rem] sm:text-[1.25rem] font-serif text-emerald font-medium leading-relaxed mb-2"
        >
          Pst Olugbenga &amp; Deaconess Ibiyinka Adeoye
        </motion.p>

        <motion.span
          custom={2}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={reveal}
          className="block text-gold text-[1.1rem] font-serif my-3"
        >
          &amp;
        </motion.span>

        <motion.p
          custom={3}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={reveal}
          className="text-[1.25rem] sm:text-[1.25rem] font-serif text-emerald font-medium leading-relaxed mb-4"
        >
          Mr. Samson &amp; Mrs. Olajoke Ekwubiri
        </motion.p>

        <motion.div
          custom={4}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={reveal}
          className="flex items-center justify-center gap-4 mb-4"
        >
          <span className="w-10 h-px bg-gold/30" />
          <span className="w-1.5 h-1.5 rounded-full bg-gold/40" />
          <span className="w-10 h-px bg-gold/30" />
        </motion.div>

        <motion.p
          custom={5}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={reveal}
          className="text-[0.85rem] sm:text-[0.9rem] font-script text-ink-muted/80 leading-relaxed"
        >
          Invite you to the wedding of their dear children
        </motion.p>
      </div>

      <div className="flex items-center justify-center gap-4 mt-12">
        <span className="w-8 h-px bg-gold/20" />
        <span className="w-1 h-1 rounded-full bg-gold/30" />
        <span className="w-8 h-px bg-gold/20" />
      </div>
    </section>
  );
}
