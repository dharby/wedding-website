"use client";

import { motion } from "framer-motion";

const milestones = [
  { year: "2021", title: "The First Meeting", desc: "One beautiful evening on the streets of Twitter (now X) — our paths crossed and a conversation began." },
  { year: "2021", title: "The Friendship", desc: "What started as a connection grew into a deep and meaningful bond, laying the foundation for something beautiful." },
  { year: "2025", title: "The Proposal", desc: "A beautiful moment that sealed our journey toward forever." },
  { year: "2026", title: "The Wedding", desc: "We invite you to witness the beginning of our forever — November 28th, 2026." },
];

export default function OurStory() {
  return (
    <section id="story" className="py-16 md:py-24 bg-cream">
      <div className="max-w-2xl mx-auto px-5">
        {/* Large arched frame hero image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10 md:mb-14"
        >
          <div className="relative w-full max-w-lg mx-auto">
            {/* Arched frame */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 500" fill="none" preserveAspectRatio="none">
              {/* Main arch shape */}
              <path
                d="M0 500 Q0 0 200 0 Q400 0 400 500 Z"
                stroke="#C5A059"
                strokeWidth="4"
                fill="none"
                opacity="0.6"
              />
              <path
                d="M0 500 Q0 20 200 20 Q400 20 400 500 Z"
                stroke="#C5A059"
                strokeWidth="2"
                fill="none"
                opacity="0.4"
              />
              {/* Decorative elements on arch */}
              <circle cx="200" cy="20" r="6" fill="#C5A059" opacity="0.5" />
              <circle cx="20" cy="250" r="4" fill="#C5A059" opacity="0.4" />
              <circle cx="380" cy="250" r="4" fill="#C5A059" opacity="0.4" />
              <circle cx="200" cy="480" r="4" fill="#C5A059" opacity="0.3" />
            </svg>
            
            {/* Image placeholder inside the arch */}
            <div className="relative w-full aspect-[4/5] rounded-t-[9999px] overflow-hidden bg-white/10 border border-gold/20 border-b-0 backdrop-blur-sm">
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-20 h-20 text-gold/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[0.6rem] uppercase tracking-[0.2em] text-gold/40 font-sans">
                Our Photo — Add Image Here
              </div>
            </div>
          </div>
        </motion.div>

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
              key={`${m.year}-${i}`}
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
