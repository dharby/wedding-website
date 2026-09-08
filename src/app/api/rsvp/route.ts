import { NextRequest, NextResponse } from "next/server";
import { submitRSVP, isRSVPCategory, type RSVPCategory } from "@/lib/types";
import { getSupabaseServer } from "@/lib/supabase";

function generateToken(): string {
  return "tok_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { invitation_id, guest_name, guest_contact, attendance, guest_count, meal_preference, message, rsvp_category } = body;

    if (!guest_name || !attendance) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const category: RSVPCategory = isRSVPCategory(rsvp_category) ? rsvp_category : "couple";

    const result = await submitRSVP({
      invitation_id: invitation_id || null,
      guest_name: guest_name.trim(),
      guest_contact,
      attendance,
      rsvp_category: category,
      guest_count: Math.min(guest_count || 1, 1),
      meal_preference,
      message,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    const rsvpStatus = attendance === "yes" ? "accepted" : "declined";

    try {
      const supabase = getSupabaseServer();

      if (invitation_id && result.rsvp_id) {
        // Existing invitation: link the RSVP back so the guest stays
        // searchable and shows "Already RSVP'd" status.
        const { error: updateError } = await supabase
          .from("invitations")
          .update({
            rsvp_status: rsvpStatus,
            rsvp_category: category,
            rsvp_id: result.rsvp_id,
            updated_at: new Date().toISOString(),
          })
          .eq("id", invitation_id);
        if (updateError) {
          console.error("Invitation update error:", updateError);
        }
      } else if (!invitation_id && result.rsvp_id) {
        // New guest: automatically add them to the invitation table as
        // invited, so a later name search finds them.
        const { data: existing } = await supabase
          .from("invitations")
          .select("id")
          .ilike("guest_name", guest_name.trim())
          .eq("is_active", true)
          .limit(1)
          .maybeSingle();

        if (existing) {
          await supabase
            .from("rsvps")
            .update({ invitation_id: existing.id })
            .eq("id", result.rsvp_id);
          await supabase
            .from("invitations")
            .update({
              rsvp_status: rsvpStatus,
              rsvp_category: category,
              rsvp_id: result.rsvp_id,
              updated_at: new Date().toISOString(),
            })
            .eq("id", existing.id);
        } else {
          const { data: invitation, error: inviteError } = await supabase
            .from("invitations")
            .insert({
              invitation_token: generateToken(),
              guest_name: guest_name.trim(),
              guest_contact: guest_contact || null,
              allowed_guests: 1,
              rsvp_status: rsvpStatus,
              rsvp_category: category,
              rsvp_id: result.rsvp_id,
              is_active: true,
            })
            .select("id")
            .single();
          if (inviteError) {
            console.error("Auto-invitation insert error:", inviteError);
          } else if (invitation) {
            await supabase
              .from("rsvps")
              .update({ invitation_id: invitation.id })
              .eq("id", result.rsvp_id);
          }
        }
      }
    } catch (linkErr) {
      console.error("Invitation linking failed:", linkErr);
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
