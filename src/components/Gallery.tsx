"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const photos = [
  { id: 1, src: "/images/couple-01.jpg" },
  { id: 2, src: "/images/couple-02.jpg" },
  { id: 3, src: "/images/couple-03.jpg" },
  { id: 4, src: "/images/couple-04.jpg" },
  { id: 5, src: "/images/couple-05.jpg" },
  { id: 6, src: "/images/couple-06.jpg" },
  { id: 7, src: "/images/couple-07.jpg" },
  { id: 8, src: "/images/couple-08.jpg" },
  { id: 9, src: "/images/couple-09.jpg" },
  { id: 10, src: "/images/couple-10.jpg" },
  { id: 11, src: "/images/couple-11.jpg" },
  { id: 12, src: "/images/couple-12.jpg" },
  { id: 13, src: "/images/couple-13.jpg" },
  { id: 14, src: "/images/couple-14.jpg" },
  { id: 15, src: "/images/couple-15.jpg" },
  { id: 16, src: "/images/couple-16.jpg" },
  { id: 17, src: "/images/couple-17.jpg" },
  { id: 18, src: "/images/couple-18.jpg" },
  { id: 19, src: "/images/couple-19.jpg" },
  { id: 20, src: "/images/couple-20.jpg" },
];

export default function Gallery() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [direction, setDirection] = useState(1);
  const stripRef = useRef<HTMLDivElement>(null);

  const goTo = useCallback((idx: number) => {
    setDirection(idx > current ? 1 : -1);
    setCurrent(idx);
  }, [current]);

  const next = useCallback(() => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % photos.length);
  }, []);

  const prev = useCallback(() => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + photos.length) % photos.length);
  }, []);

  // Auto-advance
  useEffect(() => {
    if (paused) return;
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [paused, next]);

  // Scroll thumbnail into view (only within the strip, not the page)
  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;
    const thumb = strip.children[current] as HTMLElement;
    if (thumb) {
      const thumbCenter = thumb.offsetLeft + thumb.offsetWidth / 2;
      const stripCenter = strip.offsetWidth / 2;
      strip.scrollTo({ left: thumbCenter - stripCenter, behavior: "smooth" });
    }
  }, [current]);

  const slideVariants = {
    enter: (d: number) => ({ x: d > 0 ? "100%" : "-100%", opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? "-100%" : "100%", opacity: 0 }),
  };

  return (
    <section id="gallery" className="py-14 md:py-20 bg-cream">
      <div className="max-w-5xl mx-auto px-5">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8 md:mb-12"
        >
          <p className="text-[0.7rem] sm:text-[0.75rem] uppercase tracking-[0.3em] text-gold/70 font-sans mb-3">
            Our Journey
          </p>
          <h2 className="text-[2rem] sm:text-[2.2rem] font-serif font-light text-emerald mb-2">
            Captured Moments
          </h2>
          <div className="flex items-center justify-center gap-4">
            <span className="w-10 h-px bg-gold/30" />
            <span className="w-1.5 h-1.5 rounded-full bg-gold/40" />
            <span className="w-10 h-px bg-gold/30" />
          </div>
        </motion.div>

        {/* Main carousel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Image container */}
          <div className="relative w-full aspect-[3/4] sm:aspect-[4/5] max-h-[70vh] overflow-hidden rounded-[2px] bg-emerald/5">
            <AnimatePresence custom={direction} mode="popLayout">
              <motion.img
                key={current}
                src={photos[current].src}
                alt=""
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                className="absolute inset-0 w-full h-full object-cover"
                draggable={false}
              />
            </AnimatePresence>

            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-emerald/20 via-transparent to-transparent pointer-events-none" />

            {/* Nav arrows */}
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-cream/80 dark:bg-emerald/80 backdrop-blur-sm flex items-center justify-center text-emerald dark:text-cream hover:bg-cream dark:hover:bg-emerald transition-colors shadow-lg"
              aria-label="Previous photo"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-cream/80 dark:bg-emerald/80 backdrop-blur-sm flex items-center justify-center text-emerald dark:text-cream hover:bg-cream dark:hover:bg-emerald transition-colors shadow-lg"
              aria-label="Next photo"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Counter */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-emerald/60 backdrop-blur-sm text-cream text-[0.65rem] font-sans tracking-wider">
              {current + 1} / {photos.length}
            </div>
          </div>

          {/* Thumbnail strip */}
          <div
            ref={stripRef}
            className="mt-3 flex gap-1.5 overflow-x-auto scrollbar-hide pb-1"
          >
            {photos.map((photo, i) => (
              <button
                key={photo.id}
                onClick={() => goTo(i)}
                className={`shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-[2px] overflow-hidden border-2 transition-all duration-300 ${
                  i === current
                    ? "border-gold opacity-100 scale-105"
                    : "border-transparent opacity-50 hover:opacity-80"
                }`}
              >
                <img
                  src={photo.src}
                  alt=""
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
