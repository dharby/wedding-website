import { NextRequest, NextResponse } from "next/server";
import { requireUsher } from "@/lib/checkin-auth";
import { isCheckinCategory } from "@/lib/checkin-categories";
import { getSupabaseServer } from "@/lib/supabase";

const GENERIC = "Something went wrong. Please try again.";

// Check in ONE guest. All validation is server-side:
// session, existence, category match, and not-already-checked-in.
// The final UPDATE is conditional (atomic) so two ushers racing on the
// same guest cannot create a duplicate — the loser gets ALREADY CHECKED IN
// with the original timestamp preserved.
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

    // 1–3. Verify the guest exists, is active, and is in this category.
    const { data: row, error: readErr } = await supabase
      .from("invitations")
      .select("id, guest_name, guest_contact, rsvp_category, rsvp_status, check_in_status, check_in_time")
      .eq("id", id)
      .eq("is_active", true)
      .maybeSingle();
    if (readErr) {
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

    // 4. Already checked in → return it, never overwrite the timestamp.
    if (row.check_in_status === "checked_in") {
      return NextResponse.json({
        already: true,
        guest: toGuest(row),
      });
    }

    // 5–6. Atomic conditional update; timestamp generated here (server-side).
    const nowIso = new Date().toISOString();
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

    // 7. No row updated → another usher won the race. Return the winner's record.
    if (!updated || updated.length === 0) {
      const { data: current } = await supabase
        .from("invitations")
        .select("id, guest_name, guest_contact, rsvp_category, rsvp_status, check_in_status, check_in_time")
        .eq("id", id)
        .maybeSingle();
      if (current && current.check_in_status === "checked_in") {
        return NextResponse.json({ already: true, guest: toGuest(current) });
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
    checkInStatus: row.check_in_status,
    checkInTime: row.check_in_time,
  };
}
