import { NextRequest, NextResponse } from "next/server";
import { createToken, COOKIE_NAME } from "@/lib/admin-auth";
import { getSheetData, ensureSheetTab } from "@/lib/google-sheets";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: "ইউজারনেম ও পাসওয়ার্ড প্রদান করুন।" },
        { status: 400 }
      );
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password.trim();

    let authenticatedUser: {
      username: string;
      name: string;
      role: string;
    } | null = null;

    // 1. Check Google Sheets "Users" tab
    try {
      const rows = await getSheetData("Users");
      if (rows && rows.length > 1) {
        for (let i = 1; i < rows.length; i++) {
          const r = rows[i];
          if (!r || !r[0]) continue;

          const u = String(r[0]).trim().toLowerCase();
          const p = String(r[1] || "").trim();
          const name = String(r[2] || r[0]).trim();
          const role = String(r[3] || "admin").trim().toLowerCase();
          const status = String(r[6] || "active").trim().toLowerCase();

          if (u === cleanUsername) {
            if (p !== cleanPassword) {
              return NextResponse.json(
                { success: false, message: "ভুল পাসওয়ার্ড!" },
                { status: 401 }
              );
            }

            if (status === "inactive") {
              return NextResponse.json(
                {
                  success: false,
                  message: "আপনার অ্যাকাউন্টটি নিষ্ক্রিয় করা হয়েছে। প্রধান অ্যাডমিনের সাথে যোগাযোগ করুন।",
                },
                { status: 403 }
              );
            }

            authenticatedUser = {
              username: String(r[0]).trim(),
              name,
              role,
            };
            break;
          }
        }
      }
    } catch (sheetErr) {
      console.warn("Could not query Users sheet, trying env fallback:", sheetErr);
    }

    // 2. Fallback to Environment Variables (Emergency/Primary Super Admin)
    if (!authenticatedUser) {
      const envUser = (process.env.ADMIN_USERNAME || "admin").trim().toLowerCase();
      const envPass = (process.env.ADMIN_PASSWORD || "rhkl@Admin2026").trim();
      const envName = process.env.ADMIN_NAME || "রেজাউল হাসান কয়েস লোদী ফাউন্ডেশন অ্যাডমিন";

      if (cleanUsername === envUser && cleanPassword === envPass) {
        authenticatedUser = {
          username: process.env.ADMIN_USERNAME || "admin",
          name: envName,
          role: "super_admin",
        };
      }
    }

    if (!authenticatedUser) {
      return NextResponse.json(
        { success: false, message: "ভুল ইউজারনেম অথবা পাসওয়ার্ড!" },
        { status: 401 }
      );
    }

    const token = createToken(
      authenticatedUser.username,
      authenticatedUser.name,
      authenticatedUser.role
    );

    const response = NextResponse.json({
      success: true,
      message: "সফলভাবে লগইন হয়েছে।",
      admin: {
        username: authenticatedUser.username,
        name: authenticatedUser.name,
        role: authenticatedUser.role,
      },
    });

    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "সার্ভারে সমস্যা হয়েছে: " + error.message },
      { status: 500 }
    );
  }
}
