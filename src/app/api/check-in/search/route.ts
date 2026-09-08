import { NextRequest, NextResponse } from "next/server";
import { requireUsher } from "@/lib/checkin-auth";
import { isCheckinCategory } from "@/lib/checkin-categories";
import { getSupabaseServer } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    if (!(await requireUsher())) {
      return NextResponse.json({ error: "Session expired. Please log in again." }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const rawQ = (searchParams.get("q") || "").trim();
    const category = searchParams.get("category") || "";

    if (!isCheckinCategory(category)) {
      return NextResponse.json({ error: "Please select a guest category first." }, { status: 400 });
    }
    const q = rawQ.replace(/[%_,\\]/g, "").slice(0, 64);
    if (q.length < 2) {
      return NextResponse.json({ error: "Enter at least 2 characters to search." }, { status: 400 });
    }

    const supabase = getSupabaseServer();

    // Simple test: can we query at all?
    const test = await supabase.from("invitations").select("id, guest_name").limit(3);
    if (test.error) {
      console.error("basic query error:", JSON.stringify(test.error));
      return NextResponse.json({ error: "Database query failed.", detail: test.error.message }, { status: 500 });
    }

    // Actual search by name (case-insensitive)
    const { data, error } = await supabase
      .from("invitations")
      .select("id, guest_name, guest_contact, rsvp_category, rsvp_status, invitation_token, check_in_status, check_in_time")
      .eq("rsvp_category", category)
      .eq("is_active", true)
      .ilike("guest_name", `%${q}%`)
      .order("guest_name")
      .limit(20);

    if (error) {
      console.error("search error:", JSON.stringify(error));
      return NextResponse.json({ error: "Search failed.", detail: error.message }, { status: 500 });
    }

    const refByInvitation = new Map<string, string>();

    // Attach RSVP reference numbers
    const ids = (data || []).map((g) => g.id);
    if (ids.length > 0) {
      const { data: codes } = await supabase
        .from("rsvps")
        .select("invitation_id, reference_number")
        .in("invitation_id", ids);
      for (const c of codes || []) {
        if (c.invitation_id && c.reference_number) refByInvitation.set(c.invitation_id, c.reference_number);
      }
    }

    const guests = (data || []).map((g) => ({
      id: g.id,
      name: g.guest_name,
      contact: g.guest_contact,
      category: g.rsvp_category,
      rsvpStatus: g.rsvp_status,
      code: refByInvitation.get(g.id) || g.invitation_token || null,
      checkInStatus: g.check_in_status || "not_checked_in",
      checkInTime: g.check_in_time || null,
    }));

    return NextResponse.json({ guests });
  } catch (e) {
    console.error("search exception:", e);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
