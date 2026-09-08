// Wedding data types and models for Supabase integration

// The 3 RSVP lists: guests register under one of these so entrance
// ushers can check each list separately.
export type RSVPCategory = "grooms_parents" | "brides_parents" | "couple";

export const RSVP_CATEGORIES: { value: RSVPCategory; label: string; detail: string }[] = [
  { value: "grooms_parents", label: "Groom's Parents", detail: "Mr. Samson & Mrs. Olajoke Ekwubiri" },
  { value: "brides_parents", label: "Bride's Parents", detail: "Pst Olugbenga & Deaconess Ibiyinka Adeoye" },
  { value: "couple", label: "The Couple", detail: "Anuoluwapo & Tochukwu" },
];

export function isRSVPCategory(v: unknown): v is RSVPCategory {
  return v === "grooms_parents" || v === "brides_parents" || v === "couple";
}

export function rsvpCategoryLabel(v: string | null | undefined): string {
  return RSVP_CATEGORIES.find((c) => c.value === v)?.label ?? "The Couple";
}

export interface Invitation {
  id: string;
  invitation_token: string;
  guest_name: string;
  guest_contact: string;
  allowed_guests: number;
  rsvp_status: "pending" | "accepted" | "declined";
  rsvp_category: RSVPCategory;
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
  rsvp_category: RSVPCategory;
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
      rsvp_category: data.rsvp_category || "couple",
      guest_count: Math.min(data.guest_count || 1, 1),
      meal_preference: data.meal_preference,
      message: data.message,
    })
    .select("id, reference_number")
    .single();

  if (error) {
    console.error("RSVP insert error:", error);
    return { success: false, error: error.message };
  }

  return { success: true, rsvp_id: result.id, reference_number: result.reference_number };
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