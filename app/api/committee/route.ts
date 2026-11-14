import { NextResponse } from "next/server";
import { INITIAL_ADVISORS } from "@/lib/initialData";
import { AdvisorItem } from "@/lib/types";
import { getSheetData, getExactTabName } from "@/lib/google-sheets";

export const dynamic = "force-dynamic";

export async function GET() {
  // 1. Direct fetch from Google Sheet via Service Account
  try {
    const tabName = await getExactTabName("Committee");
    const rows = await getSheetData(tabName);

    if (rows && rows.length > 1) {
      const members: AdvisorItem[] = rows
        .slice(1)
        .map((row, index) => ({
          id: String(row[0] || index + 1),
          order: parseInt(String(row[0] || index + 1), 10) || index + 1,
          name: String(row[1] || "").trim(),
          role: String(row[2] || "").trim(),
          designation: row[3] ? String(row[3]).trim() : undefined,
          photo: row[4] ? String(row[4]).trim() : undefined,
        }))
        .filter((m) => m.name && m.role);

      if (members.length > 0) {
        members.sort((a, b) => (a.order || 99) - (b.order || 99));
        return NextResponse.json(
          {
            success: true,
            source: "google_sheet_direct",
            data: members,
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
  } catch (sheetErr) {
    console.warn("Direct Google Sheet committee fetch failed, checking Apps Script:", sheetErr);
  }

  // 2. Fallback to Google Apps Script URL if configured
  const scriptUrl = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL || process.env.GOOGLE_SCRIPT_URL;
  if (scriptUrl && scriptUrl.startsWith("http")) {
    try {
      const response = await fetch(`${scriptUrl}?action=getCommittee`, {
        cache: "no-store",
        headers: { Accept: "application/json" },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && Array.isArray(result.data) && result.data.length > 0) {
          const sortedList: AdvisorItem[] = result.data.sort(
            (a: AdvisorItem, b: AdvisorItem) => (a.order || 99) - (b.order || 99)
          );
          return NextResponse.json(
            {
              success: true,
              source: "google_sheet_apps_script",
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
      console.warn("Google Apps Script committee fetch error, falling back to local data:", err);
    }
  }

  // 3. Fallback to local default data
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
