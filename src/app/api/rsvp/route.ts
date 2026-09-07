import { NextRequest, NextResponse } from "next/server";
import { submitRSVP } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { guest_name, guest_contact, attendance, guest_count, meal_preference, message } = body;

    if (!guest_name || !attendance) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const result = await submitRSVP({
      invitation_id: null,
      guest_name,
      guest_contact,
      attendance,
      guest_count: Math.min(guest_count || 1, 1),
      meal_preference,
      message,
    });

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
