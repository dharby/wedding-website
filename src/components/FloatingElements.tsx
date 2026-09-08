"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const quotes = [
  { text: "Love is patient, love is kind", ref: "1 Corinthians 13:4" },
  { text: "A good wife is from the Lord", ref: "Proverbs 19:14" },
  { text: "Two are better than one", ref: "Ecclesiastes 4:9" },
  { text: "What God has joined together, let no one separate", ref: "Matthew 19:6" },
  { text: "Love never fails", ref: "1 Corinthians 13:8" },
  { text: "Commit your way to the Lord", ref: "Psalm 37:5" },
  { text: "A happy home is built on love and trust", ref: "" },
  { text: "The Lord bless you and keep you", ref: "Numbers 6:24" },
  { text: "Love covers over all wrongs", ref: "1 Peter 4:8" },
  { text: "Be devoted to one another in love", ref: "Romans 12:10" },
  { text: "May your marriage be filled with joy", ref: "" },
  { text: "Faith, hope, and love remain", ref: "1 Corinthians 13:13" },
  { text: "A cord of three strands is not quickly broken", ref: "Ecclesiastes 4:12" },
  { text: "Love one another deeply, from the heart", ref: "1 Peter 1:22" },
  { text: "He who finds a wife finds what is good", ref: "Proverbs 18:22" },
];

const hearts = ["♥", "♡", "❤", "💕", "💍"];
const sparkles = ["✨", "⭐", "💫", "🌟"];

export default function FloatingElements() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [started, setStarted] = useState(false);
  const [floatingItems, setFloatingItems] = useState<Array<{ id: number; type: 'heart' | 'sparkle'; char: string; left: number; delay: number; duration: number }>>([]);

  useEffect(() => {
    const initialTimeout = setTimeout(() => setStarted(true), 3000);
    return () => clearTimeout(initialTimeout);
  }, []);

  // Shuffle to the next verse/wish every 3 seconds, indefinitely.
  useEffect(() => {
    if (!started) return;
    const id = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % quotes.length);
    }, 3000);
    return () => clearInterval(id);
  }, [started]);

  // Floating hearts and sparkles
  useEffect(() => {
    const interval = setInterval(() => {
      const id = Date.now();
      const isHeart = Math.random() > 0.5;
      const type: 'heart' | 'sparkle' = isHeart ? 'heart' : 'sparkle';
      const char = isHeart 
        ? hearts[Math.floor(Math.random() * hearts.length)]
        : sparkles[Math.floor(Math.random() * sparkles.length)];
      const left = Math.random() * 80 + 10; // 10% to 90%
      const delay = Math.random() * 0.3;
      const duration = 4 + Math.random() * 3; // 4-7 seconds

      setFloatingItems(prev => {
        const newItems = [...prev, { id, type, char, left, delay, duration }];
        // Keep only last 8 items
        return newItems.slice(-8);
      });
    }, 2000); // Every 2 seconds

    return () => clearInterval(interval);
  }, []);

  // Clean up old items
  useEffect(() => {
    const cleanup = setInterval(() => {
      setFloatingItems(prev => prev.filter(item => Date.now() - item.id < 7000));
    }, 1000);
    return () => clearInterval(cleanup);
  }, []);

  const quote = quotes[currentIndex];

  return (
    <>
      {/* Floating hearts and sparkles */}
      <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden">
        {floatingItems.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: '100vh', x: 0, scale: 0.5 }}
            animate={{ opacity: [0, 0.7, 0.7, 0], y: '-20vh', x: [0, 15, -15, 10], scale: [0.5, 1, 0.8, 0.6] }}
            transition={{ duration: item.duration, delay: item.delay, ease: 'easeOut' }}
            className={`absolute text-xl sm:text-2xl ${
              item.type === 'heart' ? 'text-gold/50 dark:text-gold/40' : 'text-gold/40 dark:text-gold/30'
            }`}
            style={{ left: `${item.left}%` }}
          >
            {item.char}
          </motion.div>
        ))}
      </div>

      {/* Bible verse notification */}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 pointer-events-none w-full max-w-sm px-4">
        <AnimatePresence mode="wait">
          {started && (
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="bg-emerald dark:bg-emerald-deep/95 backdrop-blur-md px-5 py-3 rounded-lg shadow-lg border border-gold/30"
            >
              <div className="flex items-start gap-3">
                <span className="text-gold text-lg mt-0.5">✦</span>
                <div className="flex-1">
                  <p className="text-[0.75rem] sm:text-[0.8rem] font-serif text-cream leading-snug">
                    {quote.text}
                  </p>
                  {quote.ref && (
                    <p className="text-[0.6rem] sm:text-[0.65rem] text-gold/80 font-sans mt-1">
                      — {quote.ref}
                    </p>
                  )}
                </div>
                <span className="text-gold text-lg mt-0.5">✦</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
