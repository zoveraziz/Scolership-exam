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
    const tabName = await getExactTabName("Messages");
    const rows = await getSheetData(tabName);

    if (!rows || rows.length <= 1) {
      if (scriptUrl && scriptUrl.startsWith("http")) {
        try {
          const res = await fetch(`${scriptUrl}?action=getMessages`, { cache: "no-store" });
          const resData = await res.json();
          if (resData.success && resData.data && resData.data.length > 0) {
            return NextResponse.json({
              success: true,
              data: resData.data.map((m: any, idx: number) => ({
                rowIndex: idx + 2,
                sl: String(idx + 1),
                name: m.name,
                role: m.role,
                message: m.text,
                photoUrl: m.photo,
                status: "Active",
              })),
            });
          }
        } catch (e) {}
      }
      return NextResponse.json({ success: true, data: [] });
    }

    const messages = rows.slice(1).map((row, index) => ({
      rowIndex: index + 2, // 1-based, header is 1
      sl: row[0] || String(index + 1),
      name: row[1] || "",
      role: row[2] || "",
      message: row[3] || "",
      photoUrl: row[4] || "",
      status: row[5] || "Active",
    })).filter((m) => m.name || m.message);

    return NextResponse.json({ success: true, data: messages });
  } catch (error: any) {
    console.error("Error fetching messages:", error);
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
    const { sl, name, role, message, photoUrl, status } = body;

    if (!name || !message) {
      return NextResponse.json(
        { success: false, message: "গুণীজনের নাম ও বাণী/বার্তা আবশ্যক" },
        { status: 400 }
      );
    }

    const tabName = await getExactTabName("Messages");
    const existing = await getSheetData(tabName);
    const nextSl = sl || String((existing?.length || 1));

    const rowValues = [
      nextSl,
      name || "",
      role || "",
      message || "",
      photoUrl || "",
      status || "Active",
    ];

    const result = await appendSheetRow(tabName, rowValues);
    if (result) {
      return NextResponse.json({
        success: true,
        message: "গুণীজনের বাণী সফলভাবে যুক্ত হয়েছে!",
      });
    }

    return NextResponse.json(
      { success: false, message: "গুগল শিটে যোগ করা সম্ভব হয়নি" },
      { status: 500 }
    );
  } catch (error: any) {
    console.error("Error adding message:", error);
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
    const { rowIndex, sl, name, role, message, photoUrl, status } = body;

    if (!rowIndex || rowIndex < 2) {
      return NextResponse.json({ success: false, message: "অবৈধ সারি সূচক (Row Index)" }, { status: 400 });
    }

    const tabName = await getExactTabName("Messages");
    const range = `${tabName}!A${rowIndex}:F${rowIndex}`;
    const values = [[
      sl || "",
      name || "",
      role || "",
      message || "",
      photoUrl || "",
      status || "Active",
    ]];

    const updateRes = await updateSheetRange(range, values);
    if (updateRes) {
      return NextResponse.json({
        success: true,
        message: "গুণীজনের বাণী সফলভাবে আপডেট হয়েছে!",
      });
    }

    return NextResponse.json(
      { success: false, message: "আপডেট সম্পন্ন হয়নি" },
      { status: 500 }
    );
  } catch (error: any) {
    console.error("Error updating message:", error);
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

    const tabName = await getExactTabName("Messages");
    const result = await deleteRow(tabName, rowIndex);

    if (result && result.success) {
      return NextResponse.json({
        success: true,
        message: "গুণীজনের বাণী সফলভাবে মুছে ফেলা হয়েছে!",
      });
    }

    return NextResponse.json(
      { success: false, message: result?.error || "মুছে ফেলা সম্ভব হয়নি" },
      { status: 500 }
    );
  } catch (error: any) {
    console.error("Error deleting message:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
