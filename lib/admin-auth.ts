import crypto from "crypto";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const SECRET = process.env.ADMIN_SESSION_SECRET || "rhkl-super-secret-admin-key-2026";
const COOKIE_NAME = "rhkl_admin_token";

export interface AdminSession {
  username: string;
  name: string;
  role: string;
  exp: number;
}

export function createToken(username: string, name: string): string {
  const payload: AdminSession = {
    username,
    name,
    role: "super_admin",
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  const str = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", SECRET)
    .update(str)
    .digest("base64url");

  return `${str}.${signature}`;
}

export function verifyToken(token: string): AdminSession | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;

    const [payloadStr, signature] = parts;
    const expectedSig = crypto
      .createHmac("sha256", SECRET)
      .update(payloadStr)
      .digest("base64url");

    if (signature !== expectedSig) return null;

    const payload: AdminSession = JSON.parse(
      Buffer.from(payloadStr, "base64url").toString("utf-8")
    );

    if (Date.now() > payload.exp) return null;

    return payload;
  } catch {
    return null;
  }
}

export async function getAdminSession(request?: NextRequest): Promise<AdminSession | null> {
  let token: string | undefined;

  if (request) {
    token = request.cookies.get(COOKIE_NAME)?.value;
  } else {
    const cookieStore = await cookies();
    token = cookieStore.get(COOKIE_NAME)?.value;
  }

  if (!token) return null;
  return verifyToken(token);
}

export { COOKIE_NAME };
