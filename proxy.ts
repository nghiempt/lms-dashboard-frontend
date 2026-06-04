import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE } from "@/lib/auth";

/**
 * Bảo vệ route:
 * - Chưa đăng nhập  → mọi trang đều đẩy về /login
 * - Đã đăng nhập    → vào /login sẽ đẩy về / (dashboard)
 */
export function proxy(req: NextRequest) {
  const isAuthed = req.cookies.get(AUTH_COOKIE)?.value === "1";
  const { pathname } = req.nextUrl;
  const isLoginPage = pathname === "/login";

  if (!isAuthed && !isLoginPage) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (isAuthed && isLoginPage) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Bỏ qua static assets & API; áp dụng cho mọi page còn lại.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|assets|.*\\.).*)"],
};
