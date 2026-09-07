// Wedding data types and models for Supabase integration

export interface Invitation {
  id: string;
  invitation_token: string;
  guest_name: string;
  guest_contact: string;
  allowed_guests: number; // Always 1 for this wedding
  rsvp_status: "pending" | "accepted" | "declined";
  rsvp_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RSVPRecord {
  id: string;
  reference_number: string; // AT-2026-XXXX
  invitation_id: string | null;
  guest_name: string;
  guest_contact: string;
  attendance: "yes" | "no";
  guest_count: number; // Always 1
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

// Mock data for development
export const mockInvitations: Invitation[] = [
  {
    id: "inv-001",
    invitation_token: "tok_abc123def456",
    guest_name: "Adaeze Okonkwo",
    guest_contact: "adaeze@email.com",
    allowed_guests: 1,
    rsvp_status: "pending",
    rsvp_id: null,
    is_active: true,
    created_at: "2026-01-15T10:00:00Z",
    updated_at: "2026-01-15T10:00:00Z",
  },
];

export const mockRSVPs: RSVPRecord[] = [];

export const mockGifts: GiftConfirmation[] = [];

// Simulated API functions (replace with Supabase calls)
export async function submitRSVP(data: Omit<RSVPRecord, "id" | "reference_number" | "created_at">) {
  // In production: await supabase.from('rsvps').insert(data)
  const refNum = `AT-2026-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  console.log("RSVP submitted:", { ...data, reference_number: refNum });
  return { success: true, reference_number: refNum };
}

export async function submitGiftConfirmation(data: Omit<GiftConfirmation, "id" | "confirmed_at">) {
  // In production: await supabase.from('gift_confirmations').insert(data)
  console.log("Gift confirmation:", data);
  return { success: true };
}

export async function validateInvitationToken(token: string) {
  // In production: await supabase.from('invitations').select('*').eq('invitation_token', token).eq('is_active', true).single()
  const invitation = mockInvitations.find((inv) => inv.invitation_token === token && inv.is_active);
  return invitation || null;
}
