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

const fabrics = [
  {
    name: "Emerald Green",
    hex: "#0E281E",
    type: "Swiss Lace",
    desc: "Elegant Swiss lace in rich emerald green",
    pattern: "radial-gradient(circle at 20% 30%, #1B3B2B 0%, transparent 30%), radial-gradient(circle at 80% 70%, #1B3B2B 0%, transparent 25%), radial-gradient(circle at 50% 50%, #0E281E 0%, #0A1F16 100%)",
  },
  {
    name: "Antique Gold",
    hex: "#B8860B",
    type: "Brocade",
    desc: "Gold brocade with intricate woven patterns",
    pattern: "repeating-linear-gradient(45deg, #D4A017 0px, #D4A017 2px, #B8860B 2px, #B8860B 4px), repeating-linear-gradient(-45deg, #D4A017 0px, #D4A017 2px, #8B6914 2px, #8B6914 4px)",
  },
  {
    name: "Sage Green",
    hex: "#4A6B53",
    type: "Ankara",
    desc: "Classic Ankara print in soft sage",
    pattern: "radial-gradient(circle at 25% 25%, #5A7B63 0%, transparent 20%), radial-gradient(circle at 75% 75%, #5A7B63 0%, transparent 20%), radial-gradient(circle at 50% 50%, #3A5B43 0%, #4A6B53 100%)",
  },
];

export default function AsoEbi() {
  const wa = (num: string) => `https://wa.me/234${num.startsWith("0") ? num.slice(1) : num}`;

  return (
    <section id="asoebi" className="py-14 md:py-20 bg-sage-light/40">
      <div className="max-w-4xl mx-auto px-5">
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
          <p className="text-[0.85rem] sm:text-[0.9rem] text-ink-muted font-sans max-w-lg mx-auto leading-relaxed">
            Join our Aso Ebi family and celebrate with us in unity and style. Choose your preferred fabric from our collection below.
          </p>
        </motion.div>

        {/* Fabric Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {fabrics.map((fabric, i) => (
            <motion.div
              key={fabric.name}
              custom={i + 1}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={reveal}
              className="group"
            >
              <div className="relative overflow-hidden rounded-[2px] border border-sage-border/40 dark:border-emerald-soft/30 transition-all duration-500 hover:-translate-y-1 hover:shadow-lg">
                {/* Fabric swatch */}
                <div
                  className="aspect-square w-full relative"
                  style={{ backgroundColor: fabric.hex }}
                >
                  {/* Simulated fabric texture */}
                  <div
                    className="absolute inset-0 opacity-40 mix-blend-overlay"
                    style={{ background: fabric.pattern }}
                  />
                  {/* Sheen effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/10" />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-500" />
                </div>
                {/* Label */}
                <div className="p-4 text-center bg-white dark:bg-emerald-mid">
                  <p className="text-[0.7rem] sm:text-[0.75rem] uppercase tracking-[0.2em] text-gold/70 font-sans mb-1">
                    {fabric.type}
                  </p>
                  <p className="text-[1rem] sm:text-[1.1rem] font-serif text-emerald dark:text-cream font-medium">
                    {fabric.name}
                  </p>
                  <p className="text-[0.7rem] sm:text-[0.75rem] text-ink-muted/60 dark:text-cream/50 font-sans mt-1">
                    {fabric.desc}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Contacts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <motion.div
            custom={5}
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
            custom={6}
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