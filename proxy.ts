import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE, ROLE_COOKIE } from "@/lib/auth";

/**
 * Bảo vệ route + phân quyền theo vai trò:
 * - Chưa đăng nhập → mọi trang (trừ trang auth công khai) đẩy về /login.
 * - Đã đăng nhập vào /login → đẩy về trang chủ theo vai trò.
 * - Học viên cố vào /admin → đẩy về /.
 * - Admin đứng ở khu vực học viên → đẩy về /admin.
 */
const PUBLIC_PATHS = ["/login", "/verify-email", "/reset-password", "/forgot-password"];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isAuthed = req.cookies.get(AUTH_COOKIE)?.value === "1";
  const role = req.cookies.get(ROLE_COOKIE)?.value; // "admin" | "student"
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  const home = role === "admin" ? "/admin" : "/";

  if (!isAuthed) {
    if (isPublic) return NextResponse.next();
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // đã đăng nhập mà vào trang auth → về trang chủ theo vai trò
  if (isPublic) {
    const url = req.nextUrl.clone();
    url.pathname = home;
    return NextResponse.redirect(url);
  }

  const inAdminArea = pathname === "/admin" || pathname.startsWith("/admin/");
  if (inAdminArea && role !== "admin") {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }
  if (!inAdminArea && role === "admin") {
    const url = req.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // bỏ qua static assets & file; áp dụng cho mọi page còn lại
  matcher: ["/((?!_next/static|_next/image|favicon.ico|assets|.*\\.).*)"],
};
