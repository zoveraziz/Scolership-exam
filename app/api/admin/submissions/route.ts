import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { getSheetData, updateSheetRange } from "@/lib/google-sheets";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getAdminSession(req);
  if (!session) {
    return NextResponse.json({ success: false, message: "অননুমোদিত" }, { status: 401 });
  }

  const perms = session.permissions || [];
  if (session.role !== "super_admin" && !perms.includes("view_submissions")) {
    return NextResponse.json(
      { success: false, message: "আবেদনকারীদের তালিকা দেখার অনুমতি নেই।" },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const search = (searchParams.get("search") || "").trim().toLowerCase();
    const studentClass = searchParams.get("class") || "";
    const status = searchParams.get("status") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    let rows = await getSheetData("Submissions");

    // Apps Script Web App Fallback if direct Google Sheets API fails
    if (!rows || rows.length <= 1) {
      const scriptUrl = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL;
      if (scriptUrl) {
        try {
          const res = await fetch(`${scriptUrl}?action=getSubmissions`, { cache: "no-store" });
          if (res.ok) {
            const gasData = await res.json();
            if (gasData.success && Array.isArray(gasData.data) && gasData.data.length > 0) {
              let gasItems = gasData.data;
              if (studentClass) gasItems = gasItems.filter((i: any) => String(i.studentClass || "").toLowerCase() === studentClass.toLowerCase());
              if (status) gasItems = gasItems.filter((i: any) => String(i.status || "").toLowerCase() === status.toLowerCase());
              if (search) {
                gasItems = gasItems.filter((i: any) =>
                  String(i.regNo || "").toLowerCase().includes(search) ||
                  String(i.name || "").toLowerCase().includes(search) ||
                  String(i.guardianPhone || "").toLowerCase().includes(search) ||
                  String(i.rollNumber || "").toLowerCase().includes(search)
                );
              }
              const total = gasItems.length;
              const totalPages = Math.ceil(total / limit);
              const startIndex = (page - 1) * limit;
              return NextResponse.json({
                success: true,
                data: gasItems.slice(startIndex, startIndex + limit),
                total,
                page,
                totalPages,
              });
            }
          }
        } catch (e) {
          console.error("Apps script fallback error:", e);
        }
      }

      return NextResponse.json({
        success: true,
        data: [],
        total: 0,
        page,
        totalPages: 0,
      });
    }

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
      else if (c.includes("gender") || c.includes("লিঙ্গ")) idxGender = idx;
      else if (c.includes("institution") || c.includes("প্রতিষ্ঠান")) idxInst = idx;
      else if (c.includes("class") || c.includes("শ্রেণী") || c.includes("শ্রেণি")) idxClass = idx;
      else if (c.includes("principal") || c.includes("প্রধান শিক্ষক")) idxPrincipalPhone = idx;
      else if (c.includes("guardian") || c.includes("অভিভাবক")) idxPhone = idx;
      else if (c.includes("email") || c.includes("ইমেইল")) idxEmail = idx;
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

  const perms = session.permissions || [];

  try {
    const data = await req.json();
    const { rowIndex } = data;

    if (!rowIndex || rowIndex <= 1) {
      return NextResponse.json({ success: false, message: "রো নম্বর অনুপস্থিত" }, { status: 400 });
    }

    // Check if it's a full student edit or quick status/roll update
    if (data.name !== undefined) {
      if (session.role !== "super_admin" && !perms.includes("edit_submissions")) {
        return NextResponse.json(
          { success: false, message: "শিক্ষার্থীর তথ্য সংশোধন করার অনুমতি নেই।" },
          { status: 403 }
        );
      }
      // Full Student Update: Col B to Col S
      // B: RegNo, C: Roll, D: Name, E: Father, F: Mother, G: DOB, H: Gender, I: Inst, J: Class,
      // K: PrincipalPhone, L: GuardianPhone, M: Email, N: SenderBkash, O: PayShot, P: Photo,
      // Q: Center, R: Date, S: Status
      await updateSheetRange(`Submissions!B${rowIndex}:S${rowIndex}`, [
        [
          data.regNo || "",
          data.rollNumber || "",
          data.name || "",
          data.fatherName || "",
          data.motherName || "",
          data.dob || "",
          data.gender || "ছাত্র",
          data.institution || "",
          data.studentClass || "",
          data.principalPhone || "",
          data.guardianPhone || "",
          data.email || "",
          data.senderBkash || "",
          data.payShotUrl || "",
          data.photoUrl || "",
          data.examCenter || "",
          data.examDate || "",
          data.status || "অনুমোদিত",
        ],
      ]);
    } else {
      // Quick status/roll/center update
      if (session.role !== "super_admin" && !perms.includes("approve_admit")) {
        return NextResponse.json(
          { success: false, message: "প্রবেশপত্র অনুমোদন বা রোল বরাদ্দ করার অনুমতি নেই।" },
          { status: 403 }
        );
      }
      if (data.rollNumber !== undefined) {
        await updateSheetRange(`Submissions!C${rowIndex}`, [[String(data.rollNumber)]]);
      }
      if (data.examCenter !== undefined || data.examDate !== undefined || data.status !== undefined) {
        await updateSheetRange(`Submissions!Q${rowIndex}:S${rowIndex}`, [
          [data.examCenter || "", data.examDate || "", data.status || "অনুমোদিত"],
        ]);
      }
    }

    return NextResponse.json({
      success: true,
      message: "শিক্ষার্থীর সমস্ত তথ্য গুগল স্প্রেডশিটে সফলভাবে আপডেট হয়েছে!",
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getAdminSession(req);
  if (!session) {
    return NextResponse.json({ success: false, message: "অননুমোদিত" }, { status: 401 });
  }

  const perms = session.permissions || [];
  if (session.role !== "super_admin" && !perms.includes("delete_submissions")) {
    return NextResponse.json(
      { success: false, message: "আবেদনপত্র মুছে ফেলার অনুমতি নেই।" },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const rowIndex = parseInt(searchParams.get("rowIndex") || "0", 10);
    if (!rowIndex || rowIndex <= 1) {
      return NextResponse.json({ success: false, message: "সঠিক রো নম্বর দিন" }, { status: 400 });
    }

    // Clear submission row or mark as deleted
    await updateSheetRange(`Submissions!A${rowIndex}:S${rowIndex}`, [
      new Array(19).fill(""),
    ]);

    return NextResponse.json({
      success: true,
      message: "আবেদনপত্র সফলভাবে মুছে ফেলা হয়েছে!",
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
