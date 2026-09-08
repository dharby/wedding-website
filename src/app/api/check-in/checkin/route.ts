import { NextRequest, NextResponse } from "next/server";
import { requireUsher } from "@/lib/checkin-auth";
import { isCheckinCategory } from "@/lib/checkin-categories";
import { getSupabaseServer } from "@/lib/supabase";

const GENERIC = "Something went wrong. Please try again.";

export async function POST(req: NextRequest) {
  try {
    if (!(await requireUsher())) {
      return NextResponse.json({ error: "Session expired. Please log in again." }, { status: 401 });
    }
    const body = await req.json().catch(() => null);
    const id = typeof body?.id === "string" ? body.id.trim() : "";
    const category = body?.category;

    if (!id || !isCheckinCategory(category)) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    const supabase = getSupabaseServer();
    const nowIso = new Date().toISOString();

    // Fetch the guest with full columns
    const { data: row, error: readErr } = await supabase
      .from("invitations")
      .select("id, guest_name, guest_contact, rsvp_category, rsvp_status, invitation_token, check_in_status, check_in_time")
      .eq("id", id)
      .eq("is_active", true)
      .maybeSingle();

    if (readErr) {
      // Fallback: try without check-in columns
      const { data: fb, error: fbErr } = await supabase
        .from("invitations")
        .select("id, guest_name, guest_contact, rsvp_category, rsvp_status, invitation_token")
        .eq("id", id)
        .eq("is_active", true)
        .maybeSingle();
      if (fbErr) {
        console.error("check-in fallback error:", fbErr);
        return NextResponse.json({ error: GENERIC }, { status: 500 });
      }
      if (!fb) {
        console.error("guest not found in fallback:", id);
        return NextResponse.json({ error: "not_found" }, { status: 404 });
      }
      if (fb.rsvp_category !== category) {
        return NextResponse.json(
          { error: "category_mismatch", actualCategory: fb.rsvp_category },
          { status: 409 }
        );
      }
      // No check-in columns → use rsvp_status as proxy
      if (fb.rsvp_status === "accepted") {
        return NextResponse.json({
          already: true,
          guest: { ...fb, category: fb.rsvp_category, checkInStatus: "checked_in", checkInTime: null, code: null },
        });
      }
      const { error: updErr } = await supabase
        .from("invitations")
        .update({ rsvp_status: "accepted" })
        .eq("id", id)
        .eq("rsvp_category", category);
      if (updErr) {
        console.error("fallback update error:", updErr);
        return NextResponse.json({ error: GENERIC }, { status: 500 });
      }
      return NextResponse.json({
        checkedIn: true,
        guest: { ...fb, category: fb.rsvp_category, rsvpStatus: "accepted", checkInStatus: "checked_in", checkInTime: nowIso, code: null },
      });
    }

    if (!row) {
      console.error("guest not found:", id);
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    if (row.rsvp_category !== category) {
      return NextResponse.json(
        { error: "category_mismatch", actualCategory: row.rsvp_category },
        { status: 409 }
      );
    }

    if (row.check_in_status === "checked_in") {
      return NextResponse.json({
        already: true,
        guest: { ...row, category: row.rsvp_category, checkInStatus: "checked_in", code: null },
      });
    }

    const { data: updated, error: updateErr } = await supabase
      .from("invitations")
      .update({ check_in_status: "checked_in", check_in_time: nowIso, checked_in_by: "usher" })
      .eq("id", id)
      .eq("rsvp_category", category)
      .eq("check_in_status", "not_checked_in")
      .select("id, guest_name, guest_contact, rsvp_category, rsvp_status, check_in_status, check_in_time");

    if (updateErr || !updated || updated.length === 0) {
      const { data: current } = await supabase
        .from("invitations")
        .select("id, guest_name, guest_contact, rsvp_category, rsvp_status, check_in_status, check_in_time")
        .eq("id", id)
        .maybeSingle();
      if (current && (current as any).check_in_status === "checked_in") {
        return NextResponse.json({ already: true, guest: { ...(current as any), category: (current as any).rsvp_category, checkInStatus: "checked_in", code: null } });
      }
      console.error("check-in update error:", updateErr);
      return NextResponse.json({ error: GENERIC }, { status: 500 });
    }

    return NextResponse.json({
      checkedIn: true,
      guest: { ...updated[0], category: updated[0].rsvp_category, checkInStatus: "checked_in", checkInTime: nowIso, code: null },
    });
  } catch (e) {
    console.error("check-in failed:", e);
    return NextResponse.json({ error: GENERIC }, { status: 500 });
  }
}
