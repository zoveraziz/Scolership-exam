import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { ROLES, UserRole, normalizePermissions, permissionsToMap } from "@/lib/rbac";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getAdminSession(req);

  if (!session) {
    return NextResponse.json(
      { success: false, authenticated: false, message: "অননুমোদিত এক্সেস" },
      { status: 401 }
    );
  }

  const role = (session.role || "admin").toLowerCase().trim() as UserRole;
  const roleConfig = ROLES[role] || ROLES.admin;
  const permsList = normalizePermissions(role, session.permissions);
  const permsMap = permissionsToMap(permsList);

  return NextResponse.json({
    success: true,
    authenticated: true,
    admin: {
      username: session.username,
      name: session.name,
      role,
      roleLabel: roleConfig.label,
      roleBadge: roleConfig.badgeClass,
      permissions: permsList,
      permissionsMap: permsMap,
    },
  });
}
