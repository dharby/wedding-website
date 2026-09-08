import { NextResponse } from "next/server";
import { requireUsher } from "@/lib/checkin-auth";
import { CHECKIN_CATEGORIES } from "@/lib/checkin-categories";
import { getSupabaseServer } from "@/lib/supabase";

const GENERIC = "Something went wrong. Please try again.";

export async function GET() {
  try {
    if (!(await requireUsher())) {
      return NextResponse.json({ error: "Session expired. Please log in again." }, { status: 401 });
    }
    const supabase = getSupabaseServer();
    const results = await Promise.all(
      CHECKIN_CATEGORIES.map(async (c) => {
        // Count total registered guests in this category
        const { count: registered } = await supabase
          .from("invitations")
          .select("id", { count: "exact", head: true })
          .eq("rsvp_category", c.value)
          .eq("is_active", true);

        // Count checked-in guests (will be 0 if check_in columns don't exist yet)
        let checkedIn = 0;
        try {
          const { count } = await supabase
            .from("invitations")
            .select("id", { count: "exact", head: true })
            .eq("rsvp_category", c.value)
            .eq("is_active", true)
            .eq("check_in_status", "checked_in");
          checkedIn = count || 0;
        } catch {
          // check_in columns don't exist yet — that's fine
        }

        return { category: c.value, registered: registered || 0, checkedIn };
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
