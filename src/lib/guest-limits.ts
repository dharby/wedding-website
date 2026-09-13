export type RSVPCategory = "grooms_parents" | "brides_parents" | "couple";

export const GUEST_LIMITS: Record<RSVPCategory, number> = {
  brides_parents: 120,
  grooms_parents: 120,
  couple: 60,
};

export function getGuestLimit(category: RSVPCategory): number {
  return GUEST_LIMITS[category] ?? GUEST_LIMITS.couple;
}

export async function checkCategoryCapacity(
  category: RSVPCategory,
  supabase: ReturnType<typeof import("@/lib/supabase").getSupabaseServer>
): Promise<{ canAdd: boolean; currentCount: number; maxLimit: number; remaining: number }> {
  const limit = getGuestLimit(category);
  
  const { count, error } = await supabase
    .from("invitations")
    .select("*", { count: "exact", head: true })
    .eq("rsvp_category", category)
    .eq("is_active", true);

  if (error) {
    console.error("Capacity check error:", error);
    return { canAdd: true, currentCount: 0, maxLimit: limit, remaining: limit };
  }

  const currentCount = count || 0;
  const remaining = Math.max(0, limit - currentCount);

  return {
    canAdd: currentCount < limit,
    currentCount,
    maxLimit: limit,
    remaining,
  };
}