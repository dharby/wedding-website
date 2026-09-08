import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Great_Vibes, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/ThemeContext";

const cormorant = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const greatVibes = Great_Vibes({
  variable: "--font-script",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Anuoluwapo & Tochukwu | Wedding Celebration",
  description:
    "Join us as we celebrate the wedding of Anuoluwapo Adeoye and Tochukwu Ekwubiri on Saturday, November 28th, 2026 at Amen Center, Lagos, Nigeria.",
  keywords: ["wedding", "Nigerian wedding", "Anuoluwapo", "Tochukwu", "2026", "Lagos", "Adeoye", "Ekwubiri"],
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "Anuoluwapo & Tochukwu | Wedding Celebration",
    description: "Saturday, November 28th, 2026 — Amen Center, Lagos",
    type: "website",
    locale: "en_NG",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FBF9F4" },
    { media: "(prefers-color-scheme: dark)", color: "#0E281E" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${greatVibes.variable} ${plusJakarta.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              var theme = localStorage.getItem('wedding-theme');
              if (theme === 'dark') {
                document.documentElement.classList.add('dark');
              } else {
                document.documentElement.classList.remove('dark');
              }
            } catch(e) {}
          })();
        `}} />
      </head>
      <body className="min-h-screen bg-cream dark:bg-emerald text-ink dark:text-cream antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
