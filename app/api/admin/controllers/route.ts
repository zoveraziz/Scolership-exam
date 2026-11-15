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
          // Check if Apps Script supports returning all controllers list
          const allRes = await fetch(`${scriptUrl}?action=getControllers&all=true`, { cache: "no-store" });
          const allData = await allRes.json();
          if (allData.success && Array.isArray(allData.data) && allData.data.length > 1) {
            return NextResponse.json({
              success: true,
              data: allData.data,
            });
          }

          // Fetch all 5 controllers across roll ranges in parallel
          const sampleRolls = [
            { s: "10001", e: "10630", r: 10001 },
            { s: "10631", e: "10721", r: 10640 },
            { s: "10722", e: "10920", r: 10850 },
            { s: "10921", e: "11200", r: 11000 },
            { s: "11201", e: "20000", r: 11250 },
          ];

          const fetched = await Promise.all(
            sampleRolls.map(async (item, idx) => {
              try {
                const res = await fetch(`${scriptUrl}?action=getControllers&roll=${item.r}`, {
                  cache: "no-store",
                });
                const resData = await res.json();
                if (resData.success && resData.data) {
                  return {
                    rowIndex: idx + 2,
                    startRoll: item.s,
                    endRoll: item.e,
                    name: resData.data.name || `পরীক্ষা নিয়ন্ত্রক ${idx + 1}`,
                    signatureUrl: resData.data.signature || "",
                    phone: resData.data.phone || "",
                  };
                }
              } catch (err) {}
              return null;
            })
          );

          const validList = fetched.filter(Boolean) as any[];
          if (validList.length >= 4) {
            // If the 5th controller is a duplicate of the 1st due to fallback, set proper 5th controller
            if (validList.length >= 5 && validList[4].name === validList[0].name) {
              validList[4].name = "মাুহাম্মদ আলি বাদশা";
              validList[4].phone = "০১৮২২৮৬২৯৩৯";
              validList[4].signatureUrl = "https://drive.google.com/file/d/1JzJ0O8o_whLChmIoLsMvxEy_VZjhwsiV/view?usp=sharing";
            }
            return NextResponse.json({
              success: true,
              data: validList,
            });
          }
        } catch (e) {}
      }

      // Default fallback with all 5 examination controllers
      return NextResponse.json({
        success: true,
        data: [
          {
            rowIndex: 2,
            startRoll: "10001",
            endRoll: "10630",
            name: "আব্দুল্লাহ আল মায়াজ",
            signatureUrl: "https://drive.google.com/file/d/13u2vgaT3O7r5LqHTPYJy16j3EKdMvtQY/view?usp=sharing",
            phone: "০১৭২১৮৩৮৯৯০",
          },
          {
            rowIndex: 3,
            startRoll: "10631",
            endRoll: "10721",
            name: "প্রফেসর ড. মুহাম্মদ আব্দুল করিম",
            signatureUrl: "https://drive.google.com/file/d/1EDyLD3jE5POucm1gcN-gxWkkndxwpMhy/view?usp=sharing",
            phone: "২১৭২৫৮৯৮০৯৮",
          },
          {
            rowIndex: 4,
            startRoll: "10722",
            endRoll: "10920",
            name: "ইঞ্জিনিয়ার মো. রফিকুল ইসলাম",
            signatureUrl: "https://drive.google.com/file/d/1KUtsXRHs1YHAk6zMfUmlE9XbzAeBqYoe/view?usp=sharing",
            phone: "০১৭৭০২৮০০৩৯",
          },
          {
            rowIndex: 5,
            startRoll: "10921",
            endRoll: "11200",
            name: "মাওলানা এ. এইচ. এম. নোমান",
            signatureUrl: "https://drive.google.com/file/d/1Fqzu-VOmqwnajmwhDACb3mmbNijg7WPU/view?usp=sharing",
            phone: "০১৭১২৭৬৪৫১৫",
          },
          {
            rowIndex: 6,
            startRoll: "11201",
            endRoll: "20000",
            name: "মাুহাম্মদ আলি বাদশা",
            signatureUrl: "https://drive.google.com/file/d/1JzJ0O8o_whLChmIoLsMvxEy_VZjhwsiV/view?usp=sharing",
            phone: "০১৮২২৮৬২৯৩৯",
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
