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
  badge: string;
  badgeClass: string;
  description: string;
  defaultPermissions: PermissionKey[];
}

export const ROLES: Record<UserRole, RoleConfig> = {
  super_admin: {
    id: "super_admin",
    label: "👑 সুপার অ্যাডমিন",
    badge: "গোল্ডেন",
    badgeClass: "bg-amber-100 text-amber-900 border-amber-300",
    description: "সম্পূর্ণ অ্যাক্সেস: ইউজার তৈরি/ডিলিট, পাসওয়ার্ড রিসেট, ওয়েবসাইট সেটিংস এবং সমস্ত ডাটা কন্ট্রোল।",
    defaultPermissions: ALL_PERMISSIONS.map((p) => p.key),
  },
  admin: {
    id: "admin",
    label: "🛡️ অ্যাডমিন",
    badge: "গ্রিন",
    badgeClass: "bg-emerald-100 text-emerald-900 border-emerald-300",
    description: "আবেদনকারী, নোটিশ, বাণী ও কমিটি পরিচালনা (সেটিংস ও ইউজার তৈরি ছাড়া)।",
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
    label: "🎓 পরীক্ষা নিয়ন্ত্রক",
    badge: "পার্পল",
    badgeClass: "bg-purple-100 text-purple-900 border-purple-300",
    description: "শুধুমাত্র আবেদনপত্র যাচাইকরণ, রোল নম্বর বণ্টন ও প্রবেশপত্র অনুমোদন।",
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
    label: "👤 ডাটা এন্ট্রি অপারেটর",
    badge: "ব্লু",
    badgeClass: "bg-blue-100 text-blue-900 border-blue-300",
    description: "শুধুমাত্র আবেদনকারী তালিকা দেখা এবং প্রবেশপত্র প্রিন্ট করা (নো এডিট)।",
    defaultPermissions: ["view_submissions"],
  },
};

export function getDefaultPermissions(role?: string): PermissionKey[] {
  const r = (role || "").toLowerCase().trim() as UserRole;
  return ROLES[r]?.defaultPermissions || ROLES.admin.defaultPermissions;
}

const BENGALI_OR_ALIAS_TO_KEY: Record<string, PermissionKey> = {
  // English keys
  manage_users: "manage_users",
  manage_settings: "manage_settings",
  view_submissions: "view_submissions",
  edit_submissions: "edit_submissions",
  approve_admit: "approve_admit",
  delete_submissions: "delete_submissions",
  manage_controllers: "manage_controllers",
  export_data: "export_data",
  manage_notices: "manage_notices",
  manage_messages: "manage_messages",
  manage_committee: "manage_committee",
  manage_pages: "manage_pages",

  // Bengali aliases
  "ইউজার": "manage_users",
  "ব্যবহারকারী": "manage_users",
  "ইউজার তৈরি": "manage_users",
  "সেটিংস": "manage_settings",
  "ওয়েবসাইট সেটিংস": "manage_settings",
  "আবেদন": "view_submissions",
  "আবেদনকারী": "view_submissions",
  "আবেদনপত্র": "view_submissions",
  "তালিকা": "view_submissions",
  "এডমিট": "approve_admit",
  "প্রবেশপত্র": "approve_admit",
  "রোল": "approve_admit",
  "অনুমোদন": "approve_admit",
  "সংশোধন": "edit_submissions",
  "এডিট": "edit_submissions",
  "ডিলিট": "delete_submissions",
  "বাতিল": "delete_submissions",
  "নিয়ন্ত্রক": "manage_controllers",
  "পরীক্ষা নিয়ন্ত্রক": "manage_controllers",
  "স্বাক্ষর": "manage_controllers",
  "এক্সপোর্ট": "export_data",
  "ডাউনলোড": "export_data",
  "নোটিশ": "manage_notices",
  "বাণী": "manage_messages",
  "গুণীজন": "manage_messages",
  "কমিটি": "manage_committee",
  "পরিচালনা": "manage_committee",
  "পেজ": "manage_pages",
  "মেনু": "manage_pages",
};

/**
 * Normalizes permissions from a comma-separated string, JSON, or falls back to role defaults.
 * Dynamic: Whatever is explicitly present becomes active; whatever is omitted is revoked.
 */
export function normalizePermissions(
  role: string,
  rawPerms?: string | string[]
): PermissionKey[] {
  const validKeys = ALL_PERMISSIONS.map((p) => p.key as string);
  const normalizedRole = (role || "admin").toLowerCase().trim() as UserRole;

  // 1. If rawPerms is undefined or null, fallback to role defaults
  if (rawPerms === undefined || rawPerms === null) {
    return getDefaultPermissions(normalizedRole);
  }

  // 2. If rawPerms is a string
  if (typeof rawPerms === "string") {
    const trimmed = rawPerms.trim().toLowerCase();
    if (!trimmed) {
      return getDefaultPermissions(normalizedRole);
    }

    if (trimmed === "all" || trimmed === "*" || trimmed === "সব" || trimmed === "সম্পূর্ণ") {
      return ALL_PERMISSIONS.map((p) => p.key);
    }

    if (trimmed === "none" || trimmed === "null" || trimmed === "বাদ" || trimmed === "নিষ্ক্রিয়") {
      return [];
    }

    // Role shorthand: if someone writes "controller", "admin", "operator"
    if (trimmed === "controller") return ROLES.controller.defaultPermissions;
    if (trimmed === "admin") return ROLES.admin.defaultPermissions;
    if (trimmed === "operator") return ROLES.operator.defaultPermissions;
    if (trimmed === "super_admin") return ROLES.super_admin.defaultPermissions;

    try {
      if (trimmed.startsWith("[")) {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return normalizePermissions(role, parsed);
        }
      }
    } catch (_) {}

    const tokens = trimmed.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
    const resultSet = new Set<PermissionKey>();

    for (const token of tokens) {
      if (validKeys.includes(token)) {
        resultSet.add(token as PermissionKey);
      } else {
        // Match Bengali alias
        for (const [alias, key] of Object.entries(BENGALI_OR_ALIAS_TO_KEY)) {
          if (token === alias || token.includes(alias)) {
            resultSet.add(key);
          }
        }
      }
    }

    if (resultSet.size > 0) {
      return Array.from(resultSet);
    }

    return getDefaultPermissions(normalizedRole);
  }

  // 3. If rawPerms is an array
  if (Array.isArray(rawPerms)) {
    if (rawPerms.length === 0) {
      return getDefaultPermissions(normalizedRole);
    }
    const resultSet = new Set<PermissionKey>();
    for (const item of rawPerms) {
      const token = String(item || "").trim().toLowerCase();
      if (validKeys.includes(token)) {
        resultSet.add(token as PermissionKey);
      } else if (token === "all" || token === "*") {
        return ALL_PERMISSIONS.map((p) => p.key);
      } else {
        for (const [alias, key] of Object.entries(BENGALI_OR_ALIAS_TO_KEY)) {
          if (token === alias || token.includes(alias)) {
            resultSet.add(key);
          }
        }
      }
    }
    return Array.from(resultSet);
  }

  return getDefaultPermissions(normalizedRole);
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
