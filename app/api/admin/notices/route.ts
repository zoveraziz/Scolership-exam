import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { getSheetData, appendSheetRow, updateSheetRange, deleteRow } from "@/lib/google-sheets";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getAdminSession(req);
  if (!session) {
    return NextResponse.json({ success: false, message: "অননুমোদিত" }, { status: 401 });
  }

  const scriptUrl = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL || process.env.GOOGLE_SCRIPT_URL;

  try {
    const rows = await getSheetData("Notices");
    const notices: any[] = [];

    if (rows && rows.length > 1) {
      // row 0 is header: [SL, Date, Title, Category, Content, FileUrl]
      for (let i = 1; i < rows.length; i++) {
        const r = rows[i];
        if (r && r[2]) {
          notices.push({
            rowIndex: i + 1, // 1-based index in sheet
            sl: r[0] || i,
            date: r[1] || "",
            title: r[2] || "",
            category: r[3] || "সাধারণ",
            content: r[4] || "",
            fileUrl: r[5] || "",
          });
        }
      }
    }

    if (notices.length === 0 && scriptUrl && scriptUrl.startsWith("http")) {
      try {
        const res = await fetch(`${scriptUrl}?action=getNotices`, { cache: "no-store" });
        const resData = await res.json();
        if (resData.success && resData.data && resData.data.length > 0) {
          return NextResponse.json({
            success: true,
            data: resData.data.map((n: any, idx: number) => ({
              rowIndex: idx + 2,
              sl: String(idx + 1),
              date: n.date,
              title: n.title,
              category: n.category || "সাধারণ",
              content: n.content,
              fileUrl: n.fileUrl || "",
            })),
          });
        }
      } catch (e) {}
    }

    return NextResponse.json({ success: true, data: notices });
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
    const { title, date, category, content, fileUrl } = await req.json();

    if (!title) {
      return NextResponse.json({ success: false, message: "শিরোনাম আবশ্যক" }, { status: 400 });
    }

    const rows = (await getSheetData("Notices")) || [];
    const nextSl = rows.length > 1 ? rows.length : 1;
    const finalDate = date || new Date().toLocaleDateString("bn-BD", { day: "numeric", month: "long", year: "numeric" });

    await appendSheetRow("Notices", [
      nextSl,
      finalDate,
      title,
      category || "সাধারণ",
      content || "",
      fileUrl || "",
    ]);

    return NextResponse.json({ success: true, message: "নতুন নোটিশ প্রকাশিত হয়েছে!" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getAdminSession(req);
  if (!session) {
    return NextResponse.json({ success: false, message: "অননুমোদিত" }, { status: 401 });
  }

  try {
    const { rowIndex, sl, date, title, category, content, fileUrl } = await req.json();

    if (!rowIndex) {
      return NextResponse.json({ success: false, message: "রো নম্বর অনুপস্থিত" }, { status: 400 });
    }

    await updateSheetRange(`Notices!A${rowIndex}:F${rowIndex}`, [
      [sl || "", date || "", title || "", category || "সাধারণ", content || "", fileUrl || ""],
    ]);

    return NextResponse.json({ success: true, message: "নোটিশ সফলভাবে আপডেট হয়েছে!" });
  } catch (error: any) {
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

    if (!rowIndex || rowIndex <= 1) {
      return NextResponse.json({ success: false, message: "অবৈধ নোটিশ রো" }, { status: 400 });
    }

    const res = await deleteRow("Notices", rowIndex);
    if (res.success) {
      return NextResponse.json({ success: true, message: "নোটিশ মুছে ফেলা হয়েছে!" });
    } else {
      return NextResponse.json({ success: false, message: res.error || "মুছে ফেলা যায়নি" }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
