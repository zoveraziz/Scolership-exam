import { NextResponse } from "next/server";
import { INITIAL_ADVISORS } from "@/lib/initialData";
import { AdvisorItem } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const scriptUrl =
    process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL || process.env.GOOGLE_SCRIPT_URL;

  // যদি গুগল স্ক্রিপ্ট URL কনফিগার করা থাকে, তবে গুগল শিট থেকে লাইভ ডেটা আনব
  if (scriptUrl && scriptUrl.startsWith("http")) {
    try {
      const response = await fetch(`${scriptUrl}?action=getCommittee`, {
        cache: "no-store",
        headers: { Accept: "application/json" },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && Array.isArray(result.data) && result.data.length > 0) {
          // ক্রমানুসারে সাজানো (Order 1, 2, 3...)
          const sortedList: AdvisorItem[] = result.data.sort(
            (a: AdvisorItem, b: AdvisorItem) => (a.order || 99) - (b.order || 99)
          );
          return NextResponse.json(
            {
              success: true,
              source: "google_sheet",
              data: sortedList,
            },
            {
              headers: {
                "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
                "Pragma": "no-cache",
                "Expires": "0",
              },
            }
          );
        }
      }
    } catch (err) {
      console.warn("Google Sheet committee fetch error, falling back to local data:", err);
    }
  }

  // শিট না থাকলে বা সমস্যা হলে লোকাল ইনিশিয়াল ডেটা রিটার্ন
  return NextResponse.json(
    {
      success: true,
      source: "local_default",
      data: INITIAL_ADVISORS,
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    }
  );
}
