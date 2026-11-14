import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { getSheetData, updateSheetRange } from "@/lib/google-sheets";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getAdminSession(req);
  if (!session) {
    return NextResponse.json({ success: false, message: "অননুমোদিত" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const search = (searchParams.get("search") || "").trim().toLowerCase();
    const studentClass = searchParams.get("class") || "";
    const status = searchParams.get("status") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const rows = await getSheetData("Submissions");
    if (!rows || rows.length <= 1) {
      return NextResponse.json({
        success: true,
        data: [],
        total: 0,
        page,
        totalPages: 0,
      });
    }

    let items: any[] = [];
    for (let i = 1; i < rows.length; i++) {
      const r = rows[i];
      if (!r || !r[0]) continue;

      const regNo = String(r[0] || "");
      const name = String(r[1] || "");
      const phone = String(r[10] || r[9] || "");
      const cls = String(r[8] || "");
      const st = String(r[15] || "Pending");
      const roll = String(r[16] || "");

      // Filters
      if (studentClass && cls.toLowerCase() !== studentClass.toLowerCase()) continue;
      if (status && st.toLowerCase() !== status.toLowerCase()) continue;
      if (search) {
        const matches =
          regNo.toLowerCase().includes(search) ||
          name.toLowerCase().includes(search) ||
          phone.toLowerCase().includes(search) ||
          roll.toLowerCase().includes(search);
        if (!matches) continue;
      }

      items.push({
        rowIndex: i + 1, // 1-based index in sheet
        regNo,
        name,
        fatherName: String(r[2] || ""),
        motherName: String(r[3] || ""),
        dob: String(r[4] || ""),
        gender: String(r[5] || ""),
        photoUrl: String(r[6] || ""),
        institution: String(r[7] || ""),
        studentClass: cls,
        guardianPhone: phone,
        email: String(r[11] || ""),
        senderBkash: String(r[12] || ""),
        payShotUrl: String(r[13] || ""),
        submissionDate: String(r[14] || ""),
        status: st,
        rollNumber: roll,
        examCenter: String(r[17] || ""),
        examDate: String(r[18] || ""),
      });
    }

    const total = items.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const paginatedItems = items.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      success: true,
      data: paginatedItems,
      total,
      page,
      totalPages,
    });
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
    const { rowIndex, status, rollNumber, examCenter, examDate } = await req.json();

    if (!rowIndex || rowIndex <= 1) {
      return NextResponse.json({ success: false, message: "রো নম্বর অনুপস্থিত" }, { status: 400 });
    }

    // Col P = Column 16 = Status
    // Col Q = Column 17 = Roll Number
    // Col R = Column 18 = Exam Center
    // Col S = Column 19 = Exam Date
    await updateSheetRange(`Submissions!P${rowIndex}:S${rowIndex}`, [
      [status || "Approved", rollNumber || "", examCenter || "", examDate || ""],
    ]);

    return NextResponse.json({
      success: true,
      message: "শিক্ষার্থীর স্ট্যাটাস ও রোল সফলভাবে আপডেট হয়েছে!",
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
