export type UserRole = "super_admin" | "admin" | "controller" | "operator";

export interface RoleConfig {
  id: UserRole;
  label: string;
  badgeClass: string;
  description: string;
  permissions: {
    canManageUsers: boolean;       // Users & RBAC
    canManageSettings: boolean;    // Website Settings
    canManageControllers: boolean; // Examination Controllers
    canManageContent: boolean;     // Notices, Messages, Committee, Pages
    canManageSubmissions: boolean; // View and edit students / admit cards
    canApproveAdmit: boolean;      // Roll assign and approve
    canDeleteSubmissions: boolean; // Delete student registrations
    canExportData: boolean;        // Export excel/csv
  };
}

export const ROLES: Record<UserRole, RoleConfig> = {
  super_admin: {
    id: "super_admin",
    label: "সুপার অ্যাডমিন",
    badgeClass: "bg-amber-100 text-amber-900 border-amber-300",
    description: "সকল সেটিংস, ইউজার ও ডাটার পূর্ণ নিয়ন্ত্রণ ও অ্যাক্সেস",
    permissions: {
      canManageUsers: true,
      canManageSettings: true,
      canManageControllers: true,
      canManageContent: true,
      canManageSubmissions: true,
      canApproveAdmit: true,
      canDeleteSubmissions: true,
      canExportData: true,
    },
  },
  admin: {
    id: "admin",
    label: "অ্যাডমিন",
    badgeClass: "bg-emerald-100 text-emerald-900 border-emerald-300",
    description: "আবেদনকারী, প্রবেশপত্র ও কনটেন্ট পরিচালনা (সেটিংস ও ইউজার ছাড়া)",
    permissions: {
      canManageUsers: false,
      canManageSettings: false,
      canManageControllers: true,
      canManageContent: true,
      canManageSubmissions: true,
      canApproveAdmit: true,
      canDeleteSubmissions: false,
      canExportData: true,
    },
  },
  controller: {
    id: "controller",
    label: "পরীক্ষা নিয়ন্ত্রক",
    badgeClass: "bg-purple-100 text-purple-900 border-purple-300",
    description: "আবেদন যাচাইকরণ, রোল নম্বর বণ্টন ও প্রবেশপত্র অনুমোদন",
    permissions: {
      canManageUsers: false,
      canManageSettings: false,
      canManageControllers: false,
      canManageContent: false,
      canManageSubmissions: true,
      canApproveAdmit: true,
      canDeleteSubmissions: false,
      canExportData: true,
    },
  },
  operator: {
    id: "operator",
    label: "ডাটা এন্ট্রি / অপারেটর",
    badgeClass: "bg-blue-100 text-blue-900 border-blue-300",
    description: "শুধুমাত্র আবেদনকারী ও প্রবেশপত্র দেখা এবং প্রিন্ট করা",
    permissions: {
      canManageUsers: false,
      canManageSettings: false,
      canManageControllers: false,
      canManageContent: false,
      canManageSubmissions: true,
      canApproveAdmit: false,
      canDeleteSubmissions: false,
      canExportData: false,
    },
  },
};

export function getRoleConfig(role?: string): RoleConfig {
  const r = (role || "").toLowerCase().trim() as UserRole;
  return ROLES[r] || ROLES.admin;
}

export function hasPermission(
  role: string | undefined,
  permission: keyof RoleConfig["permissions"]
): boolean {
  const config = getRoleConfig(role);
  return !!config.permissions[permission];
}
