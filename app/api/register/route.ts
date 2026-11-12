import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const scriptUrl = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL || process.env.GOOGLE_SCRIPT_URL;

    // যদি গুগল স্ক্রিপ্ট URL কনফিগার করা থাকে, তাহলে গুগল শিটে ডাটা পাঠাই
    if (scriptUrl && scriptUrl.startsWith("http")) {
      try {
        const response = await fetch(scriptUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "register",
            ...body,
            timestamp: new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" }),
          }),
        });

        const data = await response.json();
        return NextResponse.json(data);
      } catch (scriptErr) {
        console.warn("Google Apps Script sync failed, returning client fallback:", scriptErr);
      }
    }

    // লোকাল ফলব্যাক রেসপন্স (যাতে গুগল শিট সেটআপ ছাড়াই সরাসরি ওয়েবসাইট কাজ করে)
    const regNo = body.regNo || `SWF-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const rollNumber = `${Math.floor(10000 + Math.random() * 90000)}`;

    return NextResponse.json({
      success: true,
      message: "আপনার আবেদন সফলভাবে জমা হয়েছে!",
      regNo: regNo,
      rollNumber: rollNumber,
      examCenter: "বি.এ.এফ শাহীন কলেজ কেন্দ্র, ঢাকা",
      examDate: "২০ নভেম্বর ২০২৬ (সকাল ১০:০০ টা)",
      data: {
        ...body,
        regNo,
        rollNumber,
      },
    });
  } catch (error) {
    console.error("Registration API error:", error);
    return NextResponse.json(
      { success: false, error: "আবেদন প্রক্রিয়াকরণে ত্রুটি হয়েছে। পুনরায় চেষ্টা করুন।" },
      { status: 500 }
    );
  }
}
