"use client";

import { motion } from "framer-motion";

interface FooterProps {
  onReplay?: () => void;
}

export default function Footer({ onReplay }: FooterProps) {
  return (
    <footer className="py-12 md:py-18 bg-emerald">
      <div className="max-w-2xl mx-auto px-5 text-center">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <p className="text-[2.2rem] sm:text-[2.5rem] font-serif font-light text-cream/90 tracking-[-0.02em] mb-2">
            Anuoluwapo &amp; Tochukwu
          </p>
          <p className="text-[0.75rem] sm:text-[0.8rem] uppercase tracking-[0.3em] text-gold/60 font-sans mb-6">
            28.11.2026
          </p>

          <div className="flex items-center justify-center gap-4 mb-6">
            <span className="w-8 h-px bg-gold/20" />
            <span className="text-gold/40 text-[0.8rem] font-serif">✦</span>
            <span className="w-8 h-px bg-gold/20" />
          </div>

          <p className="text-[0.8rem] sm:text-[0.85rem] text-cream/50 font-sans leading-relaxed mb-10">
            With love, we cannot wait to celebrate with you.
          </p>

          {/* Botanical accent */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <svg className="w-6 h-6 opacity-20" viewBox="0 0 24 24" fill="none" stroke="#C5A059" strokeWidth="0.8">
              <path d="M12 2C8 6 4 10 4 14c0 4 3.5 8 8 8s8-4 8-8c0-4-4-8-8-12z" />
              <path d="M12 6c-2 3-4 6-4 9 0 2.5 2 5 4 5s4-2.5 4-5c0-3-2-6-4-9z" opacity="0.5" />
            </svg>
          </div>

          {/* Credits */}
          <div className="flex items-center justify-center gap-2 mb-2">
            <p className="text-[0.65rem] sm:text-[0.7rem] uppercase tracking-[0.2em] text-gold/50 font-sans">
              Website & Photography by
            </p>
            <svg className="w-5 h-5 text-gold/60" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
          </div>
          <a
            href="https://www.instagram.com/cleekrightstudios?utm_source=ig_web_button_share_sheet&stkn=ZDNlZDc0MzIxNw=="
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[0.85rem] sm:text-[0.95rem] font-medium text-cream hover:text-gold transition-colors"
          >
            <span className="font-script">@cleekrightstudios</span>
          </a>

          {/* Replay invitation */}
          {onReplay && (
            <button
              onClick={onReplay}
              className="text-[0.45rem] sm:text-[0.7rem] uppercase tracking-[0.25em] text-cream/30 font-sans hover:text-cream/60 transition-colors border-b border-cream/10 hover:border-cream/30 pb-0.5"
            >
              Replay Invitation
            </button>
          )}
        </motion.div>
      </div>
    </footer>
  );
}
