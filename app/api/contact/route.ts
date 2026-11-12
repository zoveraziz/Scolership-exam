import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const scriptUrl = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL || process.env.GOOGLE_SCRIPT_URL;

    if (scriptUrl && scriptUrl.startsWith("http")) {
      try {
        const response = await fetch(scriptUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "contact",
            ...body,
            timestamp: new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" }),
          }),
        });
        const data = await response.json();
        return NextResponse.json(data);
      } catch (scriptErr) {
        console.warn("Google Apps Script contact failed:", scriptErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: "আপনার বার্তা সফলভাবে গৃহীত হয়েছে! শীঘ্রই যোগাযোগ করা হবে।",
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: "বার্তা পাঠাতে ব্যর্থ হয়েছে।" }, { status: 500 });
  }
}
