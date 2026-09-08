import type { Metadata, Viewport } from "next";
import CheckInApp from "@/components/checkin/CheckInApp";

export const metadata: Metadata = {
  title: "Guest Check-in | Anuoluwapo & Tochukwu",
  description: "Private usher check-in. Authorized ushers only.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function CheckInPage() {
  return (
    <main className="min-h-dvh bg-[#FBF9F4]">
      <CheckInApp />
    </main>
  );
}
