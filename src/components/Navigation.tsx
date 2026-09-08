"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const links = [
  { name: "Home", href: "#home" },
  { name: "Our Story", href: "#story" },
  { name: "Wedding", href: "#details" },
  { name: "Dress Code", href: "#dresscode" },
  { name: "Aso Ebi", href: "#asoebi" },
  { name: "Gift", href: "#registry" },
  { name: "FAQ", href: "#faq" },
  { name: "RSVP", href: "#rsvp" },
];

export default function Navigation() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const [showRSVP, setShowRSVP] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 60);
      // Hide RSVP button when near bottom (footer area)
      const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 200;
      setShowRSVP(!nearBottom && window.scrollY > 300);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const nav = (href: string) => {
    setOpen(false);
    setTimeout(() => {
      document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  return (
    <>
      {/* Desktop */}
      <motion.nav
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.3 }}
        className={`hidden md:flex fixed top-0 inset-x-0 z-50 justify-center transition-all duration-500 ${
          scrolled
            ? "bg-[#FBF9F4]/95 dark:bg-[#0E281E]/95 backdrop-blur-md border-b border-[#D1DCD3]/50 dark:border-[#C5A059]/30"
            : "bg-transparent dark:bg-transparent"
        }`}
      >
        <div className="flex items-center gap-8 py-4">
          {links.map((l) => (
            <button
              key={l.name}
              onClick={() => nav(l.href)}
              className="text-[0.6rem] uppercase tracking-[0.2em] font-sans text-ink-soft/70 dark:text-cream/80 hover:text-emerald dark:hover:text-gold transition-colors duration-300 relative group"
            >
              {l.name}
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-gold group-hover:w-full transition-all duration-300" />
            </button>
          ))}
        </div>
      </motion.nav>

      {/* Mobile header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className={`md:hidden fixed top-0 inset-x-0 z-50 flex items-center justify-between px-5 py-3 transition-all duration-400 ${
          scrolled
            ? "bg-[#FBF9F4]/95 dark:bg-[#0E281E]/95 backdrop-blur-md border-b border-[#D1DCD3]/40 dark:border-[#C5A059]/30"
            : "bg-transparent dark:bg-[#0E281E]"
        }`}
      >
        <button onClick={() => setOpen(true)} className="p-1" aria-label="Open menu">
          <svg className="w-5 h-5 text-emerald dark:text-cream" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5M3.75 15h16.5" />
          </svg>
        </button>
        <span className="text-[0.9rem] font-script text-emerald dark:text-gold">A&T</span>
        <div className="w-7" />
      </motion.div>

      {/* Mobile sticky RSVP button */}
      {showRSVP && (
        <div className="md:hidden fixed bottom-5 left-1/2 -translate-x-1/2 z-40">
          <motion.button
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            onClick={() => nav("#rsvp")}
            className="h-10 px-5 bg-emerald text-cream text-[0.7rem] sm:text-[0.75rem] uppercase tracking-[0.18em] font-sans font-medium border border-gold/30 rounded-[3px] shadow-lg shadow-emerald/20 transition-all duration-400 hover:bg-emerald-mid"
          >
            RSVP
          </motion.button>
        </div>
      )}

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-[60] bg-emerald/20 backdrop-blur-sm md:hidden"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="fixed top-0 left-0 bottom-0 w-72 z-[70] bg-cream dark:bg-emerald border-r border-sage-border/50 dark:border-emerald-soft/30 md:hidden"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-sage-border/30 dark:border-emerald-soft/20">
                <span className="text-[1rem] font-script text-emerald dark:text-cream">A&T</span>
                <button onClick={() => setOpen(false)} className="p-1" aria-label="Close menu">
                  <svg className="w-5 h-5 text-emerald dark:text-cream" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <nav className="flex flex-col px-5 pt-6 gap-1">
                {links.map((l, i) => (
                  <motion.button
                    key={l.name}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.4 }}
                    onClick={() => nav(l.href)}
                    className="text-left py-3 text-[0.65rem] sm:text-[0.7rem] uppercase tracking-[0.18em] font-sans text-ink-soft dark:text-cream hover:text-gold border-b border-sage-border/20 dark:border-emerald-soft/20 transition-colors"
                  >
                    {l.name}
                  </motion.button>
                ))}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
