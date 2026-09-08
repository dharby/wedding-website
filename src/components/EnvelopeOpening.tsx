"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/ThemeContext";

interface EnvelopeOpeningProps {
  onOpen: () => void;
}

export default function EnvelopeOpening({ onOpen }: EnvelopeOpeningProps) {
  const { theme } = useTheme();
  const [phase, setPhase] = useState<"idle" | "ready" | "seal-release" | "flap-open" | "card-emerge" | "card-reveal" | "transition" | "done">("idle");
  const [petals, setPetals] = useState<Array<{ id: number; x: number; delay: number; dur: number; size: number; rot: number }>>([]);

  // Staggered entrance
  useEffect(() => {
    const t = setTimeout(() => setPhase("ready"), 600);
    return () => clearTimeout(t);
  }, []);

  const handleOpen = useCallback(() => {
    if (phase !== "ready") return;
    // Step 1: Seal release
    setPhase("seal-release");
    // Step 2: Flap opens
    setTimeout(() => setPhase("flap-open"), 400);
    // Step 3: Card emerges
    setTimeout(() => setPhase("card-emerge"), 1100);
    // Step 4: Card reveal text
    setTimeout(() => setPhase("card-reveal"), 1900);
    // Step 5: Transition to site
    setTimeout(() => {
      setPhase("transition");
      // Spawn petals
      setPetals(Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 2,
        dur: 3 + Math.random() * 2.5,
        size: 8 + Math.random() * 16,
        rot: Math.random() * 360,
      })));
    }, 3400);
    // Complete
    setTimeout(() => onOpen(), 5200);
  }, [phase, onOpen]);

  const handleSkip = useCallback(() => onOpen(), [onOpen]);

  const isOpening = phase !== "idle" && phase !== "ready";
  const showCard = phase === "card-emerge" || phase === "card-reveal" || phase === "transition";
  const showText = phase === "card-reveal" || phase === "transition";
  const isDark = theme === "dark";

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center overflow-hidden"
      style={{ background: isDark 
        ? "linear-gradient(180deg, #0E281E 0%, #0A1F16 50%, #0E281E 100%)" 
        : "linear-gradient(180deg, #FBF9F4 0%, #F3F0E8 50%, #FBF9F4 100%)" 
      }}
      role="dialog"
      aria-label="Open Anuoluwapo and Tochukwu's wedding invitation"
    >
      {/* Subtle botanical corners */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Top-left botanical */}
        <svg className="absolute -top-4 -left-4 w-40 h-40 md:w-56 md:h-56 opacity-[0.07]" viewBox="0 0 200 200" fill="none">
          <path d="M20 180 Q40 120 30 80 Q20 40 60 20 Q80 10 100 30 Q120 50 100 80 Q80 110 60 100 Q40 90 50 70" stroke="#1B3B2B" strokeWidth="1.5" fill="none"/>
          <path d="M60 20 Q70 40 90 50 Q110 60 120 40 Q130 20 150 30 Q170 40 160 70 Q150 100 120 90 Q90 80 80 60" stroke="#4A6B53" strokeWidth="1" fill="none"/>
          <circle cx="30" cy="80" r="2" fill="#C5A059" opacity="0.4"/>
          <circle cx="100" cy="30" r="1.5" fill="#C5A059" opacity="0.3"/>
          <circle cx="160" cy="70" r="2" fill="#C5A059" opacity="0.4"/>
        </svg>
        {/* Top-right botanical */}
        <svg className="absolute -top-4 -right-4 w-40 h-40 md:w-56 md:h-56 opacity-[0.07] scale-x-[-1]" viewBox="0 0 200 200" fill="none">
          <path d="M20 180 Q40 120 30 80 Q20 40 60 20 Q80 10 100 30 Q120 50 100 80 Q80 110 60 100 Q40 90 50 70" stroke="#1B3B2B" strokeWidth="1.5" fill="none"/>
          <path d="M60 20 Q70 40 90 50 Q110 60 120 40 Q130 20 150 30 Q170 40 160 70 Q150 100 120 90 Q90 80 80 60" stroke="#4A6B53" strokeWidth="1" fill="none"/>
          <circle cx="30" cy="80" r="2" fill="#C5A059" opacity="0.4"/>
          <circle cx="100" cy="30" r="1.5" fill="#C5A059" opacity="0.3"/>
        </svg>
        {/* Bottom botanicals */}
        <svg className="absolute -bottom-6 -left-6 w-44 h-44 md:w-60 md:h-60 opacity-[0.05] rotate-180" viewBox="0 0 200 200" fill="none">
          <path d="M20 180 Q40 120 30 80 Q20 40 60 20 Q80 10 100 30 Q120 50 100 80 Q80 110 60 100 Q40 90 50 70" stroke="#1B3B2B" strokeWidth="1.5" fill="none"/>
          <path d="M100 30 Q130 20 150 40 Q170 60 150 90" stroke="#4A6B53" strokeWidth="1" fill="none"/>
        </svg>
        <svg className="absolute -bottom-6 -right-6 w-44 h-44 md:w-60 md:h-60 opacity-[0.05] rotate-180 scale-x-[-1]" viewBox="0 0 200 200" fill="none">
          <path d="M20 180 Q40 120 30 80 Q20 40 60 20 Q80 10 100 30 Q120 50 100 80 Q80 110 60 100 Q40 90 50 70" stroke="#1B3B2B" strokeWidth="1.5" fill="none"/>
          <path d="M100 30 Q130 20 150 40 Q170 60 150 90" stroke="#4A6B53" strokeWidth="1" fill="none"/>
        </svg>
      </div>

      {/* Floating petals */}
      <AnimatePresence>
        {phase === "transition" && petals.map((p) => (
          <motion.div
            key={p.id}
            initial={{ y: "-5vh", x: `${p.x}vw`, opacity: 0, rotate: 0 }}
            animate={{ y: "105vh", opacity: [0, 0.8, 0.8, 0], rotate: p.rot + 360 }}
            transition={{ duration: p.dur, delay: p.delay, ease: "linear" }}
            className="fixed pointer-events-none z-[95]"
            style={{
              width: p.size,
              height: p.size,
              borderRadius: p.id % 3 === 0 ? "50% 0 50% 0" : p.id % 3 === 1 ? "50%" : "2px",
              background: p.id % 4 === 0 ? "#C5A059" : p.id % 4 === 1 ? "#4A6B53" : p.id % 4 === 2 ? "#D1DCD3" : "#1B3B2B",
              opacity: 0.6,
              "--drift": `${(Math.random() - 0.5) * 40}px`,
            } as React.CSSProperties}
          />
        ))}
      </AnimatePresence>

      {/* Main envelope container */}
      <div className="relative flex flex-col items-center px-6">
        {/* Header text — fades in before envelope */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: phase === "idle" ? 0 : 1, y: phase === "idle" ? 14 : 0 }}
          transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-6 md:mb-8"
        >
          <p className="text-[0.6rem] sm:text-[0.65rem] uppercase tracking-[0.35em] text-gold font-sans mb-3">
            You&apos;re Invited
          </p>
          <h1 className="text-[2rem] sm:text-[2.6rem] md:text-[3.2rem] font-serif leading-[1.1]" style={{ color: isDark ? "#FBF9F4" : "#0E281E" }}>
            Anuoluwapo & Tochukwu
          </h1>
          <div className="mt-4 flex items-center justify-center gap-3">
            <span className="w-8 h-px bg-gold/40" />
            <span className="text-[0.55rem] uppercase tracking-[0.3em] text-gold font-sans">Nov 28, 2026</span>
            <span className="w-8 h-px bg-gold/40" />
          </div>
        </motion.div>

        {/* ENVELOPE */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{
            opacity: phase === "idle" ? 0 : 1,
            y: phase === "idle" ? 20 : 0,
            scale: phase === "idle" ? 0.96 : 1,
          }}
          transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-[min(20rem,82vw)] sm:w-[min(22rem,78vw)] md:w-[24rem]"
          style={{ perspective: "1800px" }}
          onClick={handleOpen}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleOpen(); }}
          tabIndex={0}
          role="button"
          aria-label="Open the wedding invitation"
        >
          {/* Envelope aspect ratio wrapper */}
          <div className="relative w-full" style={{ paddingBottom: "66.67%" }}>
            <div className="absolute inset-0" style={{ transformStyle: "preserve-3d" }}>

              {/* LAYER 1: Envelope back */}
              <div
                className="absolute inset-0 rounded-[3px] overflow-hidden"
                style={{
                  background: isDark 
                    ? "linear-gradient(170deg, #1A3D2C 0%, #122D1F 50%, #0E281E 100%)" 
                    : "linear-gradient(170deg, #F5F0E6 0%, #EDE6D6 50%, #E8DFC9 100%)",
                  boxShadow: "0 20px 60px -20px rgba(14,40,30,0.18), 0 8px 24px -8px rgba(14,40,30,0.08)",
                }}
              >
                {/* Subtle paper texture */}
                <div className="absolute inset-0 opacity-[0.03]"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                  }}
                />
                {/* Inner green lining */}
                <div
                  className="absolute inset-[4px] rounded-[2px]"
                  style={{ background: "linear-gradient(180deg, #1B3B2B 0%, #0E281E 100%)", opacity: 0.92 }}
                />
              </div>

              {/* LAYER 2: Invitation card (inside, emerges upward) */}
              <motion.div
                initial={{ y: "38%", opacity: 0 }}
                animate={showCard
                  ? { y: "0%", opacity: 1 }
                  : { y: "38%", opacity: 0 }
                }
                transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
                className="absolute left-[6%] right-[6%] top-[-8%] bottom-[4%] z-10 rounded-[2px] overflow-hidden"
                style={{
                  background: isDark
                    ? "linear-gradient(175deg, #122D1F 0%, #0E281E 100%)"
                    : "linear-gradient(175deg, #FDFCF9 0%, #F8F5EE 100%)",
                  boxShadow: "0 16px 40px -16px rgba(14,40,30,0.2)",
                }}
              >
                {/* Gold border inset */}
                <div className="absolute inset-[6px] sm:inset-[8px] border border-gold/20 rounded-[1px]" />
                {/* Card content */}
                <div className="relative flex h-full flex-col items-center justify-center px-5 py-6 sm:px-8 sm:py-8 text-center">
                  <motion.p
                    initial={{ opacity: 0, y: 6 }}
                    animate={showText ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
                    transition={{ delay: 0.1, duration: 0.6 }}
                    className="text-[0.5rem] sm:text-[0.55rem] uppercase tracking-[0.35em] text-gold font-sans mb-2"
                  >
                    Save the Date
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0, y: 6 }}
                    animate={showText ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="text-[0.45rem] sm:text-[0.5rem] uppercase tracking-[0.25em] text-ink-muted font-sans mb-3"
                  >
                    The Entire Families Of
                  </motion.p>
                  <motion.h2
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={showText ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
                    transition={{ delay: 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="text-[1.5rem] sm:text-[1.9rem] md:text-[2.2rem] font-script leading-[1.15] mb-1" style={{ color: isDark ? "#FBF9F4" : "#0E281E" }}
                  >
                    Anuoluwapo
                  </motion.h2>
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={showText ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                    transition={{ delay: 0.7, duration: 0.5 }}
                    className="text-gold text-[0.8rem] sm:text-[1rem] font-serif my-0.5"
                  >
                    &amp;
                  </motion.span>
                  <motion.h2
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={showText ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
                    transition={{ delay: 0.9, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="text-[1.5rem] sm:text-[1.9rem] md:text-[2.2rem] font-script leading-[1.15] mb-3" style={{ color: isDark ? "#FBF9F4" : "#0E281E" }}
                  >
                    Tochukwu
                  </motion.h2>
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={showText ? { opacity: 1, width: 32 } : { opacity: 0, width: 0 }}
                    transition={{ delay: 1.1, duration: 0.5 }}
                    className="h-px bg-gold/50 mb-3"
                  />
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={showText ? { opacity: 1 } : { opacity: 0 }}
                    transition={{ delay: 1.3, duration: 0.6 }}
                    className="text-[0.5rem] sm:text-[0.55rem] uppercase tracking-[0.3em] text-ink-muted font-sans"
                  >
                    Nov 28 | 2026
                  </motion.p>
                </div>
              </motion.div>

              {/* LAYER 3: Envelope front pocket (V-fold with clip-path) */}
              <div className="absolute inset-0 z-20 overflow-hidden rounded-[3px]">
                {/* Bottom V (back triangle) */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: isDark
                      ? "linear-gradient(175deg, #1A3D2C 0%, #122D1F 50%, #0E281E 100%)"
                      : "linear-gradient(175deg, #F5F0E6 0%, #EDE6D6 50%, #E8DFC9 100%)",
                    clipPath: "polygon(0 36%, 50% 74%, 100% 36%, 100% 100%, 0 100%)",
                  }}
                />
                {/* Left angled flap */}
                <div
                  className="absolute inset-y-0 left-0 w-1/2"
                  style={{
                    background: isDark
                      ? "linear-gradient(125deg, #162E21 0%, #0E281E 100%)"
                      : "linear-gradient(125deg, #F0EBE0 0%, #E5DDCC 100%)",
                    clipPath: "polygon(0 0, 100% 73%, 100% 100%, 0 100%)",
                  }}
                />
                {/* Right angled flap */}
                <div
                  className="absolute inset-y-0 right-0 w-1/2"
                  style={{
                    background: isDark
                      ? "linear-gradient(235deg, #162E21 0%, #0E281E 100%)"
                      : "linear-gradient(235deg, #F0EBE0 0%, #E5DDCC 100%)",
                    clipPath: "polygon(100% 0, 0 73%, 0 100%, 100% 100%)",
                  }}
                />
                {/* Bottom shadow gradient */}
                <div
                  className="absolute inset-x-0 bottom-0 h-[40%]"
                  style={{ background: "linear-gradient(0deg, rgba(14,40,30,0.06), transparent)" }}
                />
              </div>

              {/* LAYER 4: Envelope top flap (triangle, hinged at top) */}
              <motion.div
                initial={{ rotateX: 0 }}
                animate={isOpening ? { rotateX: -180 } : { rotateX: 0 }}
                transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
                className="absolute inset-x-0 top-0 h-[68%] z-30"
                style={{ transformOrigin: "top center", transformStyle: "preserve-3d" }}
              >
                {/* Front face (cream) */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: isDark
                      ? "linear-gradient(180deg, #1A3D2C 0%, #122D1F 100%)"
                      : "linear-gradient(180deg, #F5F0E6 0%, #EDE6D6 100%)",
                    clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                    backfaceVisibility: "hidden",
                    filter: "drop-shadow(0 4px 8px rgba(14,40,30,0.08))",
                  }}
                />
                {/* Back face (dark emerald, visible when flipped) */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: "linear-gradient(0deg, #1B3B2B, #0E281E)",
                    clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                    backfaceVisibility: "hidden",
                    transform: "rotateX(180deg)",
                  }}
                />
              </motion.div>

              {/* LAYER 5: Wax seal */}
              <motion.button
                type="button"
                aria-label="Open the wedding invitation"
                onClick={(e) => { e.stopPropagation(); handleOpen(); }}
                animate={
                  phase === "seal-release"
                    ? { scale: 0.8, opacity: 0 }
                    : phase === "ready"
                    ? { scale: 1, opacity: 1 }
                    : isOpening
                    ? { scale: 0.8, opacity: 0 }
                    : { scale: 1, opacity: 1 }
                }
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="absolute left-1/2 top-[56%] z-40 flex h-[3.2rem] w-[3.2rem] sm:h-[3.8rem] sm:w-[3.8rem] md:h-[4.2rem] md:w-[4.2rem] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full cursor-pointer"
                tabIndex={-1}
              >
                {/* Seal body */}
                <span
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: "radial-gradient(circle at 35% 30%, #D4B76A, #C5A059 40%, #9C7A3A 70%, #7D5F28 100%)",
                    boxShadow: "0 6px 16px -4px rgba(14,40,30,0.3), inset 0 1px 2px rgba(255,255,255,0.3)",
                  }}
                />
                {/* Conic ring */}
                <span
                  className="absolute inset-0 rounded-full opacity-50"
                  style={{
                    maskImage: "radial-gradient(circle, transparent 58%, black 60%)",
                    WebkitMaskImage: "radial-gradient(circle, transparent 58%, black 60%)",
                    background: "conic-gradient(from 0deg, #C5A059, #E0C88D, #A5763D, #D7B57E, #C5A059)",
                  }}
                />
                {/* Pulse ring */}
                <span
                  className="absolute -inset-2 rounded-full border border-gold/30"
                  style={{
                    animation: phase === "ready" ? "seal-pulse 2.8s ease-out infinite" : "none",
                  }}
                />
                {/* Initials */}
                <span
                  className="relative text-[0.85rem] sm:text-[1rem] md:text-[1.1rem] text-cream font-serif font-semibold tracking-tight"
                  style={{ textShadow: "0 1px 2px rgba(80,52,20,0.4)" }}
                >
                  A&T
                </span>
              </motion.button>

            </div>
          </div>
        </motion.div>

        {/* TAP TO OPEN text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: phase === "ready" ? 1 : 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-5 sm:mt-6 text-[0.55rem] sm:text-[0.6rem] uppercase tracking-[0.3em] text-emerald/80 dark:text-gold/80 font-sans select-none"
        >
          Tap to Open
        </motion.p>

        {/* Skip button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: phase === "ready" ? 0.4 : 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          whileHover={{ opacity: 1 }}
          onClick={handleSkip}
          className="mt-3 text-[0.5rem] sm:text-[0.55rem] uppercase tracking-[0.25em] text-emerald/80 dark:text-gold/60 font-sans hover:text-emerald/90 dark:hover:text-gold/80 transition-colors"
        >
          Skip Intro
        </motion.button>

        {/* Privacy notice */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: phase === "ready" ? 1 : 0 }}
          transition={{ duration: 0.8, delay: 1.4 }}
          className="mt-4 max-w-xs text-center text-[0.55rem] sm:text-[0.6rem] uppercase tracking-[0.2em] font-sans"
          style={{ color: isDark ? "rgba(197,160,89,0.75)" : "rgba(14,40,30,0.55)" }}
        >
          🔒 Strictly for invited guests — please do not share or forward this invitation
        </motion.p>
      </div>
    </div>
  );
}
