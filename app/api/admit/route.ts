import { NextResponse } from "next/server";
import { getSheetData, getExactTabName } from "@/lib/google-sheets";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = (searchParams.get("id") || searchParams.get("query") || "").trim().toUpperCase();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "দয়া করে রেজিস্ট্রেশন বা রোল নম্বর প্রদান করুন।" },
        { status: 400 }
      );
    }

    // 1. Check Settings for Admit Card Download Permission
    let admitStatus = "স্বয়ংক্রিয়";
    let admitNotice = "";
    let deadline = "";
    try {
      const setTab = await getExactTabName("Settings");
      const setRows = await getSheetData(setTab);
      if (setRows) {
        setRows.forEach((r) => {
          if (r && r[0]) {
            const k = String(r[0]).trim();
            const v = r[1] !== undefined ? String(r[1]).trim() : "";
            if (k.toLowerCase().includes("admitcardstatus") || k === "AdmitCardStatus") {
              admitStatus = v;
            }
            if (k === "AdmitCardNotice") {
              admitNotice = v;
            }
            if (k === "ApplicationDeadline") {
              deadline = v;
            }
          }
        });
      }
    } catch (e) {
      console.warn("Could not load settings for admit validation:", e);
    }

    const isClosed = admitStatus.toLowerCase() === "বন্ধ" || admitStatus.toLowerCase() === "closed";
    if (isClosed && id !== "DEMO" && id !== "10524") {
      return NextResponse.json({
        success: false,
        status: "closed",
        message:
          admitNotice ||
          "বর্তমানে প্রবেশপত্র ডাউনলোড সাময়িকভাবে বন্ধ রাখা হয়েছে। কর্তৃপক্ষের পরবর্তী নির্দেশনার জন্য অপেক্ষা করুন।",
      });
    }

    // 2. Direct lookup from Google Sheet 'Submissions'
    try {
      const subTab = await getExactTabName("Submissions");
      const rows = await getSheetData(subTab);

      if (rows && rows.length > 1) {
        const header = rows[0].map((h: any) => String(h || "").trim().toLowerCase());
        const regIdx = header.findIndex((h) => h.includes("রেজি") || h.includes("reg"));
        const rollIdx = header.findIndex((h) => h.includes("রোল") || h.includes("roll"));
        const nameIdx = header.findIndex((h) => h.includes("নাম") || h.includes("name"));
        const fatherIdx = header.findIndex((h) => h.includes("পিতা") || h.includes("father"));
        const motherIdx = header.findIndex((h) => h.includes("মাতা") || h.includes("mother"));
        const classIdx = header.findIndex((h) => h.includes("শ্রেণি") || h.includes("class"));
        const instIdx = header.findIndex((h) => h.includes("প্রতিষ্ঠান") || h.includes("institution"));
        const photoIdx = header.findIndex((h) => h.includes("ছবি") || h.includes("photo"));
        const centerIdx = header.findIndex((h) => h.includes("কেন্দ্র") || h.includes("center"));
        const examDateIdx = header.findIndex((h) => h.includes("তারিখ") || h.includes("date"));
        const statusIdx = header.findIndex((h) => h.includes("অবস্থা") || h.includes("status"));

        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          const regVal = regIdx >= 0 ? String(row[regIdx] || "").trim().toUpperCase() : "";
          const rollVal = rollIdx >= 0 ? String(row[rollIdx] || "").trim().toUpperCase() : "";

          if (regVal === id || rollVal === id) {
            const rawStatus = statusIdx >= 0 ? String(row[statusIdx] || "").trim() : "পেন্ডিং";
            const isApproved =
              rawStatus.toLowerCase() === "approved" ||
              rawStatus === "অনুমোদিত" ||
              rawStatus.toLowerCase() === "active";

            if (!isApproved) {
              return NextResponse.json({
                success: true,
                found: true,
                status: "pending",
                message:
                  "আপনার আবেদনটি এখনো প্রক্রিয়াধীন (Pending) রয়েছে। কর্তৃপক্ষ আবেদন যাচাই ও অনুমোদন করার পর এডমিট কার্ড ডাউনলোড করতে পারবেন।",
              });
            }

            // Student is approved! Now lookup controller from 'controlers'
            let ctrlName = "পরীক্ষা নিয়ন্ত্রক";
            let ctrlDesignation = "কেন্দ্রীয় পরীক্ষা পরিচালনা পরিষদ";
            let ctrlPhone = "";
            let ctrlSignature = "";

            try {
              const ctrlTab = await getExactTabName("controlers");
              const ctrlRows = await getSheetData(ctrlTab);
              if (ctrlRows && ctrlRows.length > 1) {
                const numericRoll = parseInt(rollVal.replace(/[^\d]/g, ""), 10);
                let matchedCtrl = null;

                for (let c = 1; c < ctrlRows.length; c++) {
                  const crow = ctrlRows[c];
                  const sRoll = parseInt(String(crow[0] || "").replace(/[^\d]/g, ""), 10);
                  const eRoll = parseInt(String(crow[1] || "").replace(/[^\d]/g, ""), 10);

                  if (!isNaN(numericRoll) && !isNaN(sRoll) && !isNaN(eRoll)) {
                    if (numericRoll >= sRoll && numericRoll <= eRoll) {
                      matchedCtrl = crow;
                      break;
                    }
                  }
                }

                if (!matchedCtrl) {
                  matchedCtrl = ctrlRows[1]; // fallback to first controller
                }

                if (matchedCtrl) {
                  ctrlName = matchedCtrl[2] || ctrlName;
                  ctrlSignature = matchedCtrl[3] || "";
                  ctrlPhone = matchedCtrl[4] || "";
                }
              }
            } catch (cErr) {
              console.warn("Controller lookup error:", cErr);
            }

            return NextResponse.json({
              success: true,
              found: true,
              data: {
                regNo: regVal || id,
                rollNumber: rollVal || "বরাদ্দ হয়নি",
                name: nameIdx >= 0 ? row[nameIdx] || "" : "",
                fatherName: fatherIdx >= 0 ? row[fatherIdx] || "" : "",
                motherName: motherIdx >= 0 ? row[motherIdx] || "" : "",
                studentClass: classIdx >= 0 ? row[classIdx] || "" : "",
                institution: instIdx >= 0 ? row[instIdx] || "" : "",
                photoUrl: photoIdx >= 0 ? row[photoIdx] || "" : "",
                examCenter: centerIdx >= 0 && row[centerIdx] ? row[centerIdx] : "আম্বরখানা গার্লস স্কুল এন্ড কলেজ কেন্দ্র",
                examDate: examDateIdx >= 0 && row[examDateIdx] ? row[examDateIdx] : "২০ নভেম্বর ২০২৭",
                examTime: "সকাল ১০:০০ টা",
                controllerName: ctrlName,
                controllerDesignation: ctrlDesignation,
                controllerPhone: ctrlPhone,
                controllerSignature: ctrlSignature,
              },
            });
          }
        }
      }
    } catch (sheetErr) {
      console.warn("Direct sheet lookup failed, trying Apps Script:", sheetErr);
    }

    // 3. Fallback to Google Apps Script URL
    const scriptUrl = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL || process.env.GOOGLE_SCRIPT_URL;
    if (scriptUrl && scriptUrl.startsWith("http")) {
      try {
        const response = await fetch(`${scriptUrl}?action=getAdmitCard&id=${encodeURIComponent(id)}`, {
          cache: "no-store",
        });
        const data = await response.json();
        if (data && (data.status === "pending" || data.status === "cancelled" || data.found)) {
          return NextResponse.json(data);
        }
      } catch (scriptErr) {
        console.warn("Google Apps Script admit lookup failed:", scriptErr);
      }
    }

    // 4. Demo Candidate Fallback
    if (id === "DEMO" || id === "10524" || id === "SWF-2026-849201") {
      return NextResponse.json({
        success: true,
        found: true,
        data: {
          regNo: "SWF-2026-849201",
          rollNumber: "১০৫২৪",
          name: "আব্দুর রহমান",
          fatherName: "মো: রফিকুল ইসলাম",
          motherName: "মোছা: সুফিয়া খাতুন",
          studentClass: "৫ম শ্রেণী",
          institution: "গভর্নমেন্ট ল্যাবরেটরী হাই স্কুল",
          examCenter: "বি.এ.এফ শাহীন কলেজ কেন্দ্র, ঢাকা",
          examDate: "২০ নভেম্বর ২০২৬",
          examTime: "সকাল ১০:০০ টা",
          controllerName: "আব্দুল্লাহ আল মায়াজ",
          controllerDesignation: "পরীক্ষা নিয়ন্ত্রক",
          controllerPhone: "০১৭২১৮৩৮৯৯০",
          controllerSignature: "https://drive.google.com/file/d/13u2vgaT3O7r5LqHTPYJy16j3EKdMvtQY/view?usp=sharing",
        },
      });
    }

    return NextResponse.json(
      {
        success: false,
        found: false,
        message: "প্রদত্ত রেজিস্ট্রেশন বা রোল নম্বরে কোনো তথ্য পাওয়া যায়নি। সঠিক নম্বর দিয়ে পুনরায় চেষ্টা করুন।",
      },
      { status: 404 }
    );
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || "সার্ভার এরর" }, { status: 500 });
  }
}
