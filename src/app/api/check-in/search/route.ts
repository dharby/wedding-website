import { NextRequest, NextResponse } from "next/server";
import { requireUsher } from "@/lib/checkin-auth";
import { isCheckinCategory } from "@/lib/checkin-categories";
import { getSupabaseServer } from "@/lib/supabase";

const GENERIC = "Something went wrong. Please try again.";
const BASE_COLS = "id, guest_name, guest_contact, rsvp_category, rsvp_status, invitation_token";
const FULL_COLS = BASE_COLS + ", check_in_status, check_in_time";

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
    const like = `%${q}%`;

    // Try with full columns first; fall back if check-in columns don't exist.
    let cols = FULL_COLS;
    const probe = await supabase
      .from("invitations")
      .select(cols)
      .eq("rsvp_category", category)
      .eq("is_active", true)
      .limit(1);
    if (probe.error && String(probe.error.message).includes("check_in_status")) {
      cols = BASE_COLS;
    }

    const { data, error } = await supabase
      .from("invitations")
      .select(cols)
      .eq("rsvp_category", category)
      .eq("is_active", true)
      .ilike("guest_name", like)
      .order("guest_name")
      .limit(20);

    if (error) {
      console.error("search error:", error);
      return NextResponse.json({ error: GENERIC }, { status: 500 });
    }

    const refByInvitation = new Map<string, string>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = (data || []) as any[];
    const ids = rows.map((g: any) => g.id);
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
      checkInStatus: g.check_in_status || "not_checked_in",
      checkInTime: g.check_in_time || null,
    }));

    return NextResponse.json({ guests });
  } catch (e) {
    console.error("check-in search failed:", e);
    return NextResponse.json({ error: GENERIC }, { status: 500 });
  }
}
