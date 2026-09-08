// Shared check-in category definitions (client-safe: no secrets here).
// Maps the EXISTING rsvp_category DB values to usher-facing labels.

export type CheckinCategory = "grooms_parents" | "brides_parents" | "couple";

export const CHECKIN_CATEGORIES: { value: CheckinCategory; label: string; short: string }[] = [
  { value: "brides_parents", label: "Guests of the Bride's Parents", short: "Bride's Parents" },
  { value: "grooms_parents", label: "Guests of the Groom's Parents", short: "Groom's Parents" },
  { value: "couple", label: "Guests of the Couple", short: "The Couple" },
];

export function isCheckinCategory(v: unknown): v is CheckinCategory {
  return v === "grooms_parents" || v === "brides_parents" || v === "couple";
}

export function checkinCategoryLabel(v: string | null | undefined): string {
  return CHECKIN_CATEGORIES.find((c) => c.value === v)?.label ?? "Unknown list";
}
