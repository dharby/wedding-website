"use client";

import { motion } from "framer-motion";

const reveal = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

export default function AsoEbi() {
  const wa = (num: string) => `https://wa.me/234${num.startsWith("0") ? num.slice(1) : num}`;

  return (
    <section id="asoebi" className="py-14 md:py-20 bg-sage-light/40">
      <div className="max-w-3xl mx-auto px-5">
        <motion.div
          custom={0}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={reveal}
          className="text-center mb-8 md:mb-12"
        >
          <p className="text-[0.7rem] sm:text-[0.75rem] uppercase tracking-[0.3em] text-gold/70 font-sans mb-3">
            Be Part of the Celebration
          </p>
          <h2 className="text-[1.8rem] sm:text-[2.2rem] font-serif text-emerald mb-2">
            Aso Ebi
          </h2>
          <div className="flex items-center justify-center gap-4 mb-5">
            <span className="w-10 h-px bg-gold/30" />
            <span className="w-1.5 h-1.5 rounded-full bg-gold/40" />
            <span className="w-10 h-px bg-gold/30" />
          </div>
          <p className="text-[0.85rem] sm:text-[0.9rem] text-ink-muted font-sans max-w-md mx-auto leading-relaxed">
            Join our Aso Ebi family and celebrate with us in unity and style. Your support means the world to us.
          </p>
        </motion.div>

        {/* Fabric placeholder */}
        <motion.div
          custom={1}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={reveal}
          className="mb-8 rounded-[2px] overflow-hidden border border-sage-border/40"
        >
          <div className="aspect-[16/7] bg-gradient-to-br from-emerald via-emerald-mid to-emerald flex items-center justify-center relative">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-6 left-8 text-4xl">❀</div>
              <div className="absolute bottom-8 right-10 text-3xl">✿</div>
            </div>
            <div className="text-center text-cream/80 z-10">
              <p className="text-[0.75rem] sm:text-[0.8rem] uppercase tracking-[0.25em] font-sans mb-1">Fabric Preview</p>
              <p className="text-[1.25rem] sm:text-[1.5rem] font-serif">Emerald Green & Gold</p>
            </div>
          </div>
        </motion.div>

        {/* Contacts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <motion.div
            custom={2}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={reveal}
            className="text-center py-6 px-5 border border-sage-border/40 rounded-[2px] bg-white/60"
          >
            <p className="text-[0.7rem] sm:text-[0.75rem] uppercase tracking-[0.2em] text-gold/60 font-sans mb-1">
              For the Bride&apos;s Side
            </p>
            <p className="text-[1rem] font-serif text-emerald font-medium mb-0.5">Moyin</p>
            <p className="text-[0.8rem] sm:text-[0.85rem] text-ink-muted font-sans mb-4">0813 423 4560</p>
              <div className="flex items-center justify-center gap-3">
              <a href={wa("08134234560")} target="_blank" rel="noopener noreferrer"
                className="h-8 px-4 flex items-center justify-center text-[0.7rem] sm:text-[0.75rem] uppercase tracking-[0.15em] font-sans text-cream bg-emerald border border-gold/30 rounded-[2px] transition-all duration-300 hover:bg-emerald-mid hover:-translate-y-0.5 active:scale-[0.98]">
                WhatsApp
              </a>
              <a href="tel:08134234560"
                className="h-8 px-4 flex items-center justify-center text-[0.7rem] sm:text-[0.75rem] uppercase tracking-[0.15em] font-sans text-emerald border border-emerald/20 rounded-[2px] transition-all duration-300 hover:bg-emerald hover:text-cream hover:-translate-y-0.5 active:scale-[0.98]">
                Call
              </a>
            </div>
          </motion.div>

          <motion.div
            custom={3}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={reveal}
            className="text-center py-6 px-5 border border-sage-border/40 rounded-[2px] bg-white/60"
          >
            <p className="text-[0.7rem] sm:text-[0.75rem] uppercase tracking-[0.2em] text-gold/60 font-sans mb-1">
              For the Groom&apos;s Side
            </p>
            <p className="text-[1rem] font-serif text-emerald font-medium mb-0.5">Princess</p>
            <p className="text-[0.8rem] sm:text-[0.85rem] text-ink-muted font-sans mb-4">0701 018 0279</p>
              <div className="flex items-center justify-center gap-3">
              <a href={wa("07010180279")} target="_blank" rel="noopener noreferrer"
                className="h-8 px-4 flex items-center justify-center text-[0.7rem] sm:text-[0.75rem] uppercase tracking-[0.15em] font-sans text-cream bg-emerald border border-gold/30 rounded-[2px] transition-all duration-300 hover:bg-emerald-mid hover:-translate-y-0.5 active:scale-[0.98]">
                WhatsApp
              </a>
              <a href="tel:07010180279"
                className="h-8 px-4 flex items-center justify-center text-[0.7rem] sm:text-[0.75rem] uppercase tracking-[0.15em] font-sans text-emerald border border-emerald/20 rounded-[2px] transition-all duration-300 hover:bg-emerald hover:text-cream hover:-translate-y-0.5 active:scale-[0.98]">
                Call
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
