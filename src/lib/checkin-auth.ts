// SERVER ONLY — never import this file from client components.
// Usher session auth: HMAC-signed timestamp cookie. No server session store,
// no password ever leaves the server (the browser only sees ok/401).

import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const USHER_COOKIE = "usher_session";
export const USHER_SESSION_TTL_SECONDS = 12 * 60 * 60; // 12 hours

function getSecret(): string | null {
  const s = process.env.USHER_CHECKIN_PASSWORD;
  return s && s.length > 0 ? s : null;
}

export function isCheckinConfigured(): boolean {
  return getSecret() !== null;
}

function sign(exp: string, secret: string): string {
  return createHmac("sha256", secret).update(`usher-session:${exp}`).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

export function passwordsMatch(input: string): boolean {
  const secret = getSecret();
  if (!secret) return false;
  return safeEqual(input, secret);
}

export function createUsherSession(): string {
  const secret = getSecret() ?? "";
  const exp = String(Date.now() + USHER_SESSION_TTL_SECONDS * 1000);
  return `${exp}.${sign(exp, secret)}`;
}

export function verifyUsherSession(token: string | undefined | null): boolean {
  if (!token) return false;
  const secret = getSecret();
  if (!secret) return false;
  const dot = token.indexOf(".");
  if (dot <= 0) return false;
  const exp = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (!/^\d+$/.test(exp) || sig.length === 0) return false;
  if (Number(exp) < Date.now()) return false;
  return safeEqual(sig, sign(exp, secret));
}

export async function requireUsher(): Promise<boolean> {
  const store = await cookies();
  return verifyUsherSession(store.get(USHER_COOKIE)?.value);
}
