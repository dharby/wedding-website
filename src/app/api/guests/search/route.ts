import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get("name");

    if (!name || name.trim().length < 2) {
      return NextResponse.json({ error: "Name must be at least 2 characters" }, { status: 400 });
    }

    const supabase = getSupabaseServer();

    const { data: guests, error } = await supabase
      .from("invitations")
      .select("id, guest_name, invitation_token, rsvp_status, rsvp_id")
      .ilike("guest_name", `%${name.trim()}%`)
      .eq("is_active", true)
      .order("guest_name");

    if (error) {
      console.error("Search error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ guests: guests || [] });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}