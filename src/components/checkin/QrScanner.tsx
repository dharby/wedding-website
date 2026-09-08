"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  onScan: (text: string) => void;
  onCameraError: () => void;
}

// Camera QR reader (dynamically imported so it never touches SSR).
// Unmounting this component releases the camera.
export default function QrScanner({ onScan, onCameraError }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const onScanRef = useRef(onScan);
  const onErrorRef = useRef(onCameraError);
  onScanRef.current = onScan;
  onErrorRef.current = onCameraError;
  const [starting, setStarting] = useState(true);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let scanner: any = null;

    (async () => {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        if (cancelled || !hostRef.current) return;
        scanner = new Html5Qrcode("usher-qr-reader");
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 240, height: 240 } },
          (decodedText: string) => {
            const text = (decodedText || "").trim();
            if (text) onScanRef.current(text);
          },
          () => {
            /* per-frame decode misses are normal; ignore */
          }
        );
        if (!cancelled) setStarting(false);
      } catch {
        if (!cancelled) {
          setStarting(false);
          onErrorRef.current();
        }
      }
    })();

    return () => {
      cancelled = true;
      try {
        const s = scanner;
        if (s) {
          s.stop()
            .then(() => s.clear().catch(() => {}))
            .catch(() => {});
        }
      } catch {
        /* ignore teardown errors */
      }
    };
  }, []);

  return (
    <div className="w-full">
      <div
        id="usher-qr-reader"
        ref={hostRef}
        className="w-full overflow-hidden rounded-md border border-[#C5A059]/40 bg-black"
      />
      {starting && (
        <p className="mt-3 text-center text-sm text-[#0E281E]/60">Starting camera…</p>
      )}
    </div>
  );
}
