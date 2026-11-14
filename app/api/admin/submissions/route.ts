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

    // Determine header mapping dynamically in case columns vary
    const headerRow = rows[0] || [];
    let idxTimestamp = 0;
    let idxReg = 1;
    let idxRoll = 2;
    let idxName = 3;
    let idxFather = 4;
    let idxMother = 5;
    let idxDob = 6;
    let idxGender = 7;
    let idxInst = 8;
    let idxClass = 9;
    let idxPrincipalPhone = 10;
    let idxPhone = 11;
    let idxEmail = 12;
    let idxSenderBkash = 13;
    let idxPayShot = 14;
    let idxPhoto = 15;
    let idxCenter = 16;
    let idxDate = 17;
    let idxStatus = 18;

    headerRow.forEach((colName: any, idx: number) => {
      const c = String(colName || "").toLowerCase();
      if (c.includes("reg") || c.includes("রেজি")) idxReg = idx;
      else if (c.includes("roll") || c.includes("রোল")) idxRoll = idx;
      else if (c.includes("student name") || c.includes("নাম")) idxName = idx;
      else if (c.includes("father") || c.includes("পিতা")) idxFather = idx;
      else if (c.includes("mother") || c.includes("মাতা")) idxMother = idx;
      else if (c.includes("birth") || c.includes("জন্ম")) idxDob = idx;
      else if (c.includes("institution") || c.includes("প্রতিষ্ঠান")) idxInst = idx;
      else if (c.includes("class") || c.includes("শ্রেণী") || c.includes("শ্রেণি")) idxClass = idx;
      else if (c.includes("guardian") || c.includes("অভিভাবক")) idxPhone = idx;
      else if (c.includes("sender") || c.includes("প্রেরক")) idxSenderBkash = idx;
      else if (c.includes("payment") || c.includes("পেমেন্ট")) idxPayShot = idx;
      else if (c.includes("photo") || c.includes("ছবি")) idxPhoto = idx;
      else if (c.includes("center") || c.includes("কেন্দ্র")) idxCenter = idx;
      else if (c.includes("status") || c.includes("অবস্থা")) idxStatus = idx;
    });

    let items: any[] = [];
    for (let i = 1; i < rows.length; i++) {
      const r = rows[i];
      if (!r || (!r[idxReg] && !r[idxName])) continue;

      const regNo = String(r[idxReg] || "");
      const name = String(r[idxName] || "");
      const roll = String(r[idxRoll] || "");
      const phone = String(r[idxPhone] || r[idxPrincipalPhone] || "");
      const cls = String(r[idxClass] || "");
      const st = String(r[idxStatus] || "পেন্ডিং");
      const photoUrl = String(r[idxPhoto] || "");
      const payShotUrl = String(r[idxPayShot] || "");

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
        rollNumber: roll,
        name,
        fatherName: String(r[idxFather] || ""),
        motherName: String(r[idxMother] || ""),
        dob: String(r[idxDob] || ""),
        gender: String(r[idxGender] || ""),
        institution: String(r[idxInst] || ""),
        studentClass: cls,
        principalPhone: String(r[idxPrincipalPhone] || ""),
        guardianPhone: phone,
        email: String(r[idxEmail] || ""),
        senderBkash: String(r[idxSenderBkash] || ""),
        payShotUrl,
        photoUrl,
        examCenter: String(r[idxCenter] || ""),
        examDate: String(r[idxDate] || ""),
        status: st,
        timestamp: String(r[idxTimestamp] || ""),
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

    // Col C = Roll No
    if (rollNumber !== undefined) {
      await updateSheetRange(`Submissions!C${rowIndex}`, [[String(rollNumber)]]);
    }

    // Col Q = Exam Center, Col R = Exam Date, Col S = Status
    if (examCenter !== undefined || examDate !== undefined || status !== undefined) {
      await updateSheetRange(`Submissions!Q${rowIndex}:S${rowIndex}`, [
        [examCenter || "", examDate || "", status || "অনুমোদিত"],
      ]);
    }

    return NextResponse.json({
      success: true,
      message: "শিক্ষার্থীর স্ট্যাটাস ও রোল সফলভাবে আপডেট হয়েছে!",
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
