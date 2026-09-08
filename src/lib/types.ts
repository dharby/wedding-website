// Wedding data types and models for Supabase integration

export interface Invitation {
  id: string;
  invitation_token: string;
  guest_name: string;
  guest_contact: string;
  allowed_guests: number;
  rsvp_status: "pending" | "accepted" | "declined";
  rsvp_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RSVPRecord {
  id: string;
  reference_number: string;
  invitation_id: string | null;
  guest_name: string;
  guest_contact: string;
  attendance: "yes" | "no";
  guest_count: number;
  meal_preference: string | null;
  message: string | null;
  created_at: string;
}

export interface GiftConfirmation {
  id: string;
  invitation_id: string | null;
  sender_name: string;
  sender_contact: string | null;
  confirmed_at: string;
}

export async function submitRSVP(data: Omit<RSVPRecord, "id" | "reference_number" | "created_at">) {
  const { getSupabaseServer } = await import("@/lib/supabase");
  const supabase = getSupabaseServer();

  const { data: result, error } = await supabase
    .from("rsvps")
    .insert({
      invitation_id: data.invitation_id,
      guest_name: data.guest_name,
      guest_contact: data.guest_contact,
      attendance: data.attendance,
      guest_count: Math.min(data.guest_count || 1, 1),
      meal_preference: data.meal_preference,
      message: data.message,
    })
    .select("reference_number")
    .single();

  if (error) {
    console.error("RSVP insert error:", error);
    return { success: false, error: error.message };
  }

  return { success: true, reference_number: result.reference_number };
}

export async function submitGiftConfirmation(data: Omit<GiftConfirmation, "id" | "confirmed_at">) {
  const { getSupabaseServer } = await import("@/lib/supabase");
  const supabase = getSupabaseServer();

  const { error } = await supabase.from("gift_confirmations").insert({
    invitation_id: data.invitation_id,
    sender_name: data.sender_name,
    sender_contact: data.sender_contact,
  });

  if (error) {
    console.error("Gift insert error:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function validateInvitationToken(token: string) {
  const { getSupabaseServer } = await import("@/lib/supabase");
  const supabase = getSupabaseServer();

  const { data: invitation, error } = await supabase
    .from("invitations")
    .select("*")
    .eq("invitation_token", token)
    .eq("is_active", true)
    .single();

  if (error || !invitation) {
    return null;
  }

  return invitation as Invitation;
}