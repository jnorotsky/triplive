import { NextRequest } from "next/server";

const COOKIE_NAME = "triplive_auth";

export function isAuthenticated(request: NextRequest): boolean {
  const cookie = request.cookies.get(COOKIE_NAME);
  if (!cookie) return false;
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return false;
  return cookie.value === password;
}

export function setAuthCookie(response: Response, password: string): void {
  response.headers.append(
    "Set-Cookie",
    `${COOKIE_NAME}=${password}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}`
  );
}

export function clearAuthCookie(response: Response): void {
  response.headers.append(
    "Set-Cookie",
    `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
  );
}

export const COOKIE_NAME_EXPORT = COOKIE_NAME;
