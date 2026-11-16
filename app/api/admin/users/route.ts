import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import {
  getSheetData,
  appendSheetRow,
  updateSheetRange,
  deleteSheetRow,
  ensureSheetTab,
} from "@/lib/google-sheets";
import { ROLES, UserRole } from "@/lib/rbac";

export const dynamic = "force-dynamic";

const USERS_HEADERS = [
  "Username",
  "Password",
  "Name",
  "Role",
  "Phone",
  "Email",
  "Status",
  "CreatedAt",
];

const DEFAULT_ADMIN_USER = {
  username: process.env.ADMIN_USERNAME || "admin",
  password: process.env.ADMIN_PASSWORD || "rhkl@Admin2026",
  name: process.env.ADMIN_NAME || "রেজাউল হাসান কয়েস লোদী ফাউন্ডেশন অ্যাডমিন",
  role: "super_admin",
  phone: process.env.NEXT_PUBLIC_HOTLINE || "০১৮২২৮৬২৯৩৯",
  email: process.env.NEXT_PUBLIC_EMAIL || "mabadshasyl@gmail.com",
  status: "active",
  createdAt: "2026-11-16",
};

/**
 * Helper to ensure Users tab exists and has at least the default admin seeded
 */
async function getOrSeedUsers(): Promise<any[][]> {
  await ensureSheetTab("Users", USERS_HEADERS);
  let rows = await getSheetData("Users");

  if (!rows || rows.length <= 1) {
    // Seed initial super admin row
    const defaultRow = [
      DEFAULT_ADMIN_USER.username,
      DEFAULT_ADMIN_USER.password,
      DEFAULT_ADMIN_USER.name,
      DEFAULT_ADMIN_USER.role,
      DEFAULT_ADMIN_USER.phone,
      DEFAULT_ADMIN_USER.email,
      DEFAULT_ADMIN_USER.status,
      DEFAULT_ADMIN_USER.createdAt,
    ];
    await appendSheetRow("Users", defaultRow);
    rows = [USERS_HEADERS, defaultRow];
  }

  return rows;
}

// 1. GET: Fetch all users
export async function GET(req: NextRequest) {
  const session = await getAdminSession(req);
  if (!session) {
    return NextResponse.json({ success: false, message: "অননুমোদিত" }, { status: 401 });
  }

  // Only super_admin or admin can view users list
  if (session.role !== "super_admin" && session.role !== "admin") {
    return NextResponse.json(
      { success: false, message: "আপনার এই সেকশনে প্রবেশের অনুমতি নেই।" },
      { status: 403 }
    );
  }

  try {
    const rows = await getOrSeedUsers();
    const users: any[] = [];

    for (let i = 1; i < rows.length; i++) {
      const r = rows[i];
      if (!r || !r[0]) continue;

      const rawRole = (r[3] || "admin").toLowerCase().trim() as UserRole;
      const roleConfig = ROLES[rawRole] || ROLES.admin;

      users.push({
        rowIndex: i + 1, // 1-based index in Google Sheets
        username: String(r[0] || "").trim(),
        name: String(r[2] || r[0] || "").trim(),
        role: rawRole,
        roleLabel: roleConfig.label,
        roleBadge: roleConfig.badgeClass,
        phone: String(r[4] || "").trim(),
        email: String(r[5] || "").trim(),
        status: String(r[6] || "active").toLowerCase().trim() === "inactive" ? "inactive" : "active",
        createdAt: String(r[7] || "").trim(),
      });
    }

    return NextResponse.json({
      success: true,
      data: users,
      roles: Object.values(ROLES).map((rc) => ({
        id: rc.id,
        label: rc.label,
        description: rc.description,
        badgeClass: rc.badgeClass,
      })),
    });
  } catch (error: any) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { success: false, message: "ইউজার ডাটা লোড করতে সমস্যা হয়েছে: " + error.message },
      { status: 500 }
    );
  }
}

// 2. POST: Create a new user
export async function POST(req: NextRequest) {
  const session = await getAdminSession(req);
  if (!session) {
    return NextResponse.json({ success: false, message: "অননুমোদিত" }, { status: 401 });
  }

  // Only super_admin can create users
  if (session.role !== "super_admin") {
    return NextResponse.json(
      { success: false, message: "শুধুমাত্র সুপার অ্যাডমিন নতুন ইউজার যোগ করতে পারবেন।" },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const username = (body.username || "").toLowerCase().trim().replace(/[^a-z0-9_-]/g, "");
    const password = (body.password || "").trim();
    const name = (body.name || "").trim();
    const role = (body.role || "admin").toLowerCase().trim();
    const phone = (body.phone || "").trim();
    const email = (body.email || "").trim();
    const status = (body.status || "active").toLowerCase().trim();

    if (!username || username.length < 3) {
      return NextResponse.json(
        { success: false, message: "ইউজারনেম ন্যূনতম ৩ অক্ষরের ইংরেজি নাম হতে হবে।" },
        { status: 400 }
      );
    }

    if (!password || password.length < 4) {
      return NextResponse.json(
        { success: false, message: "পাসওয়ার্ড ন্যূনতম ৪ অক্ষরের হতে হবে।" },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        { success: false, message: "ব্যবহারকারীর পূর্ণ নাম লিখুন।" },
        { status: 400 }
      );
    }

    const rows = await getOrSeedUsers();
    // Check if username already exists
    const exists = rows.slice(1).some((r) => String(r[0] || "").toLowerCase().trim() === username);
    if (exists) {
      return NextResponse.json(
        { success: false, message: `"${username}" ইউজারনেমটি ইতিমধ্যে বিদ্যমান!` },
        { status: 400 }
      );
    }

    const createdAt = new Date().toISOString().split("T")[0];
    const newRow = [username, password, name, role, phone, email, status, createdAt];

    await appendSheetRow("Users", newRow);

    return NextResponse.json({
      success: true,
      message: `নতুন ব্যবহারকারী "${name}" সফলভাবে তৈরি করা হয়েছে!`,
    });
  } catch (error: any) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { success: false, message: "ইউজার তৈরি করতে সমস্যা হয়েছে: " + error.message },
      { status: 500 }
    );
  }
}

// 3. PUT: Update an existing user
export async function PUT(req: NextRequest) {
  const session = await getAdminSession(req);
  if (!session) {
    return NextResponse.json({ success: false, message: "অননুমোদিত" }, { status: 401 });
  }

  // Only super_admin can update users
  if (session.role !== "super_admin") {
    return NextResponse.json(
      { success: false, message: "শুধুমাত্র সুপার অ্যাডমিন ইউজারের তথ্য পরিবর্তন করতে পারবেন।" },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { rowIndex, username, password, name, role, phone, email, status } = body;

    if (!rowIndex || rowIndex <= 1) {
      return NextResponse.json(
        { success: false, message: "সঠিক রো নম্বর পাওয়া যায়নি।" },
        { status: 400 }
      );
    }

    const rows = await getOrSeedUsers();
    const currentRow = rows[rowIndex - 1];
    if (!currentRow) {
      return NextResponse.json(
        { success: false, message: "ইউজার পাওয়া যায়নি।" },
        { status: 404 }
      );
    }

    // Keep existing password if empty in request
    const finalPassword = password && password.trim().length >= 4 ? password.trim() : currentRow[1];
    const finalUsername = (username || currentRow[0]).toLowerCase().trim();
    const finalName = name || currentRow[2];
    const finalRole = (role || currentRow[3] || "admin").toLowerCase().trim();
    const finalPhone = phone !== undefined ? phone : currentRow[4];
    const finalEmail = email !== undefined ? email : currentRow[5];
    const finalStatus = (status || currentRow[6] || "active").toLowerCase().trim();
    const createdAt = currentRow[7] || new Date().toISOString().split("T")[0];

    // If changing role of root admin, keep super_admin
    const safeRole = finalUsername === "admin" ? "super_admin" : finalRole;

    await updateSheetRange(`Users!A${rowIndex}:H${rowIndex}`, [
      [
        finalUsername,
        finalPassword,
        finalName,
        safeRole,
        finalPhone,
        finalEmail,
        finalStatus,
        createdAt,
      ],
    ]);

    return NextResponse.json({
      success: true,
      message: `"${finalName}"-এর তথ্য সফলভাবে আপডেট হয়েছে!`,
    });
  } catch (error: any) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { success: false, message: "ইউজার আপডেট করতে সমস্যা হয়েছে: " + error.message },
      { status: 500 }
    );
  }
}

// 4. DELETE: Delete a user
export async function DELETE(req: NextRequest) {
  const session = await getAdminSession(req);
  if (!session) {
    return NextResponse.json({ success: false, message: "অননুমোদিত" }, { status: 401 });
  }

  if (session.role !== "super_admin") {
    return NextResponse.json(
      { success: false, message: "শুধুমাত্র সুপার অ্যাডমিন ইউজার মুছে ফেলতে পারবেন।" },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const rowIndex = parseInt(searchParams.get("rowIndex") || "0", 10);
    const username = (searchParams.get("username") || "").toLowerCase().trim();

    if (!rowIndex || rowIndex <= 1) {
      return NextResponse.json(
        { success: false, message: "সঠিক রো নম্বর পাওয়া যায়নি।" },
        { status: 400 }
      );
    }

    // Protection: Cannot delete yourself!
    if (session.username.toLowerCase() === username) {
      return NextResponse.json(
        { success: false, message: "আপনি নিজের চলমান লগইন অ্যাকাউন্ট মুছতে পারবেন না!" },
        { status: 400 }
      );
    }

    // Protection: Cannot delete main root admin
    if (username === "admin") {
      return NextResponse.json(
        { success: false, message: "প্রধান সিস্টেম অ্যাডমিন (admin) মোছা যাবে না!" },
        { status: 400 }
      );
    }

    const success = await deleteSheetRow("Users", rowIndex);
    if (!success) {
      return NextResponse.json(
        { success: false, message: "ইউজার মুছতে সমস্যা হয়েছে।" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `ইউজার "${username}" সফলভাবে মুছে ফেলা হয়েছে!`,
    });
  } catch (error: any) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { success: false, message: "ইউজার মুছতে ব্যর্থ হয়েছে: " + error.message },
      { status: 500 }
    );
  }
}
