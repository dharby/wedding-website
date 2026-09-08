import { NextRequest, NextResponse } from "next/server";
import { requireUsher } from "@/lib/checkin-auth";
import { getSupabaseServer } from "@/lib/supabase";

const GENERIC = "Something went wrong. Please try again.";

// Exact lookup by invitation token or RSVP reference number (for QR scans).
// Returns the guest WITH its category so the client can enforce the
// selected-category rule and show CATEGORY MISMATCH when needed.
export async function GET(req: NextRequest) {
  try {
    if (!(await requireUsher())) {
      return NextResponse.json({ error: "Session expired. Please log in again." }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const code = (searchParams.get("code") || "").trim().slice(0, 64);
    if (code.length < 2) {
      return NextResponse.json({ error: "Invalid code." }, { status: 400 });
    }

    const supabase = getSupabaseServer();

    // Try invitation token first.
    let invitation: Record<string, unknown> | null = null;
    const { data: byToken } = await supabase
      .from("invitations")
      .select("id, guest_name, guest_contact, rsvp_category, rsvp_status, invitation_token, check_in_status, check_in_time")
      .eq("invitation_token", code)
      .eq("is_active", true)
      .maybeSingle();
    if (byToken) invitation = byToken as Record<string, unknown>;

    let reference: string | null = null;
    if (!invitation) {
      // Try RSVP reference number.
      const { data: rsvp } = await supabase
        .from("rsvps")
        .select("invitation_id, reference_number")
        .eq("reference_number", code.toUpperCase())
        .maybeSingle();
      if (rsvp?.invitation_id) {
        reference = rsvp.reference_number;
        const { data: viaRef } = await supabase
          .from("invitations")
          .select("id, guest_name, guest_contact, rsvp_category, rsvp_status, invitation_token, check_in_status, check_in_time")
          .eq("id", rsvp.invitation_id)
          .eq("is_active", true)
          .maybeSingle();
        if (viaRef) invitation = viaRef as Record<string, unknown>;
      }
    }

    if (!invitation) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    if (!reference) {
      const { data: rsvp } = await supabase
        .from("rsvps")
        .select("reference_number")
        .eq("invitation_id", invitation.id as string)
        .limit(1)
        .maybeSingle();
      reference = rsvp?.reference_number || null;
    }

    return NextResponse.json({
      guest: {
        id: invitation.id,
        name: invitation.guest_name,
        contact: invitation.guest_contact,
        category: invitation.rsvp_category,
        rsvpStatus: invitation.rsvp_status,
        code: reference || (invitation.invitation_token as string),
        checkInStatus: invitation.check_in_status,
        checkInTime: invitation.check_in_time,
      },
    });
  } catch (e) {
    console.error("check-in lookup failed:", e);
    return NextResponse.json({ error: GENERIC }, { status: 500 });
  }
}
