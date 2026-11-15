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
    const tabName = await getExactTabName("controlers");
    const rows = await getSheetData(tabName);

    if (!rows || rows.length <= 1) {
      if (scriptUrl && scriptUrl.startsWith("http")) {
        try {
          const res = await fetch(`${scriptUrl}?action=getControllers&roll=10001`, { cache: "no-store" });
          const resData = await res.json();
          if (resData.success && resData.data) {
            return NextResponse.json({
              success: true,
              data: [
                {
                  rowIndex: 2,
                  startRoll: "10001",
                  endRoll: "50000",
                  name: resData.data.name || "মো. আব্দুল্লাহ আল মামুন",
                  signatureUrl: resData.data.signature || "",
                  phone: resData.data.phone || "০১৭১২৩৪৫৬৭৮",
                },
              ],
            });
          }
        } catch (e) {}
      }
      return NextResponse.json({
        success: true,
        data: [
          {
            rowIndex: 2,
            startRoll: "10001",
            endRoll: "50000",
            name: "মো. আব্দুল্লাহ আল মামুন",
            signatureUrl: "https://drive.google.com/file/d/1B6p-nL6kUq29R1f-UaRz_XnZ0K9b0g8Y/view?usp=sharing",
            phone: "০১৭১২৩৪৫৬৭৮",
          },
        ],
      });
    }

    const controllers = rows.slice(1).map((row, index) => ({
      rowIndex: index + 2, // 1-based, header is row 1
      startRoll: row[0] || "",
      endRoll: row[1] || "",
      name: row[2] || "",
      signatureUrl: row[3] || "",
      phone: row[4] || "",
    })).filter((c) => c.name || c.startRoll || c.endRoll);

    return NextResponse.json({ success: true, data: controllers });
  } catch (error: any) {
    console.error("Error fetching controllers:", error);
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
    const { startRoll, endRoll, name, signatureUrl, phone } = body;

    if (!name && !startRoll) {
      return NextResponse.json(
        { success: false, message: "নিয়ন্ত্রকের নাম বা রোল রেঞ্জ আবশ্যক" },
        { status: 400 }
      );
    }

    const tabName = await getExactTabName("controlers");
    const rowValues = [
      startRoll || "",
      endRoll || "",
      name || "",
      signatureUrl || "",
      phone || "",
    ];

    const result = await appendSheetRow(tabName, rowValues);
    if (result) {
      return NextResponse.json({
        success: true,
        message: "নতুন পরীক্ষা নিয়ন্ত্রক সফলভাবে যুক্ত হয়েছে!",
      });
    }

    return NextResponse.json(
      { success: false, message: "গুগল শিটে যোগ করা সম্ভব হয়নি" },
      { status: 500 }
    );
  } catch (error: any) {
    console.error("Error adding controller:", error);
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
    const { rowIndex, startRoll, endRoll, name, signatureUrl, phone } = body;

    if (!rowIndex || rowIndex < 2) {
      return NextResponse.json({ success: false, message: "অবৈধ সারি সূচক (Row Index)" }, { status: 400 });
    }

    const tabName = await getExactTabName("controlers");
    const range = `${tabName}!A${rowIndex}:E${rowIndex}`;
    const values = [[
      startRoll || "",
      endRoll || "",
      name || "",
      signatureUrl || "",
      phone || "",
    ]];

    const updateRes = await updateSheetRange(range, values);
    if (updateRes) {
      return NextResponse.json({
        success: true,
        message: "পরীক্ষা নিয়ন্ত্রকের তথ্য সফলভাবে আপডেট হয়েছে!",
      });
    }

    return NextResponse.json(
      { success: false, message: "আপডেট সম্পন্ন হয়নি" },
      { status: 500 }
    );
  } catch (error: any) {
    console.error("Error updating controller:", error);
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

    const tabName = await getExactTabName("controlers");
    const result = await deleteRow(tabName, rowIndex);

    if (result && result.success) {
      return NextResponse.json({
        success: true,
        message: "পরীক্ষা নিয়ন্ত্রক সফলভাবে মুছে ফেলা হয়েছে!",
      });
    }

    return NextResponse.json(
      { success: false, message: result?.error || "মুছে ফেলা সম্ভব হয়নি" },
      { status: 500 }
    );
  } catch (error: any) {
    console.error("Error deleting controller:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
