"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const WEDDING = new Date("2026-11-28T12:00:00+01:00").getTime();

interface TimeUnit {
  label: string;
  value: number;
}

export default function Countdown() {
  const [units, setUnits] = useState<TimeUnit[]>([
    { label: "Days", value: 0 },
    { label: "Hours", value: 0 },
    { label: "Minutes", value: 0 },
    { label: "Seconds", value: 0 },
  ]);
  const [isToday, setIsToday] = useState(false);

  useEffect(() => {
    const calc = () => {
      const now = Date.now();
      const diff = WEDDING - now;
      if (diff <= 0) {
        setIsToday(true);
        return;
      }
      setUnits([
        { label: "Days", value: Math.floor(diff / 86400000) },
        { label: "Hours", value: Math.floor((diff % 86400000) / 3600000) },
        { label: "Minutes", value: Math.floor((diff % 3600000) / 60000) },
        { label: "Seconds", value: Math.floor((diff % 60000) / 1000) },
      ]);
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="py-12 md:py-18 bg-cream">
      <div className="max-w-3xl mx-auto px-5 text-center">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-[0.75rem] sm:text-[0.8rem] uppercase tracking-[0.3em] text-gold/70 font-sans mb-8"
        >
          Counting Down
        </motion.p>

        {isToday ? (
          <motion.p
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-[1.8rem] sm:text-[2.2rem] font-serif text-emerald"
          >
            Today is the Day
          </motion.p>
        ) : (
          <div className="flex items-center justify-center gap-3 sm:gap-5">
            {units.map((u, i) => (
              <motion.div
                key={u.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.7 }}
                className="flex flex-col items-center"
              >
                <div className="w-[3.8rem] h-[4.2rem] sm:w-[5rem] sm:h-[5.5rem] md:w-[5.8rem] md:h-[6.2rem] flex items-center justify-center border border-sage-border/60 rounded-[2px] bg-white/50 transition-colors duration-500 hover:border-gold/40">
                  <span className="text-[1.8rem] sm:text-[2.2rem] md:text-[2.4rem] font-serif text-emerald font-light tabular-nums">
                    {String(u.value).padStart(2, "0")}
                  </span>
                </div>
                <span className="mt-2 text-[0.45rem] sm:text-[0.7rem] uppercase tracking-[0.2em] text-ink-muted/60 font-sans">
                  {u.label}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
