import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = (searchParams.get("id") || searchParams.get("query") || "").trim().toUpperCase();

    if (!id) {
      return NextResponse.json({ success: false, message: "দয়া করে রেজিস্ট্রেশন বা রোল নম্বর প্রদান করুন।" }, { status: 400 });
    }

    const scriptUrl = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL || process.env.GOOGLE_SCRIPT_URL;

    if (scriptUrl && scriptUrl.startsWith("http")) {
      try {
        const response = await fetch(`${scriptUrl}?action=getAdmitCard&id=${encodeURIComponent(id)}`, {
          cache: "no-store",
        });
        const data = await response.json();
        if (data) {
          // যদি Google Apps Script থেকে পেন্ডিং, বাতিল বা অনুমোদিত কোনো তথ্য আসে
          if (data.status === "pending" || data.status === "cancelled" || data.found) {
            return NextResponse.json(data);
          }
          // যদি সাবমিশন শিটে কোনো ম্যাচিং না পাওয়া যায়
          if (data.found === false && id !== "DEMO" && id !== "10524" && id !== "SWF-2026-849201") {
            return NextResponse.json(data, { status: 404 });
          }
        }
      } catch (scriptErr) {
        console.warn("Google Apps Script admit lookup failed, using fallback:", scriptErr);
      }
    }

    // ডেমো বা লোকাল ডাটাবেজ ফলব্যাক
    const demoCandidates: Record<string, any> = {
      "SWF-2026-849201": {
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
        controllerName: "আব্দুল আজিজ",
        controllerDesignation: "পরীক্ষা নিয়ন্ত্রক",
        controllerPhone: "01721838990",
        controllerSignature: "https://drive.google.com/file/d/13u2vgaT3O7r5LqHTPYJy16j3EKdMvtQY/view?usp=sharing",
      },
      "10524": {
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
        controllerName: "আব্দুল আজিজ",
        controllerDesignation: "পরীক্ষা নিয়ন্ত্রক",
        controllerPhone: "01721838990",
        controllerSignature: "https://drive.google.com/file/d/13u2vgaT3O7r5LqHTPYJy16j3EKdMvtQY/view?usp=sharing",
      },
      "১০৫২৪": {
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
        controllerName: "আব্দুল আজিজ",
        controllerDesignation: "পরীক্ষা নিয়ন্ত্রক",
        controllerPhone: "01721838990",
        controllerSignature: "https://drive.google.com/file/d/13u2vgaT3O7r5LqHTPYJy16j3EKdMvtQY/view?usp=sharing",
      },
    };

    if (demoCandidates[id]) {
      const candidateData = { ...demoCandidates[id] };

      // গুগল শিটের Controllers ট্যাব থেকে লাইভ স্বাক্ষর ও নাম আনা
      if (scriptUrl && scriptUrl.startsWith("http")) {
        try {
          const ctrlRes = await fetch(`${scriptUrl}?action=getControllers&roll=${encodeURIComponent(id)}`, {
            cache: "no-store",
          });
          const ctrlJson = await ctrlRes.json();
          if (ctrlJson && ctrlJson.success && ctrlJson.data) {
            if (ctrlJson.data.name) candidateData.controllerName = ctrlJson.data.name;
            if (ctrlJson.data.designation) candidateData.controllerDesignation = ctrlJson.data.designation;
            if (ctrlJson.data.signature) candidateData.controllerSignature = ctrlJson.data.signature;
            if (ctrlJson.data.phone) candidateData.controllerPhone = ctrlJson.data.phone;
          }
        } catch (ctrlErr) {
          console.warn("Controllers fetch error:", ctrlErr);
        }
      }

      return NextResponse.json({
        success: true,
        found: true,
        data: candidateData,
      });
    }

    return NextResponse.json(
      { success: false, found: false, message: "প্রদত্ত রেজিস্ট্রেশন বা রোল নম্বরে কোনো প্রবেশপত্র পাওয়া যায়নি। অনুগ্রহ করে সঠিক রেজিস্ট্রেশন বা রোল নম্বর লিখুন।" },
      { status: 404 }
    );
  } catch (err) {
    return NextResponse.json({ success: false, error: "সার্ভারে ত্রুটি হয়েছে।" }, { status: 500 });
  }
}
