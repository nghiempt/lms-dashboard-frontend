/* ============================================================
   Fake auth — tạm thời dùng cookie để middleware redirect được.
   Khi ráp API thật chỉ cần thay phần verifyCredentials() và
   thay token "1" bằng JWT/session token trả về từ server.
   ============================================================ */

export const AUTH_COOKIE = "auth_token";
export const AUTH_MAX_AGE = 60 * 60 * 24 * 7; // 7 ngày

/** Tài khoản admin fake để đăng nhập tạm. */
const FAKE_ACCOUNT = {
  email: "admin@admin.com",
  password: "admin",
};

export type AuthUser = {
  name: string;
  email: string;
  role: string;
};

const FAKE_USER: AuthUser = {
  name: "Tuấn Kiệt",
  email: "admin@admin.com",
  role: "Học viên",
};

/** Kiểm tra thông tin đăng nhập (fake). Trả về user nếu hợp lệ. */
export function verifyCredentials(
  email: string,
  password: string
): AuthUser | null {
  if (
    email.trim().toLowerCase() === FAKE_ACCOUNT.email &&
    password === FAKE_ACCOUNT.password
  ) {
    return FAKE_USER;
  }
  return null;
}

/** Ghi cookie + lưu user (client side). */
export function setSession(user: AuthUser) {
  document.cookie = `${AUTH_COOKIE}=1; path=/; max-age=${AUTH_MAX_AGE}; samesite=lax`;
  try {
    localStorage.setItem("auth_user", JSON.stringify(user));
  } catch {
    /* ignore */
  }
}

/** Xoá cookie + user (client side). */
export function clearSession() {
  document.cookie = `${AUTH_COOKIE}=; path=/; max-age=0; samesite=lax`;
  try {
    localStorage.removeItem("auth_user");
  } catch {
    /* ignore */
  }
}

/** Lấy user đang đăng nhập (client side), fallback về user mặc định. */
export function getCurrentUser(): AuthUser {
  if (typeof window === "undefined") return FAKE_USER;
  try {
    const raw = localStorage.getItem("auth_user");
    if (raw) return JSON.parse(raw) as AuthUser;
  } catch {
    /* ignore */
  }
  return FAKE_USER;
}
