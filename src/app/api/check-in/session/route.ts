import { NextResponse } from "next/server";
import { requireUsher } from "@/lib/checkin-auth";

export async function GET() {
  const authenticated = await requireUsher();
  return NextResponse.json({ authenticated });
}
