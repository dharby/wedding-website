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
      .select("id, guest_name, invitation_token, rsvp_status, rsvp_category, rsvp_id")
      .ilike("guest_name", `%${name.trim()}%`)
      .eq("is_active", true)
      .order("guest_name");

    if (error) {
      console.error("Search error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Fetch reference numbers for guests who have RSVP'd
    const rows = guests || [];
    const rsvpIds = rows.filter((g) => g.rsvp_id).map((g) => g.rsvp_id);
    const refByRsvp = new Map<string, string>();
    if (rsvpIds.length > 0) {
      const { data: rsvps } = await supabase
        .from("rsvps")
        .select("id, reference_number")
        .in("id", rsvpIds);
      for (const r of rsvps || []) {
        if (r.id && r.reference_number) refByRsvp.set(r.id, r.reference_number);
      }
    }

    const enriched = rows.map((g) => ({
      ...g,
      reference_number: g.rsvp_id ? refByRsvp.get(g.rsvp_id) || null : null,
    }));

    return NextResponse.json({ guests: enriched });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}