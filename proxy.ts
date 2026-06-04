import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE, ROLE_COOKIE } from "@/lib/auth";

/**
 * Bảo vệ route theo vai trò:
 * - Chưa đăng nhập            → mọi trang đẩy về /login
 * - Đã đăng nhập vào /login   → đẩy về khu vực theo vai trò
 * - Học viên vào /admin/*     → đẩy về dashboard học viên (/)
 * - Admin vào khu vực học viên→ đẩy về dashboard admin (/admin)
 */
export function proxy(req: NextRequest) {
  const isAuthed = req.cookies.get(AUTH_COOKIE)?.value === "1";
  const role = req.cookies.get(ROLE_COOKIE)?.value; // "admin" | "student"
  const { pathname } = req.nextUrl;
  const isLoginPage = pathname === "/login";
  const isAdminArea = pathname === "/admin" || pathname.startsWith("/admin/");

  const redirect = (to: string) => {
    const url = req.nextUrl.clone();
    url.pathname = to;
    return NextResponse.redirect(url);
  };

  if (!isAuthed) {
    return isLoginPage ? NextResponse.next() : redirect("/login");
  }

  const home = role === "admin" ? "/admin" : "/";

  if (isLoginPage) return redirect(home);

  // Học viên không được vào khu vực admin.
  if (isAdminArea && role !== "admin") return redirect("/");

  // Admin không dùng khu vực học viên — đẩy về dashboard admin.
  if (!isAdminArea && role === "admin") return redirect("/admin");

  return NextResponse.next();
}

export const config = {
  // Bỏ qua static assets & API; áp dụng cho mọi page còn lại.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|assets|.*\\.).*)"],
};
