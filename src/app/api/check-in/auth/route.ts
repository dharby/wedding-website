import { NextRequest, NextResponse } from "next/server";
import {
  USHER_COOKIE,
  USHER_SESSION_TTL_SECONDS,
  createUsherSession,
  isCheckinConfigured,
  passwordsMatch,
} from "@/lib/checkin-auth";

export async function POST(req: NextRequest) {
  try {
    if (!isCheckinConfigured()) {
      return NextResponse.json({ error: "Check-in is not available right now." }, { status: 503 });
    }
    const body = await req.json().catch(() => null);
    const password = typeof body?.password === "string" ? body.password : "";
    if (!password || !passwordsMatch(password)) {
      return NextResponse.json({ error: "Incorrect password. Please try again." }, { status: 401 });
    }
    const res = NextResponse.json({ ok: true });
    res.cookies.set(USHER_COOKIE, createUsherSession(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: USHER_SESSION_TTL_SECONDS,
    });
    return res;
  } catch {
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
