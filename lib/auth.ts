/* ============================================================
   Fake auth — tạm thời dùng cookie để middleware redirect được.
   Hỗ trợ 2 vai trò: admin (quản trị) & student (học viên), mỗi vai
   trò vào một khu vực UI khác nhau.
   Khi ráp API thật chỉ cần thay verifyCredentials() và thay token
   "admin"/"student" bằng JWT/session token trả về từ server.
   ============================================================ */

export const AUTH_COOKIE = "auth_token";
export const ROLE_COOKIE = "auth_role";
export const AUTH_MAX_AGE = 60 * 60 * 24 * 7; // 7 ngày

export type Role = "admin" | "student";

export type AuthUser = {
  name: string;
  email: string;
  role: string; // nhãn hiển thị (vd: "Quản trị viên", "Học viên")
  roleKey: Role; // khoá vai trò dùng để định tuyến
  initials: string; // chữ cái hiển thị trên avatar
};

type FakeAccount = AuthUser & { password: string };

/** 2 tài khoản fake để đăng nhập tạm. */
const FAKE_ACCOUNTS: FakeAccount[] = [
  {
    email: "admin@admin.com",
    password: "admin",
    name: "Danmotion",
    role: "Quản trị viên",
    roleKey: "admin",
    initials: "DM",
  },
  {
    email: "student@student.com",
    password: "student",
    name: "Tuấn Kiệt",
    role: "Học viên",
    roleKey: "student",
    initials: "TK",
  },
];

/** Trang chủ của từng vai trò sau khi đăng nhập. */
export const HOME_BY_ROLE: Record<Role, string> = {
  admin: "/admin",
  student: "/",
};

const DEFAULT_USER: AuthUser = {
  name: "Tuấn Kiệt",
  email: "student@student.com",
  role: "Học viên",
  roleKey: "student",
  initials: "TK",
};

/** Kiểm tra thông tin đăng nhập (fake). Trả về user nếu hợp lệ. */
export function verifyCredentials(
  email: string,
  password: string
): AuthUser | null {
  const acc = FAKE_ACCOUNTS.find(
    (a) =>
      a.email === email.trim().toLowerCase() && password === a.password
  );
  if (!acc) return null;
  const { password: _pw, ...user } = acc;
  return user;
}

/** Ghi cookie + lưu user (client side). */
export function setSession(user: AuthUser) {
  document.cookie = `${AUTH_COOKIE}=1; path=/; max-age=${AUTH_MAX_AGE}; samesite=lax`;
  document.cookie = `${ROLE_COOKIE}=${user.roleKey}; path=/; max-age=${AUTH_MAX_AGE}; samesite=lax`;
  try {
    localStorage.setItem("auth_user", JSON.stringify(user));
  } catch {
    /* ignore */
  }
}

/** Xoá cookie + user (client side). */
export function clearSession() {
  document.cookie = `${AUTH_COOKIE}=; path=/; max-age=0; samesite=lax`;
  document.cookie = `${ROLE_COOKIE}=; path=/; max-age=0; samesite=lax`;
  try {
    localStorage.removeItem("auth_user");
  } catch {
    /* ignore */
  }
}

/** Lấy user đang đăng nhập (client side), fallback về user mặc định. */
export function getCurrentUser(): AuthUser {
  if (typeof window === "undefined") return DEFAULT_USER;
  try {
    const raw = localStorage.getItem("auth_user");
    if (raw) {
      const u = JSON.parse(raw) as Partial<AuthUser>;
      // tương thích ngược dữ liệu cũ chưa có roleKey/initials
      return {
        name: u.name ?? DEFAULT_USER.name,
        email: u.email ?? DEFAULT_USER.email,
        role: u.role ?? DEFAULT_USER.role,
        roleKey: (u.roleKey as Role) ?? "student",
        initials:
          u.initials ??
          (u.name ?? DEFAULT_USER.name)
            .split(" ")
            .map((w) => w[0])
            .slice(-2)
            .join("")
            .toUpperCase(),
      };
    }
  } catch {
    /* ignore */
  }
  return DEFAULT_USER;
}
