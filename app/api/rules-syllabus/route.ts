import { NextResponse } from "next/server";
import { INITIAL_SYLLABUS, DEFAULT_RULES } from "@/lib/initialData";
import { SyllabusItem } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const scriptUrl =
    process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL || process.env.GOOGLE_SCRIPT_URL;

  // যদি গুগল স্ক্রিপ্ট URL কনফিগার করা থাকে, তবে গুগল শিট থেকে লাইভ ডেটা আনব
  if (scriptUrl && scriptUrl.startsWith("http")) {
    try {
      const response = await fetch(`${scriptUrl}?action=getRulesAndSyllabus`, {
        cache: "no-store",
        headers: { Accept: "application/json" },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const rules: string[] =
            Array.isArray(result.rules) && result.rules.length > 0
              ? result.rules
              : DEFAULT_RULES;

          const syllabus: SyllabusItem[] =
            Array.isArray(result.syllabus) && result.syllabus.length > 0
              ? result.syllabus
              : INITIAL_SYLLABUS;

          return NextResponse.json(
            {
              success: true,
              source: "google_sheet",
              rules,
              syllabus,
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
      console.warn("Google Sheet rules/syllabus fetch error, falling back to local data:", err);
    }
  }

  // শিট না থাকলে বা সমস্যা হলে লোকাল ইনিশিয়াল ডেটা রিটার্ন
  return NextResponse.json(
    {
      success: true,
      source: "local_default",
      rules: DEFAULT_RULES,
      syllabus: INITIAL_SYLLABUS,
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
