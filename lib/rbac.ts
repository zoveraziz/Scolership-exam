export type UserRole = "super_admin" | "admin" | "controller" | "operator";

export type PermissionKey =
  | "manage_users"
  | "manage_settings"
  | "view_submissions"
  | "edit_submissions"
  | "approve_admit"
  | "delete_submissions"
  | "manage_controllers"
  | "manage_notices"
  | "manage_messages"
  | "manage_committee"
  | "manage_pages"
  | "export_data";

export interface PermissionDefinition {
  key: PermissionKey;
  label: string;
  category: "প্রশাসন ও নিরাপত্তা" | "পরীক্ষা ও আবেদন" | "ওয়েবসাইট কনটেন্ট";
  description: string;
}

export const ALL_PERMISSIONS: PermissionDefinition[] = [
  // প্রশাসন ও নিরাপত্তা
  {
    key: "manage_users",
    label: "ব্যবহারকারী ও RBAC নিয়ন্ত্রণ",
    category: "প্রশাসন ও নিরাপত্তা",
    description: "নতুন ইউজার তৈরি, রোল ও পারমিশন পরিবর্তন, পাসওয়ার্ড রিসেট",
  },
  {
    key: "manage_settings",
    label: "ওয়েবসাইট সেটিংস ও কনফিগারেশন",
    category: "প্রশাসন ও নিরাপত্তা",
    description: "বিকাশ নম্বর, ফি, হেল্পলাইন, মেনু টাইটেল ও হেডার/ফুটার সেটিংস",
  },
  // পরীক্ষা ও আবেদন
  {
    key: "view_submissions",
    label: "আবেদনকারী ও প্রবেশপত্র তালিকা দেখা",
    category: "পরীক্ষা ও আবেদন",
    description: "আবেদনকারীদের নাম, রোল, ছবি ও পেমেন্ট রসিদ দেখা",
  },
  {
    key: "approve_admit",
    label: "রোল বরাদ্দ ও প্রবেশপত্র অনুমোদন",
    category: "পরীক্ষা ও আবেদন",
    description: "রোল নম্বর ও কেন্দ্র বরাদ্দ করে এডমিট কার্ড অনুমোদন",
  },
  {
    key: "edit_submissions",
    label: "শিক্ষার্থীর তথ্য সংশোধন",
    category: "পরীক্ষা ও আবেদন",
    description: "নাম, শ্রেণি, ফোন, জন্মতারিখ ও অন্যান্য তথ্য এডিট",
  },
  {
    key: "delete_submissions",
    label: "আবেদন বাতিল বা মুছে ফেলা",
    category: "পরীক্ষা ও আবেদন",
    description: "ভুল বা ডুপ্লিকেট আবেদনপত্র স্থায়ীভাবে মুছে ফেলা",
  },
  {
    key: "manage_controllers",
    label: "পরীক্ষা নিয়ন্ত্রক ও স্বাক্ষর পরিচালনা",
    category: "পরীক্ষা ও আবেদন",
    description: "নিয়ন্ত্রকদের তথ্য, রোল রেঞ্জ ও স্বাক্ষর পরিবর্তন",
  },
  {
    key: "export_data",
    label: "ডাটা ও রিপোর্ট এক্সপোর্ট",
    category: "পরীক্ষা ও আবেদন",
    description: "শিক্ষার্থীদের তালিকা এক্সেল বা সিএসভিতে ডাউনলোড",
  },
  // ওয়েবসাইট কনটেন্ট
  {
    key: "manage_notices",
    label: "নোটিশ বোর্ড পরিচালনা",
    category: "ওয়েবসাইট কনটেন্ট",
    description: "নতুন নোটিশ প্রকাশ, ফাইল যুক্ত ও নোটিশ ডিলিট",
  },
  {
    key: "manage_messages",
    label: "গুণীজন বাণী পরিচালনা",
    category: "ওয়েবসাইট কনটেন্ট",
    description: "উপদেষ্টা ও বিশিষ্ট ব্যক্তিবর্গের বাণী ও ছবি আপডেট",
  },
  {
    key: "manage_committee",
    label: "পরিচালনা কমিটি পরিচালনা",
    category: "ওয়েবসাইট কনটেন্ট",
    description: "কমিটির সদস্যদের পদবি ও ছবি আপডেট",
  },
  {
    key: "manage_pages",
    label: "পেজ ও ড্রপডাউন মেনু বিল্ডার",
    category: "ওয়েবসাইট কনটেন্ট",
    description: "কাস্টম পেজ তৈরি ও হেডার ড্রপডাউন মেনু কনফিগার",
  },
];

export interface RoleConfig {
  id: UserRole;
  label: string;
  badgeClass: string;
  description: string;
  defaultPermissions: PermissionKey[];
}

export const ROLES: Record<UserRole, RoleConfig> = {
  super_admin: {
    id: "super_admin",
    label: "সুপার অ্যাডমিন",
    badgeClass: "bg-amber-100 text-amber-900 border-amber-300",
    description: "সকল সেটিংস, ইউজার ও ডাটার পূর্ণ নিয়ন্ত্রণ ও অ্যাক্সেস",
    defaultPermissions: ALL_PERMISSIONS.map((p) => p.key),
  },
  admin: {
    id: "admin",
    label: "অ্যাডমিন",
    badgeClass: "bg-emerald-100 text-emerald-900 border-emerald-300",
    description: "আবেদনকারী, প্রবেশপত্র ও কনটেন্ট পরিচালনা (সেটিংস ও ইউজার ছাড়া)",
    defaultPermissions: [
      "view_submissions",
      "edit_submissions",
      "approve_admit",
      "manage_controllers",
      "manage_notices",
      "manage_messages",
      "manage_committee",
      "manage_pages",
      "export_data",
    ],
  },
  controller: {
    id: "controller",
    label: "পরীক্ষা নিয়ন্ত্রক",
    badgeClass: "bg-purple-100 text-purple-900 border-purple-300",
    description: "আবেদন যাচাইকরণ, রোল নম্বর বণ্টন ও প্রবেশপত্র অনুমোদন",
    defaultPermissions: [
      "view_submissions",
      "approve_admit",
      "edit_submissions",
      "manage_controllers",
      "export_data",
    ],
  },
  operator: {
    id: "operator",
    label: "ডাটা এন্ট্রি / অপারেটর",
    badgeClass: "bg-blue-100 text-blue-900 border-blue-300",
    description: "শুধুমাত্র আবেদনকারী ও প্রবেশপত্র দেখা এবং প্রিন্ট করা",
    defaultPermissions: ["view_submissions"],
  },
};

export function getDefaultPermissions(role?: string): PermissionKey[] {
  const r = (role || "").toLowerCase().trim() as UserRole;
  return ROLES[r]?.defaultPermissions || ROLES.admin.defaultPermissions;
}

/**
 * Normalizes permissions from a comma-separated string, JSON, or falls back to role defaults.
 */
export function normalizePermissions(
  role: string,
  rawPerms?: string | string[]
): PermissionKey[] {
  if (role === "super_admin") {
    return ALL_PERMISSIONS.map((p) => p.key);
  }

  const validKeys = ALL_PERMISSIONS.map((p) => p.key as string);

  if (Array.isArray(rawPerms) && rawPerms.length > 0) {
    const filtered = (rawPerms as string[]).filter((k) => validKeys.includes(k)) as PermissionKey[];
    if (filtered.length > 0) return filtered;
  }

  if (typeof rawPerms === "string" && rawPerms.trim()) {
    const trimmed = rawPerms.trim();
    if (trimmed.toLowerCase() === "all" || trimmed.toLowerCase() === "*") {
      return ALL_PERMISSIONS.map((p) => p.key);
    }
    try {
      if (trimmed.startsWith("[")) {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const filtered = parsed.filter((k: any) => validKeys.includes(String(k))) as PermissionKey[];
          if (filtered.length > 0) return filtered;
        }
      }
    } catch (_) {}

    const list = trimmed
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter((s) => validKeys.includes(s)) as PermissionKey[];

    if (list.length > 0) return list;
  }

  return getDefaultPermissions(role);
}

export function permissionsToMap(permissions: PermissionKey[]): Record<string, boolean> {
  const map: Record<string, boolean> = {};
  ALL_PERMISSIONS.forEach((p) => {
    map[p.key] = permissions.includes(p.key);
  });
  return map;
}

export function getRoleConfig(role?: string): RoleConfig {
  const r = (role || "").toLowerCase().trim() as UserRole;
  return ROLES[r] || ROLES.admin;
}
