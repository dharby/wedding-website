"use client";

import { motion } from "framer-motion";

export default function ReceptionNotice() {
  return (
    <section className="py-12 md:py-16 bg-cream">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="max-w-xl mx-auto px-5 text-center"
      >
        <div className="flex items-center justify-center gap-4 mb-4">
          <span className="w-12 h-px bg-gold/30" />
          <span className="text-gold text-[0.7rem] font-serif">✦</span>
          <span className="w-12 h-px bg-gold/30" />
        </div>
        <p className="text-[0.55rem] sm:text-[0.6rem] uppercase tracking-[0.3em] text-ink-muted font-sans">
          Reception Follows Immediately
        </p>
        <div className="flex items-center justify-center gap-4 mt-4">
          <span className="w-12 h-px bg-gold/30" />
          <span className="text-gold text-[0.7rem] font-serif">✦</span>
          <span className="w-12 h-px bg-gold/30" />
        </div>
      </motion.div>
    </section>
  );
}
