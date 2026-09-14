"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const reveal = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

const photos = [
  { src: "/pre-wedding/1.jpg", alt: "Pre-wedding photo 1" },
  { src: "/pre-wedding/2.jpg", alt: "Pre-wedding photo 2" },
  { src: "/pre-wedding/3.jpg", alt: "Pre-wedding photo 3" },
  { src: "/pre-wedding/4.jpg", alt: "Pre-wedding photo 4" },
  { src: "/pre-wedding/5.jpg", alt: "Pre-wedding photo 5" },
];

export default function PreWeddingPhotosPage() {
  return (
    <section className="py-14 md:py-20 bg-cream min-h-dvh">
      <div className="max-w-5xl mx-auto px-5">
        <motion.div
          custom={0}
          initial="hidden"
          animate="visible"
          variants={reveal}
          className="text-center mb-10 md:mb-14"
        >
          <p className="text-[0.7rem] sm:text-[0.75rem] uppercase tracking-[0.3em] text-gold/70 font-sans mb-3">
            Our Journey
          </p>
          <h2 className="text-[2rem] sm:text-[2.2rem] font-serif font-light text-emerald mb-2">
            Pre-Wedding Moments
          </h2>
          <div className="flex items-center justify-center gap-4 mb-5">
            <span className="w-10 h-px bg-gold/30" />
            <span className="w-1.5 h-1.5 rounded-full bg-gold/40" />
            <span className="w-10 h-px bg-gold/30" />
          </div>
          <p className="text-[0.85rem] sm:text-[0.9rem] text-ink-muted font-sans max-w-md mx-auto leading-relaxed">
            Capturing the love and joy leading up to our big day
          </p>
        </motion.div>

        <motion.div
          custom={1}
          initial="hidden"
          animate="visible"
          variants={reveal}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
        >
          {photos.map((photo, index) => (
            <motion.div
              key={photo.src}
              custom={index}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={reveal}
              className="group relative aspect-[4/5] md:aspect-[3/4] overflow-hidden rounded-[2px] bg-white border border-sage-border/40"
            >
              <div className="absolute inset-0 z-10 bg-gradient-to-t from-cream/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                placeholder="blur"
                blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
              />
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          custom={2}
          initial="hidden"
          animate="visible"
          variants={reveal}
          className="mt-10 text-center"
        >
          <a
            href="#"
            className="inline-flex items-center gap-2 text-[0.75rem] sm:text-[0.8rem] uppercase tracking-[0.18em] font-sans text-gold/80 hover:text-gold transition-colors"
          >
            Back to Home
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  );
}