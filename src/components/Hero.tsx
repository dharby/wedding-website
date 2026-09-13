"use client";

import { motion } from "framer-motion";
import Countdown from "@/components/Countdown";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.9, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

export default function Hero() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-[92dvh] flex items-center justify-center overflow-hidden bg-cream">
      {/* Botanical corners */}
      <div className="absolute inset-0 pointer-events-none">
        <svg className="absolute top-0 left-0 w-48 h-48 md:w-72 md:h-72 opacity-[0.06]" viewBox="0 0 200 200" fill="none">
          <path d="M10 190 Q30 130 20 80 Q10 30 60 10 Q90 0 110 30 Q100 70 70 80 Q40 90 50 60" stroke="#1B3B2B" strokeWidth="1.2"/>
          <path d="M60 10 Q80 30 100 25 Q120 20 130 40 Q140 60 120 70 Q100 80 80 60" stroke="#4A6B53" strokeWidth="0.8"/>
          <circle cx="20" cy="80" r="2" fill="#C5A059" opacity="0.35"/>
          <circle cx="130" cy="40" r="1.5" fill="#C5A059" opacity="0.25"/>
        </svg>
        <svg className="absolute top-0 right-0 w-48 h-48 md:w-72 md:h-72 opacity-[0.06] scale-x-[-1]" viewBox="0 0 200 200" fill="none">
          <path d="M10 190 Q30 130 20 80 Q10 30 60 10 Q90 0 110 30 Q100 70 70 80 Q40 90 50 60" stroke="#1B3B2B" strokeWidth="1.2"/>
          <path d="M60 10 Q80 30 100 25 Q120 20 130 40 Q140 60 120 70 Q100 80 80 60" stroke="#4A6B53" strokeWidth="0.8"/>
          <circle cx="20" cy="80" r="2" fill="#C5A059" opacity="0.35"/>
        </svg>
        <svg className="absolute bottom-0 left-0 w-56 h-56 md:w-80 md:h-80 opacity-[0.04] rotate-180" viewBox="0 0 200 200" fill="none">
          <path d="M10 190 Q30 130 20 80 Q10 30 60 10 Q90 0 110 30 Q100 70 70 80 Q40 90 50 60" stroke="#1B3B2B" strokeWidth="1.2"/>
          <path d="M110 30 Q130 20 150 35 Q170 50 155 80" stroke="#4A6B53" strokeWidth="0.8"/>
        </svg>
        <svg className="absolute bottom-0 right-0 w-56 h-56 md:w-80 md:h-80 opacity-[0.04] rotate-180 scale-x-[-1]" viewBox="0 0 200 200" fill="none">
          <path d="M10 190 Q30 130 20 80 Q10 30 60 10 Q90 0 110 30 Q100 70 70 80 Q40 90 50 60" stroke="#1B3B2B" strokeWidth="1.2"/>
          <path d="M110 30 Q130 20 150 35 Q170 50 155 80" stroke="#4A6B53" strokeWidth="0.8"/>
        </svg>
      </div>

      {/* Arc-like frame image placeholder - right side of hero */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, rotate: -3 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ delay: 0.3, duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="hidden lg:block absolute top-1/4 right-5 z-10 pointer-events-none"
        style={{ transformOrigin: "center center" }}
      >
        <div className="relative w-56 h-56">
          {/* Arc frame */}
          <svg className="absolute inset-0" viewBox="0 0 224 224" fill="none">
            <path
              d="M112 12 C62.5 12 22 52.5 22 102 C22 151.5 62.5 192 112 192 C161.5 192 202 151.5 202 102 C202 52.5 161.5 12 112 12"
              stroke="#C5A059"
              strokeWidth="3"
              strokeDasharray="8 4"
              opacity="0.4"
            />
            <path
              d="M112 20 C162.7 20 204 61.3 204 102 C204 142.7 162.7 184 112 184 C61.3 184 20 142.7 20 102 C20 61.3 61.3 20 112 20"
              stroke="#C5A059"
              strokeWidth="1.5"
              opacity="0.6"
            />
            {/* Decorative elements on the arc */}
            <circle cx="112" cy="20" r="4" fill="#C5A059" opacity="0.5" />
            <circle cx="204" cy="102" r="4" fill="#C5A059" opacity="0.4" />
            <circle cx="112" cy="184" r="4" fill="#C5A059" opacity="0.3" />
            <circle cx="20" cy="102" r="4" fill="#C5A059" opacity="0.4" />
          </svg>
          
          {/* Image placeholder inside the arc */}
          <div className="absolute inset-4 rounded-[50%] overflow-hidden bg-white/10 border border-gold/20 backdrop-blur-sm">
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-16 h-16 text-gold/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[0.55rem] uppercase tracking-[0.2em] text-gold/40 font-sans">
              Pre-Wedding Photo
            </div>
          </div>
        </div>
      </motion.div>

      <div className="relative z-10 text-center px-5 max-w-4xl mx-auto">
        <motion.p
          custom={0}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="text-[0.75rem] sm:text-[0.8rem] uppercase tracking-[0.35em] text-gold font-sans mb-4"
        >
          Save the Date
        </motion.p>

        <motion.p
          custom={0.5}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="text-[1rem] sm:text-[1.15rem] font-script text-gold/70 tracking-wide mb-5"
        >
          together with their families
        </motion.p>

        <motion.h1
          custom={1}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="text-[3.5rem] sm:text-[4.5rem] md:text-[6rem] lg:text-[7rem] font-serif font-light text-emerald leading-[0.95] tracking-[-0.02em] mb-2"
        >
          Anuoluwapo
        </motion.h1>

        <motion.span
          custom={2}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="block text-gold text-[1.35rem] sm:text-[1.5rem] font-script my-1"
        >
          &
        </motion.span>

        <motion.h1
          custom={3}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="text-[3.5rem] sm:text-[4.5rem] md:text-[6rem] lg:text-[7rem] font-serif font-light text-emerald leading-[0.95] tracking-[-0.02em] mb-6"
        >
          Tochukwu
        </motion.h1>

        <motion.div
          custom={4}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="flex items-center justify-center gap-4 mb-3"
        >
          <span className="w-12 h-px bg-gold/40" />
          <span className="text-[0.75rem] sm:text-[0.8rem] uppercase tracking-[0.3em] text-ink-muted font-serif">
            Saturday, November 28th, 2026
          </span>
          <span className="w-12 h-px bg-gold/40" />
        </motion.div>

        <motion.p
          custom={5}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="text-[0.7rem] sm:text-[0.75rem] uppercase tracking-[0.25em] text-ink-muted/60 font-sans mb-6"
        >
          12:00 PM — Amen Center, Lagos
        </motion.p>

        <motion.div
          custom={6}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
        >
          <button
            onClick={() => scrollTo("rsvp")}
            className="inline-flex items-center justify-center h-12 px-7 bg-emerald text-cream text-[0.8rem] sm:text-[0.85rem] uppercase tracking-[0.2em] font-sans font-medium border border-gold/30 rounded-[3px] transition-all duration-300 hover:bg-emerald-mid hover:border-gold/50 hover:-translate-y-0.5 active:scale-[0.98]"
          >
            RSVP to Celebrate
          </button>
          <button
            onClick={() => scrollTo("details")}
            className="inline-flex items-center justify-center h-12 px-7 bg-transparent text-emerald text-[0.8rem] sm:text-[0.85rem] uppercase tracking-[0.2em] font-sans font-medium border border-sage-border rounded-[3px] transition-all duration-300 hover:border-emerald-soft/40 hover:bg-sage-light/50 hover:-translate-y-0.5 active:scale-[0.98]"
          >
            Explore the Details
          </button>
        </motion.div>

        <motion.div
          custom={7}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="mt-8"
        >
          <Countdown compact />
        </motion.div>
      </div>
    </section>
  );
}
