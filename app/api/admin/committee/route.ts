import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import {
  getSheetData,
  appendSheetRow,
  updateSheetRange,
  deleteRow,
  getExactTabName,
} from "@/lib/google-sheets";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getAdminSession(req);
  if (!session) {
    return NextResponse.json({ success: false, message: "অননুমোদিত" }, { status: 401 });
  }

  try {
    const scriptUrl = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL || process.env.GOOGLE_SCRIPT_URL;
    const tabName = await getExactTabName("Committee");
    const rows = await getSheetData(tabName);

    if (!rows || rows.length <= 1) {
      if (scriptUrl && scriptUrl.startsWith("http")) {
        try {
          const res = await fetch(`${scriptUrl}?action=getCommittee`, { cache: "no-store" });
          const resData = await res.json();
          if (resData.success && resData.data && resData.data.length > 0) {
            return NextResponse.json({
              success: true,
              data: resData.data.map((c: any, idx: number) => ({
                rowIndex: idx + 2,
                order: String(c.order || idx + 1),
                name: c.name,
                role: c.role,
                designation: c.designation,
                photoUrl: c.photo,
              })),
            });
          }
        } catch (e) {}
      }
      return NextResponse.json({ success: true, data: [] });
    }

    const members = rows.slice(1).map((row, index) => ({
      rowIndex: index + 2, // 1-based, header is 1
      order: row[0] || String(index + 1),
      name: row[1] || "",
      role: row[2] || "",
      designation: row[3] || "",
      photoUrl: row[4] || "",
    })).filter((m) => m.name);

    return NextResponse.json({ success: true, data: members });
  } catch (error: any) {
    console.error("Error fetching committee members:", error);
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
    const { order, name, role, designation, photoUrl } = body;

    if (!name || !role) {
      return NextResponse.json(
        { success: false, message: "সদস্যের নাম ও পদবি আবশ্যক" },
        { status: 400 }
      );
    }

    const tabName = await getExactTabName("Committee");
    const existing = await getSheetData(tabName);
    const nextOrder = order || String((existing?.length || 1));

    const rowValues = [
      nextOrder,
      name || "",
      role || "",
      designation || "",
      photoUrl || "",
    ];

    const result = await appendSheetRow(tabName, rowValues);
    if (result) {
      return NextResponse.json({
        success: true,
        message: "পরিচালনা পরিষদের সদস্য সফলভাবে যুক্ত হয়েছে!",
      });
    }

    return NextResponse.json(
      { success: false, message: "গুগল শিটে যোগ করা সম্ভব হয়নি" },
      { status: 500 }
    );
  } catch (error: any) {
    console.error("Error adding committee member:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getAdminSession(req);
  if (!session) {
    return NextResponse.json({ success: false, message: "অননুমোদিত" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { rowIndex, order, name, role, designation, photoUrl } = body;

    if (!rowIndex || rowIndex < 2) {
      return NextResponse.json({ success: false, message: "অবৈধ সারি সূচক (Row Index)" }, { status: 400 });
    }

    const tabName = await getExactTabName("Committee");
    const range = `${tabName}!A${rowIndex}:E${rowIndex}`;
    const values = [[
      order || "",
      name || "",
      role || "",
      designation || "",
      photoUrl || "",
    ]];

    const updateRes = await updateSheetRange(range, values);
    if (updateRes) {
      return NextResponse.json({
        success: true,
        message: "সদস্যের তথ্য সফলভাবে আপডেট হয়েছে!",
      });
    }

    return NextResponse.json(
      { success: false, message: "আপডেট সম্পন্ন হয়নি" },
      { status: 500 }
    );
  } catch (error: any) {
    console.error("Error updating committee member:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getAdminSession(req);
  if (!session) {
    return NextResponse.json({ success: false, message: "অননুমোদিত" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const rowIndex = parseInt(searchParams.get("rowIndex") || "0", 10);

    if (!rowIndex || rowIndex < 2) {
      return NextResponse.json({ success: false, message: "অবৈধ সারি সূচক" }, { status: 400 });
    }

    const tabName = await getExactTabName("Committee");
    const result = await deleteRow(tabName, rowIndex);

    if (result && result.success) {
      return NextResponse.json({
        success: true,
        message: "সদস্য সফলভাবে মুছে ফেলা হয়েছে!",
      });
    }

    return NextResponse.json(
      { success: false, message: result?.error || "মুছে ফেলা সম্ভব হয়নি" },
      { status: 500 }
    );
  } catch (error: any) {
    console.error("Error deleting committee member:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
