import { NextRequest, NextResponse } from "next/server";
import { submitGiftConfirmation } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sender_name, sender_contact } = body;

    if (!sender_name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const result = await submitGiftConfirmation({
      invitation_id: null,
      sender_name,
      sender_contact,
    });

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
