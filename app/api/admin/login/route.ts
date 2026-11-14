import { NextRequest, NextResponse } from "next/server";
import { createToken, COOKIE_NAME } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    const expectedUser = process.env.ADMIN_USERNAME || "admin";
    const expectedPass = process.env.ADMIN_PASSWORD || "rhkl@Admin2026";
    const adminName = process.env.ADMIN_NAME || "রেজাউল হাসান কয়েস লোদী ফাউন্ডেশন অ্যাডমিন";

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: "ইউজারনেম ও পাসওয়ার্ড প্রদান করুন।" },
        { status: 400 }
      );
    }

    if (username.trim() !== expectedUser || password.trim() !== expectedPass) {
      return NextResponse.json(
        { success: false, message: "ভুল ইউজারনেম অথবা পাসওয়ার্ড!" },
        { status: 401 }
      );
    }

    const token = createToken(username.trim(), adminName);

    const response = NextResponse.json({
      success: true,
      message: "সফলভাবে লগইন হয়েছে।",
      admin: {
        username: expectedUser,
        name: adminName,
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
      { success: false, message: "সার্ভারে সমস্যা হয়েছে।" },
      { status: 500 }
    );
  }
}
