import { NextRequest, NextResponse } from "next/server";
import { submitRSVP } from "@/lib/types";
import { getSupabaseServer } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { invitation_id, guest_name, guest_contact, attendance, guest_count, meal_preference, message } = body;

    if (!guest_name || !attendance) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const result = await submitRSVP({
      invitation_id: invitation_id || null,
      guest_name,
      guest_contact,
      attendance,
      guest_count: Math.min(guest_count || 1, 1),
      meal_preference,
      message,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    // Link the RSVP back to the invitation so the guest stays
    // searchable and shows "Already RSVP'd" status.
    if (invitation_id && result.rsvp_id) {
      try {
        const supabase = getSupabaseServer();
        const { error: updateError } = await supabase
          .from("invitations")
          .update({
            rsvp_status: attendance === "yes" ? "accepted" : "declined",
            rsvp_id: result.rsvp_id,
            updated_at: new Date().toISOString(),
          })
          .eq("id", invitation_id);
        if (updateError) {
          console.error("Invitation update error:", updateError);
        }
      } catch (updateErr) {
        console.error("Invitation update failed:", updateErr);
      }
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
