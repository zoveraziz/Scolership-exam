import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import {
  getSheetData,
  appendSheetRow,
  updateSheetRange,
  deleteSheetRow,
  ensureSheetTab,
} from "@/lib/google-sheets";
import {
  ROLES,
  ALL_PERMISSIONS,
  UserRole,
  normalizePermissions,
  getDefaultPermissions,
  PermissionKey,
} from "@/lib/rbac";

export const dynamic = "force-dynamic";

const USERS_HEADERS = [
  "Username",
  "Password",
  "Name",
  "Role",
  "Permissions",
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
  permissions: "all",
  phone: process.env.NEXT_PUBLIC_HOTLINE || "০১৮২২৮৬২৯৩৯",
  email: process.env.NEXT_PUBLIC_EMAIL || "mabadshasyl@gmail.com",
  status: "active",
  createdAt: "2026-11-16",
};

export const ROLES_HEADERS = [
  "ভূমিকা / রোল (Role)",
  "রোল আইডি (Role ID)",
  "ব্যাজ (Badge)",
  "অনুমতি ও অ্যাক্সেস (Permissions Summary)",
  "পারমিশন কি-সমূহ (Default Permission Keys)",
];

export const DEFAULT_ROLES_ROWS = [
  [
    "👑 সুপার অ্যাডমিন",
    "super_admin",
    "গোল্ডেন",
    "সম্পূর্ণ অ্যাক্সেস: ইউজার তৈরি/ডিলিট, পাসওয়ার্ড রিসেট, ওয়েবসাইট সেটিংস এবং সমস্ত ডাটা কন্ট্রোল।",
    "all",
  ],
  [
    "🛡️ অ্যাডমিন",
    "admin",
    "গ্রিন",
    "আবেদনকারী, নোটিশ, বাণী ও কমিটি পরিচালনা (সেটিংস ও ইউজার তৈরি ছাড়া)।",
    "view_submissions,approve_admit,edit_submissions,manage_controllers,manage_notices,manage_messages,manage_committee,manage_pages,export_data",
  ],
  [
    "🎓 পরীক্ষা নিয়ন্ত্রক",
    "controller",
    "পার্পল",
    "শুধুমাত্র আবেদনপত্র যাচাইকরণ, রোল নম্বর বণ্টন ও প্রবেশপত্র অনুমোদন।",
    "view_submissions,approve_admit,edit_submissions,manage_controllers,export_data",
  ],
  [
    "👤 ডাটা এন্ট্রি অপারেটর",
    "operator",
    "ব্লু",
    "শুধুমাত্র আবেদনকারী তালিকা দেখা এবং প্রবেশপত্র প্রিন্ট করা (নো এডিট)।",
    "view_submissions",
  ],
];

export async function ensureRolesTab(): Promise<void> {
  try {
    await ensureSheetTab("Roles", ROLES_HEADERS);
    const existing = await getSheetData("Roles");
    if (!existing || existing.length <= 1) {
      await updateSheetRange("Roles!A1:E1", [ROLES_HEADERS]);
      await updateSheetRange("Roles!A2:E5", DEFAULT_ROLES_ROWS);
    }
  } catch (err) {
    console.error("Error creating/syncing Roles tab in Google Sheet:", err);
  }
}

/**
 * Ensures Users tab exists and has the standard 9-column header with Permissions.
 */
async function getOrSeedUsers(): Promise<{ rows: any[][]; colMap: Record<string, number> }> {
  await ensureRolesTab();
  await ensureSheetTab("Users", USERS_HEADERS);
  let rows = await getSheetData("Users");

  if (!rows || rows.length <= 1) {
    const defaultRow = [
      DEFAULT_ADMIN_USER.username,
      DEFAULT_ADMIN_USER.password,
      DEFAULT_ADMIN_USER.name,
      DEFAULT_ADMIN_USER.role,
      DEFAULT_ADMIN_USER.permissions,
      DEFAULT_ADMIN_USER.phone,
      DEFAULT_ADMIN_USER.email,
      DEFAULT_ADMIN_USER.status,
      DEFAULT_ADMIN_USER.createdAt,
    ];
    await updateSheetRange("Users!A1:I1", [USERS_HEADERS]);
    await appendSheetRow("Users", defaultRow);
    rows = [USERS_HEADERS, defaultRow];
  }

  // Ensure header has Permissions
  const header = rows[0] || [];
  const hasPermHeader = header.some((c: any) =>
    String(c || "").toLowerCase().includes("perm")
  );

  if (!hasPermHeader) {
    // Upgrade header in Google Sheets
    await updateSheetRange("Users!A1:I1", [USERS_HEADERS]);
    header[4] = "Permissions";
  }

  // Auto-align and fix any legacy rows where columns were shifted
  let rowsModified = false;
  const validKeys = ALL_PERMISSIONS.map((p) => p.key as string);

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r || !r[0]) continue;

    // Check if row has fewer than 9 columns or column 4 contains a phone/email rather than permissions
    const val4 = String(r[4] || "").trim();
    const isShifted =
      r.length <= 8 ||
      val4.startsWith("01") ||
      val4.startsWith("০১") ||
      val4.includes("@") ||
      (!validKeys.includes(val4) && !val4.includes(",") && val4 !== "all");

    if (isShifted) {
      const u = String(r[0] || "").trim();
      const p = String(r[1] || "").trim();
      const name = String(r[2] || "").trim();
      const role = String(r[3] || "admin").trim().toLowerCase();
      const perms = role === "super_admin" ? "all" : getDefaultPermissions(role).join(",");
      const phone = String(r[4] || "").trim();
      const email = String(r[5] || "").trim();
      const status = String(r[6] || "active").trim();
      const createdAt = String(r[7] || new Date().toISOString().split("T")[0]).trim();

      rows[i] = [u, p, name, role, perms, phone, email, status, createdAt];
      rowsModified = true;
    }
  }

  if (rowsModified) {
    try {
      await updateSheetRange(`Users!A1:I${rows.length}`, [USERS_HEADERS, ...rows.slice(1)]);
    } catch (err) {
      console.error("Failed to auto-align Users tab in Google Sheet:", err);
    }
  }

  const colMap: Record<string, number> = {
    username: 0,
    password: 1,
    name: 2,
    role: 3,
    permissions: 4,
    phone: 5,
    email: 6,
    status: 7,
    createdAt: 8,
  };

  header.forEach((c: any, idx: number) => {
    const s = String(c || "").toLowerCase().trim();
    if (s.includes("user")) colMap.username = idx;
    else if (s.includes("pass")) colMap.password = idx;
    else if (s.includes("name") || s.includes("নাম")) colMap.name = idx;
    else if (s.includes("role") || s.includes("ভূমিকা")) colMap.role = idx;
    else if (s.includes("perm") || s.includes("অনুমতি")) colMap.permissions = idx;
    else if (s.includes("phone") || s.includes("ফোন")) colMap.phone = idx;
    else if (s.includes("email") || s.includes("ইমেইল")) colMap.email = idx;
    else if (s.includes("status") || s.includes("অবস্থা")) colMap.status = idx;
    else if (s.includes("date") || s.includes("তারিখ")) colMap.createdAt = idx;
  });

  return { rows, colMap };
}

// 1. GET: Fetch all users
export async function GET(req: NextRequest) {
  const session = await getAdminSession(req);
  if (!session) {
    return NextResponse.json({ success: false, message: "অননুমোদিত" }, { status: 401 });
  }

  // Check if session has permission to manage or view users
  const userPerms = session.permissions || [];
  const canManage = session.role === "super_admin" || userPerms.includes("manage_users");

  if (!canManage && session.role !== "admin") {
    return NextResponse.json(
      { success: false, message: "আপনার ইউজার তালিকা দেখার অনুমতি নেই।" },
      { status: 403 }
    );
  }

  try {
    const { rows, colMap } = await getOrSeedUsers();
    const users: any[] = [];

    for (let i = 1; i < rows.length; i++) {
      const r = rows[i];
      if (!r || !r[colMap.username]) continue;

      const rawRole = (r[colMap.role] || "admin").toLowerCase().trim() as UserRole;
      const roleConfig = ROLES[rawRole] || ROLES.admin;
      const isLegacy8Col = r.length <= 8;
      const rawPerms = isLegacy8Col ? "" : (colMap.permissions !== -1 ? r[colMap.permissions] : "");
      const normalized = normalizePermissions(rawRole, rawPerms);

      const phoneVal = isLegacy8Col ? r[4] : (colMap.phone !== -1 ? r[colMap.phone] : "");
      const emailVal = isLegacy8Col ? r[5] : (colMap.email !== -1 ? r[colMap.email] : "");
      const statusVal = isLegacy8Col
        ? r[6]
        : (colMap.status !== -1 ? r[colMap.status] : "active");
      const createdAtVal = isLegacy8Col
        ? r[7]
        : (colMap.createdAt !== -1 ? r[colMap.createdAt] : "");

      users.push({
        rowIndex: i + 1,
        username: String(r[colMap.username] || "").trim(),
        name: String(r[colMap.name] || r[colMap.username] || "").trim(),
        role: rawRole,
        roleLabel: roleConfig.label,
        roleBadge: roleConfig.badgeClass,
        permissions: normalized,
        phone: String(phoneVal || "").trim(),
        email: String(emailVal || "").trim(),
        status:
          String(statusVal || "active").toLowerCase().trim() === "inactive"
            ? "inactive"
            : "active",
        createdAt: String(createdAtVal || "").trim(),
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
        defaultPermissions: rc.defaultPermissions,
      })),
      allPermissions: ALL_PERMISSIONS,
    });
  } catch (error: any) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { success: false, message: "ইউজার ডাটা লোড করতে সমস্যা হয়েছে: " + error.message },
      { status: 500 }
    );
  }
}

// 2. POST: Create a new user with granular permissions
export async function POST(req: NextRequest) {
  const session = await getAdminSession(req);
  if (!session) {
    return NextResponse.json({ success: false, message: "অননুমোদিত" }, { status: 401 });
  }

  const userPerms = session.permissions || [];
  if (session.role !== "super_admin" && !userPerms.includes("manage_users")) {
    return NextResponse.json(
      { success: false, message: "শুধুমাত্র অনুমোদিত অ্যাডমিন নতুন ইউজার যোগ করতে পারবেন।" },
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

    // Permissions: array or comma string
    let permsArray = body.permissions;
    if (!Array.isArray(permsArray)) {
      permsArray = getDefaultPermissions(role);
    }
    const permissionsStr = role === "super_admin" ? "all" : permsArray.join(",");

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

    const { rows, colMap } = await getOrSeedUsers();
    const exists = rows
      .slice(1)
      .some((r) => String(r[colMap.username] || "").toLowerCase().trim() === username);

    if (exists) {
      return NextResponse.json(
        { success: false, message: `"${username}" ইউজারনেমটি ইতিমধ্যে বিদ্যমান!` },
        { status: 400 }
      );
    }

    const createdAt = new Date().toISOString().split("T")[0];
    const newRow = [
      username,
      password,
      name,
      role,
      permissionsStr,
      phone,
      email,
      status,
      createdAt,
    ];

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

// 3. PUT: Update an existing user with permissions
export async function PUT(req: NextRequest) {
  const session = await getAdminSession(req);
  if (!session) {
    return NextResponse.json({ success: false, message: "অননুমোদিত" }, { status: 401 });
  }

  const userPerms = session.permissions || [];
  if (session.role !== "super_admin" && !userPerms.includes("manage_users")) {
    return NextResponse.json(
      { success: false, message: "শুধুমাত্র অনুমোদিত অ্যাডমিন ইউজারের তথ্য পরিবর্তন করতে পারবেন।" },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { rowIndex, username, password, name, role, permissions, phone, email, status } = body;

    if (!rowIndex || rowIndex <= 1) {
      return NextResponse.json(
        { success: false, message: "সঠিক রো নম্বর পাওয়া যায়নি।" },
        { status: 400 }
      );
    }

    const { rows, colMap } = await getOrSeedUsers();
    const currentRow = rows[rowIndex - 1];
    if (!currentRow) {
      return NextResponse.json(
        { success: false, message: "ইউজার পাওয়া যায়নি।" },
        { status: 404 }
      );
    }

    const finalPassword =
      password && password.trim().length >= 4 ? password.trim() : currentRow[colMap.password];
    const finalUsername = (username || currentRow[colMap.username]).toLowerCase().trim();
    const finalName = name || currentRow[colMap.name];
    const finalRole = (role || currentRow[colMap.role] || "admin").toLowerCase().trim();
    const finalPhone = phone !== undefined ? phone : currentRow[colMap.phone];
    const finalEmail = email !== undefined ? email : currentRow[colMap.email];
    const finalStatus = (status || currentRow[colMap.status] || "active").toLowerCase().trim();
    const createdAt = currentRow[colMap.createdAt] || new Date().toISOString().split("T")[0];

    // Build permissions string
    let permissionsStr = "";
    if (finalRole === "super_admin") {
      permissionsStr = "all";
    } else if (Array.isArray(permissions)) {
      permissionsStr = permissions.join(",");
    } else if (typeof permissions === "string" && permissions) {
      permissionsStr = permissions;
    } else {
      permissionsStr = currentRow[colMap.permissions] || getDefaultPermissions(finalRole).join(",");
    }

    const safeRole = finalUsername === "admin" ? "super_admin" : finalRole;

    await updateSheetRange(`Users!A${rowIndex}:I${rowIndex}`, [
      [
        finalUsername,
        finalPassword,
        finalName,
        safeRole,
        permissionsStr,
        finalPhone,
        finalEmail,
        finalStatus,
        createdAt,
      ],
    ]);

    return NextResponse.json({
      success: true,
      message: `"${finalName}"-এর তথ্য ও পারমিশন সফলভাবে আপডেট হয়েছে!`,
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

  const userPerms = session.permissions || [];
  if (session.role !== "super_admin" && !userPerms.includes("manage_users")) {
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

    if (session.username.toLowerCase() === username) {
      return NextResponse.json(
        { success: false, message: "আপনি নিজের চলমান লগইন অ্যাকাউন্ট মুছতে পারবেন না!" },
        { status: 400 }
      );
    }

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
