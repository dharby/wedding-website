import { NextRequest, NextResponse } from "next/server";
import { requireUsher } from "@/lib/checkin-auth";
import { getSupabaseServer } from "@/lib/supabase";

const GENERIC = "Something went wrong. Please try again.";

export async function GET(req: NextRequest) {
  try {
    if (!(await requireUsher())) {
      return NextResponse.json({ error: "Session expired. Please log in again." }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim().slice(0, 64);

    const supabase = getSupabaseServer();

    // Try with check-in columns first; fall back if they don't exist.
    const BASE_COLS = "id, guest_name, guest_contact, rsvp_category, rsvp_status, invitation_token";
    const FULL_COLS = BASE_COLS + ", check_in_status, check_in_time";

    let cols = FULL_COLS;
    const probe = await supabase
      .from("invitations")
      .select("id")
      .eq("is_active", true)
      .limit(1);
    if (probe.error && String(probe.error.message).includes("check_in_status")) {
      cols = BASE_COLS;
    }

    // Fetch checked-in guests (or accepted if no check_in columns)
    let rows: any[] = [];
    if (cols === FULL_COLS) {
      const { data, error } = await supabase
        .from("invitations")
        .select(cols)
        .eq("is_active", true)
        .eq("check_in_status", "checked_in")
        .order("check_in_time", { ascending: false });
      if (error) {
        console.error("all checked-in query error:", error);
        return NextResponse.json({ error: GENERIC }, { status: 500 });
      }
      rows = data || [];
    } else {
      // Fallback: use rsvp_status = accepted as proxy
      const { data, error } = await supabase
        .from("invitations")
        .select(cols)
        .eq("is_active", true)
        .eq("rsvp_status", "accepted")
        .order("guest_name");
      if (error) {
        console.error("all checked-in fallback query error:", error);
        return NextResponse.json({ error: GENERIC }, { status: 500 });
      }
      rows = data || [];
    }

    // Search filter
    if (q.length >= 2) {
      const like = `%${q}%`;
      rows = rows.filter((r: any) =>
        r.guest_name?.toLowerCase().includes(q.toLowerCase()) ||
        r.guest_contact?.toLowerCase().includes(q.toLowerCase()) ||
        r.rsvp_category?.toLowerCase().includes(q.toLowerCase())
      );
    }

    // Fetch RSVP reference numbers
    const ids = rows.map((r: any) => r.id);
    const refByInvitation = new Map<string, string>();
    if (ids.length > 0) {
      const { data: codes } = await supabase
        .from("rsvps")
        .select("invitation_id, reference_number")
        .in("invitation_id", ids);
      for (const c of codes || []) {
        if (c.invitation_id && c.reference_number) refByInvitation.set(c.invitation_id, c.reference_number);
      }
    }

    const guests = rows.map((g: any) => ({
      id: g.id,
      name: g.guest_name,
      contact: g.guest_contact,
      category: g.rsvp_category,
      rsvpStatus: g.rsvp_status,
      code: refByInvitation.get(g.id) || g.invitation_token || null,
      checkInTime: g.check_in_time || null,
    }));

    const total = guests.length;
    return NextResponse.json({ guests, total });
  } catch (e) {
    console.error("all checked-in list failed:", e);
    return NextResponse.json({ error: GENERIC }, { status: 500 });
  }
}
