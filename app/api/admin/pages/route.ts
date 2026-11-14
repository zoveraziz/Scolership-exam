import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { getSheetData, appendSheetRow, updateSheetRange, deleteRow, ensurePagesTab } from "@/lib/google-sheets";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getAdminSession(req);
  if (!session) {
    return NextResponse.json({ success: false, message: "অননুমোদিত" }, { status: 401 });
  }

  try {
    await ensurePagesTab();
    const rows = await getSheetData("Pages");
    const pages: any[] = [];

    if (rows && rows.length > 1) {
      for (let i = 1; i < rows.length; i++) {
        const r = rows[i];
        if (r && r[0]) {
          pages.push({
            rowIndex: i + 1,
            slug: r[0] || "",
            title: r[1] || "",
            content: r[2] || "",
            showInMenu: r[3] || "Yes",
            parentMenu: r[4] || "",
            order: r[5] || i,
            status: r[6] || "Published",
          });
        }
      }
    }

    return NextResponse.json({ success: true, data: pages });
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
    await ensurePagesTab();
    const { slug, title, content, showInMenu, parentMenu, order, status } = await req.json();

    if (!slug || !title) {
      return NextResponse.json({ success: false, message: "পেজের টাইটেল ও স্লাগ আবশ্যক" }, { status: 400 });
    }

    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-_]/g, "-").replace(/-+/g, "-");

    await appendSheetRow("Pages", [
      cleanSlug,
      title,
      content || "",
      showInMenu || "Yes",
      parentMenu || "",
      order || "1",
      status || "Published",
    ]);

    return NextResponse.json({ success: true, message: "নতুন পেজ সফলভাবে তৈরি হয়েছে!" });
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
    const { rowIndex, slug, title, content, showInMenu, parentMenu, order, status } = await req.json();

    if (!rowIndex || rowIndex <= 1) {
      return NextResponse.json({ success: false, message: "অবৈধ রো" }, { status: 400 });
    }

    const cleanSlug = (slug || "").toLowerCase().replace(/[^a-z0-9-_]/g, "-").replace(/-+/g, "-");

    await updateSheetRange(`Pages!A${rowIndex}:G${rowIndex}`, [
      [
        cleanSlug,
        title || "",
        content || "",
        showInMenu || "Yes",
        parentMenu || "",
        order || "1",
        status || "Published",
      ],
    ]);

    return NextResponse.json({ success: true, message: "পেজ সফলভাবে আপডেট হয়েছে!" });
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
      return NextResponse.json({ success: false, message: "অবৈধ রো" }, { status: 400 });
    }

    const res = await deleteRow("Pages", rowIndex);
    if (res.success) {
      return NextResponse.json({ success: true, message: "পেজ সফলভাবে মুছে ফেলা হয়েছে!" });
    } else {
      return NextResponse.json({ success: false, message: res.error || "মুছে ফেলা যায়নি" }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
