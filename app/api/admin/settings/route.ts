import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { getSheetData, bulkUpdateSettings } from "@/lib/google-sheets";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getAdminSession(req);
  if (!session) {
    return NextResponse.json({ success: false, message: "অননুমোদিত" }, { status: 401 });
  }

  try {
    const rows = await getSheetData("Settings");
    const settings: Record<string, string> = {};

    if (rows) {
      rows.forEach((row) => {
        if (row && row[0]) {
          settings[String(row[0]).trim()] = row[1] !== undefined ? String(row[1]).trim() : "";
        }
      });
    }

    return NextResponse.json({ success: true, data: settings });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession(req);
  if (!session) {
    return NextResponse.json({ success: false, message: "অননুমোদিত" }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ success: false, message: "অবৈধ তথ্য" }, { status: 400 });
    }

    const result = await bulkUpdateSettings(body);
    if (result.success) {
      return NextResponse.json({ success: true, message: "সেটিংস সফলভাবে সংরক্ষিত হয়েছে!" });
    } else {
      return NextResponse.json({ success: false, message: result.error || "সংরক্ষণ ব্যর্থ হয়েছে" }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
