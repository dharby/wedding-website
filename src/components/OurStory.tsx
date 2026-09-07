"use client";

import { motion } from "framer-motion";

const milestones = [
  { year: "2019", title: "The First Meeting", desc: "Our paths crossed for the first time, and something special began to unfold." },
  { year: "2020", title: "The Friendship", desc: "What started as a connection grew into a deep and meaningful bond." },
  { year: "2023", title: "The Proposal", desc: "A beautiful moment that sealed our journey toward forever." },
  { year: "2026", title: "The Wedding", desc: "We invite you to witness the beginning of our forever." },
];

export default function OurStory() {
  return (
    <section id="story" className="py-16 md:py-24 bg-cream">
      <div className="max-w-2xl mx-auto px-5">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-10 md:mb-14"
        >
          <p className="text-[0.7rem] sm:text-[0.75rem] uppercase tracking-[0.3em] text-gold/70 font-sans mb-3">
            Our Story
          </p>
          <h2 className="text-[2rem] sm:text-[2.2rem] font-serif font-light text-emerald mb-2">
            How We Met
          </h2>
          <div className="flex items-center justify-center gap-4">
            <span className="w-10 h-px bg-gold/30" />
            <span className="w-1.5 h-1.5 rounded-full bg-gold/40" />
            <span className="w-10 h-px bg-gold/30" />
          </div>
        </motion.div>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[1.1rem] sm:left-[1.3rem] top-0 bottom-0 w-px bg-sage-border/50" />

          {milestones.map((m, i) => (
            <motion.div
              key={m.year}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.15, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="relative pl-10 sm:pl-12 pb-10 last:pb-0"
            >
              {/* Dot with scale pulse */}
              <motion.div
                initial={{ scale: 0.8 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 + 0.3, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="absolute left-[0.65rem] sm:left-[0.85rem] top-1 w-[0.7rem] h-[0.7rem] rounded-full bg-cream border-[1.5px] border-gold/60"
              />

              <p className="text-[0.7rem] sm:text-[0.75rem] uppercase tracking-[0.25em] font-serif text-gold mb-1">
                {m.year}
              </p>
              <h3 className="text-[1rem] sm:text-[1.25rem] font-serif text-emerald font-medium mb-1.5">
                {m.title}
              </h3>
              <p className="text-[0.8rem] sm:text-[0.85rem] text-ink-muted font-sans leading-relaxed">
                {m.desc}
              </p>
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
