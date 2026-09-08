import { NextResponse } from "next/server";
import { requireUsher } from "@/lib/checkin-auth";
import { CHECKIN_CATEGORIES } from "@/lib/checkin-categories";
import { getSupabaseServer } from "@/lib/supabase";

const GENERIC = "Something went wrong. Please try again.";

// Live per-category counts straight from Supabase (never hardcoded).
export async function GET() {
  try {
    if (!(await requireUsher())) {
      return NextResponse.json({ error: "Session expired. Please log in again." }, { status: 401 });
    }
    const supabase = getSupabaseServer();

    const results = await Promise.all(
      CHECKIN_CATEGORIES.map(async (c) => {
        const [{ count: registered }, { count: checkedIn }] = await Promise.all([
          supabase
            .from("invitations")
            .select("id", { count: "exact", head: true })
            .eq("rsvp_category", c.value)
            .eq("is_active", true),
          supabase
            .from("invitations")
            .select("id", { count: "exact", head: true })
            .eq("rsvp_category", c.value)
            .eq("is_active", true)
            .eq("check_in_status", "checked_in"),
        ]);
        return { category: c.value, registered: registered || 0, checkedIn: checkedIn || 0 };
      })
    );

    const totalCheckedIn = results.reduce((s, r) => s + r.checkedIn, 0);
    const totalRegistered = results.reduce((s, r) => s + r.registered, 0);

    return NextResponse.json({ categories: results, totalCheckedIn, totalRegistered });
  } catch (e) {
    console.error("check-in counts failed:", e);
    return NextResponse.json({ error: GENERIC }, { status: 500 });
  }
}
