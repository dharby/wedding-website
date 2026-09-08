import { NextRequest, NextResponse } from "next/server";
import { requireUsher } from "@/lib/checkin-auth";
import { isCheckinCategory } from "@/lib/checkin-categories";
import { getSupabaseServer } from "@/lib/supabase";

const GENERIC = "Something went wrong. Please try again.";

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
    const cols = "id, guest_name, guest_contact, rsvp_category, rsvp_status, invitation_token, check_in_status, check_in_time";
    const byId = new Map<string, Record<string, unknown>>();
    const refByInvitation = new Map<string, string>();

    // 1. Search by name
    const r1 = await supabase
      .from("invitations")
      .select(cols)
      .eq("rsvp_category", category)
      .eq("is_active", true)
      .filter("guest_name", "ilike", like)
      .order("guest_name")
      .limit(20);
    if (r1.error) {
      console.error("search by name:", r1.error);
      return NextResponse.json({ error: GENERIC }, { status: 500 });
    }
    for (const g of r1.data || []) byId.set(g.id, { ...g });

    // 2. Search by phone
    if (byId.size < 20) {
      const r2 = await supabase
        .from("invitations")
        .select(cols)
        .eq("rsvp_category", category)
        .eq("is_active", true)
        .filter("guest_contact", "ilike", like)
        .limit(20);
      if (r2.data) for (const g of r2.data) if (!byId.has(g.id)) byId.set(g.id, { ...g });
    }

    // 3. Search by invitation token
    if (byId.size < 20) {
      const r3 = await supabase
        .from("invitations")
        .select(cols)
        .eq("rsvp_category", category)
        .eq("is_active", true)
        .filter("invitation_token", "ilike", like)
        .limit(20);
      if (r3.data) for (const g of r3.data) if (!byId.has(g.id)) byId.set(g.id, { ...g });
    }

    // 4. Search by RSVP reference number
    const r4 = await supabase
      .from("rsvps")
      .select("invitation_id, reference_number")
      .filter("reference_number", "ilike", like)
      .limit(10);
    const refIds = [...new Set((r4.data || []).map((r) => r.invitation_id).filter(Boolean))] as string[];
    for (const r of r4.data || []) {
      if (r.invitation_id && r.reference_number) refByInvitation.set(r.invitation_id, r.reference_number);
    }
    const missing = refIds.filter((id) => !byId.has(id));
    if (missing.length > 0) {
      const r5 = await supabase
        .from("invitations")
        .select(cols)
        .in("id", missing)
        .eq("rsvp_category", category)
        .eq("is_active", true);
      if (r5.data) for (const g of r5.data) if (!byId.has(g.id)) byId.set(g.id, { ...g });
    }

    // 5. Attach reference numbers for display
    const ids = [...byId.keys()];
    if (ids.length > 0) {
      const r6 = await supabase
        .from("rsvps")
        .select("invitation_id, reference_number")
        .in("invitation_id", ids);
      for (const c of r6.data || []) {
        if (c.invitation_id && c.reference_number && !refByInvitation.has(c.invitation_id)) {
          refByInvitation.set(c.invitation_id, c.reference_number);
        }
      }
    }

    const guests = [...byId.values()]
      .map((g) => ({
        id: g.id,
        name: g.guest_name,
        contact: g.guest_contact,
        category: g.rsvp_category,
        rsvpStatus: g.rsvp_status,
        code: refByInvitation.get(g.id as string) || (g.invitation_token as string) || null,
        checkInStatus: g.check_in_status || "not_checked_in",
        checkInTime: g.check_in_time || null,
      }))
      .sort((a, b) => String(a.name).localeCompare(String(b.name)));

    return NextResponse.json({ guests });
  } catch (e) {
    console.error("check-in search failed:", e);
    return NextResponse.json({ error: GENERIC }, { status: 500 });
  }
}
