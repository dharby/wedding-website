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
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const category = body?.category;
    const contact = typeof body?.contact === "string" ? body.contact.trim() : "";

    if (!name || !isCheckinCategory(category)) {
      return NextResponse.json({ error: "Invalid request. Name and valid category are required." }, { status: 400 });
    }

    if (name.length > 100) {
      return NextResponse.json({ error: "Name is too long (max 100 characters)." }, { status: 400 });
    }

    if (contact && contact.length > 50) {
      return NextResponse.json({ error: "Contact is too long (max 50 characters)." }, { status: 400 });
    }

    const supabase = getSupabaseServer();
    const nowIso = new Date().toISOString();
    const invitationToken = `manual-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

    const { data: inserted, error: insertErr } = await supabase
      .from("invitations")
      .insert({
        invitation_token: invitationToken,
        guest_name: name,
        guest_contact: contact || null,
        rsvp_category: category,
        rsvp_status: "accepted",
        check_in_status: "checked_in",
        check_in_time: nowIso,
        checked_in_by: "usher_manual",
        is_active: true,
        allowed_guests: 1,
      })
      .select("id, guest_name, guest_contact, rsvp_category, rsvp_status, check_in_status, check_in_time")
      .single();

    if (insertErr || !inserted) {
      console.error("manual check-in insert error:", insertErr);
      return NextResponse.json({ error: GENERIC }, { status: 500 });
    }

    return NextResponse.json({
      checkedIn: true,
      guest: {
        id: inserted.id,
        name: inserted.guest_name,
        contact: inserted.guest_contact,
        category: inserted.rsvp_category,
        rsvpStatus: inserted.rsvp_status,
        code: null,
        checkInStatus: inserted.check_in_status,
        checkInTime: inserted.check_in_time,
      },
    });
  } catch (e) {
    console.error("manual check-in failed:", e);
    return NextResponse.json({ error: GENERIC }, { status: 500 });
  }
}