import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getAdminSession(req);

  if (!session) {
    return NextResponse.json(
      { success: false, authenticated: false, message: "অননুমোদিত এক্সেস" },
      { status: 401 }
    );
  }

  return NextResponse.json({
    success: true,
    authenticated: true,
    admin: {
      username: session.username,
      name: session.name,
      role: session.role,
    },
  });
}
