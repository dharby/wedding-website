import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase";

function generateToken(): string {
  return "tok_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { guests } = body;

    if (!guests || !Array.isArray(guests) || guests.length === 0) {
      return NextResponse.json({ error: "Guests array is required" }, { status: 400 });
    }

    const supabase = getSupabaseServer();

    const insertData = guests.map((guest: { name: string; contact?: string }) => ({
      invitation_token: generateToken(),
      guest_name: guest.name,
      guest_contact: guest.contact || null,
      allowed_guests: 1,
      rsvp_status: "pending",
      is_active: true,
    }));

    const { data, error } = await supabase
      .from("invitations")
      .insert(insertData)
      .select("id, guest_name, invitation_token");

    if (error) {
      console.error("Insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      count: data?.length || 0,
      guests: data 
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}