import { NextRequest, NextResponse } from "next/server";
import { requireUsher } from "@/lib/checkin-auth";
import { isCheckinCategory } from "@/lib/checkin-categories";
import { getSupabaseServer } from "@/lib/supabase";

const GENERIC = "Something went wrong. Please try again.";

// Check in ONE guest. All validation is server-side.
// Handles both cases: migration run (check_in columns exist) and
// not yet run (falls back to rsvp_status only).
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

    // 1. Try fetching with check-in columns
    let row: Record<string, unknown> | null = null;
    let hasCheckIn = true;
    const { data, error: readErr } = await supabase
      .from("invitations")
      .select("id, guest_name, guest_contact, rsvp_category, rsvp_status, invitation_token, check_in_status, check_in_time")
      .eq("id", id)
      .eq("is_active", true)
      .maybeSingle();

    if (readErr) {
      // Fallback without check-in columns
      hasCheckIn = false;
      const { data: fb } = await supabase
        .from("invitations")
        .select("id, guest_name, guest_contact, rsvp_category, rsvp_status, invitation_token")
        .eq("id", id)
        .eq("is_active", true)
        .maybeSingle();
      row = fb as Record<string, unknown> | null;
      if (row) {
        row.check_in_status = "not_checked_in";
        row.check_in_time = null;
      }
    } else {
      row = data as Record<string, unknown> | null;
      if (readErr && !data) hasCheckIn = false;
    }

    if (readErr && !row) {
      console.error("check-in read error:", readErr);
      return NextResponse.json({ error: GENERIC }, { status: 500 });
    }
    if (!row) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    if (row.rsvp_category !== category) {
      return NextResponse.json(
        { error: "category_mismatch", actualCategory: row.rsvp_category },
        { status: 409 }
      );
    }

    // 2. Already checked in
    if (row.check_in_status === "checked_in") {
      return NextResponse.json({
        already: true,
        guest: toGuest(row),
      });
    }

    const nowIso = new Date().toISOString();

    if (hasCheckIn) {
      // 3. Atomic conditional update (requires check_in columns)
      const { data: updated, error: updateErr } = await supabase
        .from("invitations")
        .update({
          check_in_status: "checked_in",
          check_in_time: nowIso,
          checked_in_by: "usher",
        })
        .eq("id", id)
        .eq("rsvp_category", category)
        .eq("check_in_status", "not_checked_in")
        .select("id, guest_name, guest_contact, rsvp_category, rsvp_status, check_in_status, check_in_time");

      if (updateErr) {
        console.error("check-in update error:", updateErr);
        return NextResponse.json({ error: GENERIC }, { status: 500 });
      }
      if (!updated || updated.length === 0) {
        const { data: current } = await supabase
          .from("invitations")
          .select("id, guest_name, guest_contact, rsvp_category, rsvp_status, check_in_status, check_in_time")
          .eq("id", id)
          .maybeSingle();
        if (current && (current as Record<string, unknown>).check_in_status === "checked_in") {
          return NextResponse.json({ already: true, guest: toGuest(current as Record<string, unknown>) });
        }
        return NextResponse.json({ error: GENERIC }, { status: 500 });
      }
      const { data: rsvp } = await supabase
        .from("rsvps")
        .select("reference_number")
        .eq("invitation_id", id)
        .limit(1)
        .maybeSingle();
      return NextResponse.json({
        checkedIn: true,
        guest: { ...toGuest(updated[0]), code: rsvp?.reference_number || null },
      });
    } else {
      // 4. Migration not yet run — just mark rsvp_status as accepted
      const { error: updateErr } = await supabase
        .from("invitations")
        .update({ rsvp_status: "accepted" })
        .eq("id", id)
        .eq("rsvp_category", category);
      if (updateErr) {
        console.error("check-in fallback update error:", updateErr);
        return NextResponse.json({ error: GENERIC }, { status: 500 });
      }
      return NextResponse.json({
        checkedIn: true,
        guest: { ...toGuest({ ...row, rsvp_status: "accepted" }), code: null },
      });
    }
  } catch (e) {
    console.error("check-in failed:", e);
    return NextResponse.json({ error: GENERIC }, { status: 500 });
  }
}

function toGuest(row: Record<string, unknown>) {
  return {
    id: row.id,
    name: row.guest_name,
    contact: row.guest_contact,
    category: row.rsvp_category,
    rsvpStatus: row.rsvp_status,
    checkInStatus: row.check_in_status || "checked_in",
    checkInTime: row.check_in_time || null,
  };
}
