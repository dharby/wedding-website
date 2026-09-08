"use client";

import { useState, useCallback, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import EnvelopeOpening from "@/components/EnvelopeOpening";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import FamilyInvitation from "@/components/FamilyInvitation";
import WeddingDetails from "@/components/WeddingDetails";
import Countdown from "@/components/Countdown";
import DressCode from "@/components/DressCode";
import OurStory from "@/components/OurStory";
import Gallery from "@/components/Gallery";
import RSVP from "@/components/RSVP";
import RSVPContacts from "@/components/RSVPContacts";
import AsoEbi from "@/components/AsoEbi";
import GiftRegistry from "@/components/GiftRegistry";
import FAQ from "@/components/FAQ";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import FloatingElements from "@/components/FloatingElements";
import { useTheme } from "@/lib/ThemeContext";

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="fixed top-4 right-4 z-50 w-10 h-10 rounded-full bg-emerald/80 backdrop-blur-sm flex items-center justify-center text-cream/80 hover:text-cream hover:bg-emerald transition-all duration-300 md:top-6 md:right-6"
      aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
    >
      {theme === "light" ? (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
        </svg>
      ) : (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
        </svg>
      )}
    </button>
  );
}

function MusicToggle({ playing, onToggle }: { playing: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="fixed bottom-5 right-5 z-[100] w-9 h-9 rounded-full bg-emerald/80 backdrop-blur-sm flex items-center justify-center text-cream/80 hover:text-cream hover:bg-emerald transition-all duration-300 md:bottom-8 md:right-8"
      aria-label={playing ? "Pause music" : "Play music"}
    >
      {playing ? (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="4" width="4" height="16" rx="1" />
          <rect x="14" y="4" width="4" height="16" rx="1" />
        </svg>
      ) : (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9 18V5l12-2v13" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      )}
    </button>
  );
}

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);

  const playMusic = useCallback(() => {
    const audio = document.getElementById('wedding-music') as HTMLAudioElement | null;
    if (!audio) return;
    audio.play().then(() => setMusicPlaying(true)).catch(() => {});
  }, []);

  const toggleMusic = useCallback(() => {
    const audio = document.getElementById('wedding-music') as HTMLAudioElement | null;
    if (!audio) return;
    if (musicPlaying) {
      audio.pause();
      setMusicPlaying(false);
    } else {
      audio.play().then(() => setMusicPlaying(true)).catch(() => {});
    }
  }, [musicPlaying]);

  // Attempt autoplay on load (browsers may block until first tap);
  // keep UI in sync with the actual audio element.
  useEffect(() => {
    playMusic();
    const audio = document.getElementById('wedding-music') as HTMLAudioElement | null;
    if (!audio) return;
    const onPlay = () => setMusicPlaying(true);
    const onPause = () => setMusicPlaying(false);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
    };
  }, [playMusic]);

  useEffect(() => {
    if (!isOpen) {
      document.body.classList.add("scroll-locked");
    } else {
      document.body.classList.remove("scroll-locked");
    }
    return () => document.body.classList.remove("scroll-locked");
  }, [isOpen]);

  // Opening the envelope is a user gesture, so start music here.
  // It keeps looping until the visitor manually pauses it.
  const handleOpen = useCallback(() => {
    playMusic();
    setIsOpen(true);
    setTimeout(() => setShowContent(true), 100);
  }, [playMusic]);

  const handleReplay = useCallback(() => {
    setShowContent(false);
    setIsOpen(false);
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  return (
    <main className="relative">
      {/* Always mounted: music starts on envelope tap and loops until manually stopped */}
      <audio
        id="wedding-music"
        src="/music/MAJOR._-_Why_I_Love_You_(mp3.pm).mp3"
        style={{ display: 'none' }}
        preload="auto"
        loop
      />
      {/* Floating music button visible from the envelope splash screen onward */}
      <MusicToggle playing={musicPlaying} onToggle={toggleMusic} />

      <AnimatePresence>
        {!isOpen && <EnvelopeOpening onOpen={handleOpen} />}
      </AnimatePresence>

      {showContent && (
        <>
          <Navigation />
          <ThemeToggle />
          <FloatingElements />

          <div id="home">
            <Hero />
          </div>

          <div className="w-24 mx-auto border-t border-gold/30" />

          <FamilyInvitation />

          <div className="w-24 mx-auto border-t border-gold/30" />

          <div id="story">
            <OurStory />
          </div>

          <div className="w-24 mx-auto border-t border-gold/30" />

          <WeddingDetails />

          <div className="w-24 mx-auto border-t border-gold/30" />

          <Countdown />

          <div className="w-24 mx-auto border-t border-gold/30" />

          <div id="dresscode">
            <DressCode />
          </div>

          <div className="w-24 mx-auto border-t border-gold/30" />

          <Gallery />

          <div className="w-24 mx-auto border-t border-gold/30" />

          <div id="asoebi">
            <AsoEbi />
          </div>

          <div className="w-24 mx-auto border-t border-gold/30" />

          <div id="registry">
            <GiftRegistry />
          </div>

          <div className="w-24 mx-auto border-t border-gold/30" />

          <div id="faq">
            <FAQ />
          </div>

          <div className="w-24 mx-auto border-t border-gold/30" />

          <RSVP />

          <div className="w-24 mx-auto border-t border-gold/30" />

          <RSVPContacts />

          <div className="w-24 mx-auto border-t border-gold/30" />

          <div id="contact">
            <Contact />
          </div>

          <Footer onReplay={handleReplay} />
        </>
      )}
    </main>
  );
}
