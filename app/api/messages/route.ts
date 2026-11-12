import { NextResponse } from "next/server";
import { INITIAL_MESSAGES } from "@/lib/initialData";
import { DignitaryMessage } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const scriptUrl =
    process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL || process.env.GOOGLE_SCRIPT_URL;

  // যদি গুগল স্ক্রিপ্ট URL থাকে, গুগল শিট থেকে লাইভ বাণীগুলো আনব
  if (scriptUrl && scriptUrl.startsWith("http")) {
    try {
      const response = await fetch(`${scriptUrl}?action=getMessages`, {
        cache: "no-store",
        headers: { Accept: "application/json" },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && Array.isArray(result.data) && result.data.length > 0) {
          return NextResponse.json(
            {
              success: true,
              source: "google_sheet",
              data: result.data,
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
      console.warn("Google Sheet messages fetch error, falling back to local:", err);
    }
  }

  // শিট না থাকলে বা সমস্যা হলে লোকাল ইনিশিয়াল ডেটা রিটার্ন
  return NextResponse.json(
    {
      success: true,
      source: "local_default",
      data: INITIAL_MESSAGES,
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
