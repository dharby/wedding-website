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

const events = [
  {
    title: "Traditional Wedding",
    date: "Saturday, November 28th, 2026",
    time: "12:00 PM",
    venue: "Amen Center",
    address: "2nd Ave, Ipaja, Lagos 102213, Lagos",
    dressCode: "Traditional Attire — Emerald Green & Gold",
  },
  {
    title: "Reception",
    date: "Saturday, November 28th, 2026",
    time: "Reception Follows Immediately",
    venue: "Amen Center",
    address: "2nd Ave, Ipaja, Lagos 102213, Lagos",
    dressCode: "Formal — Emerald Green, Gold & Sage",
  },
];

export default function WeddingDetails() {
  const mapsUrl = "https://www.google.com/maps/search/?api=1&query=Amen+Center+2nd+Ave+Ipaja+Lagos+Nigeria";
  const calendarUrl = (() => {
    const start = "20261128T120000";
    const end = "20261128T180000";
    const title = encodeURIComponent("Anuoluwapo & Tochukwu — Wedding Celebration");
    const location = encodeURIComponent("Amen Center, 2nd Ave, Ipaja, Lagos 102213, Lagos, Nigeria");
    const details = encodeURIComponent("Wedding ceremony of Anuoluwapo Adeoye and Tochukwu Ekwubiri. Reception follows immediately.");
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&location=${location}&details=${details}`;
  })();

  return (
    <section id="details" className="py-14 md:py-20 bg-cream">
      <div className="max-w-3xl mx-auto px-5">
        <motion.div
          custom={0}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={reveal}
          className="text-center mb-10 md:mb-14"
        >
          <p className="text-[0.7rem] sm:text-[0.75rem] uppercase tracking-[0.3em] text-gold/70 font-sans mb-3">
            The Celebration
          </p>
          <div className="flex items-center justify-center gap-4">
            <span className="w-10 h-px bg-gold/30" />
            <span className="w-1.5 h-1.5 rounded-full bg-gold/40" />
            <span className="w-10 h-px bg-gold/30" />
          </div>
        </motion.div>

        <div className="space-y-0">
          {events.map((event, i) => (
            <motion.div
              key={event.title}
              custom={i + 1}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={reveal}
              className="text-center py-8"
            >
              <h3 className="text-[1.6rem] sm:text-[1.7rem] font-serif font-light text-emerald mb-3">
                {event.title}
              </h3>
              <div className="w-12 h-px bg-gold/30 mx-auto mb-3" />
              <p className="text-[1.1rem] sm:text-[1rem] font-serif text-ink mb-1">
                {event.date}
              </p>
              {event.time === "Reception Follows Immediately" ? (
                <p className="text-[1rem] sm:text-[1.1rem] font-script text-gold mb-2">
                  {event.time}
                </p>
              ) : (
                <p className="text-[1rem] sm:text-[1.1rem] font-serif text-gold mb-2">
                  {event.time}
                </p>
              )}
              <p className="text-[0.9rem] font-sans text-ink mb-0.5">
                {event.venue}
              </p>
              <p className="text-[0.8rem] font-sans text-ink-muted">
                {event.address}
              </p>
              <p className="text-[0.75rem] font-sans text-ink-muted/60 mt-2">
                {event.dressCode}
              </p>
              {i < events.length - 1 && (
                <div className="w-16 h-px bg-gold/20 mx-auto mt-8" />
              )}
            </motion.div>
          ))}
        </div>

        {/* Actions */}
        <motion.div
          custom={5}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={reveal}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-10"
        >
          <a href={calendarUrl} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center justify-center h-10 px-6 bg-emerald text-cream text-[0.75rem] sm:text-[0.8rem] uppercase tracking-[0.18em] font-sans font-medium border border-gold/30 rounded-[3px] transition-all duration-300 hover:bg-emerald-mid hover:border-gold/50 hover:-translate-y-0.5 active:scale-[0.98]">
            Add to Google Calendar
          </a>
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center justify-center h-10 px-6 bg-transparent text-emerald text-[0.75rem] sm:text-[0.8rem] uppercase tracking-[0.18em] font-sans font-medium border border-sage-border rounded-[3px] transition-all duration-300 hover:border-emerald-soft/40 hover:bg-sage-light/50 hover:-translate-y-0.5 active:scale-[0.98]">
            Get Directions
          </a>
        </motion.div>
      </div>

      <div className="flex items-center justify-center gap-4 mt-12">
        <span className="w-8 h-px bg-gold/20" />
        <span className="w-1 h-1 rounded-full bg-gold/30" />
        <span className="w-8 h-px bg-gold/20" />
      </div>
    </section>
  );
}
