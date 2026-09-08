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
    const id = (searchParams.get("id") || "").trim();
    const category = searchParams.get("category") || "";

    if (!id || !category) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    const supabase = getSupabaseServer();

    // Try with check-in columns first; fall back if they don't exist.
    let invitation: Record<string, unknown> | null = null;
    const { data, error } = await supabase
      .from("invitations")
      .select("id, guest_name, guest_contact, rsvp_category, rsvp_status, invitation_token, check_in_status, check_in_time")
      .eq("id", id)
      .eq("is_active", true)
      .maybeSingle();

    if (error) {
      // Fallback: query without check-in columns
      const { data: fb } = await supabase
        .from("invitations")
        .select("id, guest_name, guest_contact, rsvp_category, rsvp_status, invitation_token")
        .eq("id", id)
        .eq("is_active", true)
        .maybeSingle();
      if (fb) {
        invitation = { ...fb, check_in_status: "not_checked_in", check_in_time: null };
      }
    } else {
      invitation = data as Record<string, unknown>;
    }

    if (!invitation) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    if (invitation.rsvp_category !== category) {
      return NextResponse.json(
        { error: "category_mismatch", actualCategory: invitation.rsvp_category },
        { status: 409 }
      );
    }

    const { data: rsvp } = await supabase
      .from("rsvps")
      .select("reference_number, attendance")
      .eq("invitation_id", id)
      .limit(1)
      .maybeSingle();

    return NextResponse.json({
      guest: {
        id: invitation.id,
        name: invitation.guest_name,
        contact: invitation.guest_contact,
        category: invitation.rsvp_category,
        rsvpStatus: invitation.rsvp_status,
        attendance: rsvp?.attendance || null,
        code: rsvp?.reference_number || invitation.invitation_token,
        checkInStatus: invitation.check_in_status || "not_checked_in",
        checkInTime: invitation.check_in_time || null,
      },
    });
  } catch (e) {
    console.error("check-in guest failed:", e);
    return NextResponse.json({ error: GENERIC }, { status: 500 });
  }
}
