import { NextResponse } from "next/server";
import { USHER_COOKIE } from "@/lib/checkin-auth";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(USHER_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
