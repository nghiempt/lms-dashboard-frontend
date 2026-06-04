/* ============================================================
   Auth thật — gọi LMS Backend qua lib/api.
   Giữ các export cũ (AuthUser, HOME_BY_ROLE, getCurrentUser, clearSession,
   setSession, AUTH_COOKIE...) để các trang/shell dùng lại không phải sửa nhiều.
   ============================================================ */

import {
  api,
  apiRequest,
  clearAuthCookies,
  getDeviceId,
  getDeviceName,
  setAuthCookies,
  tokenStore,
} from "./api";

export const AUTH_COOKIE = "auth_token";
export const ROLE_COOKIE = "auth_role";
export const AUTH_MAX_AGE = 60 * 60 * 24 * 7;

export type Role = "admin" | "student";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: string; // nhãn hiển thị
  roleKey: Role; // khoá vai trò để định tuyến
  initials: string;
  avatarUrl?: string | null;
};

/** Trang chủ của từng vai trò sau khi đăng nhập. */
export const HOME_BY_ROLE: Record<Role, string> = {
  admin: "/admin",
  student: "/",
};

interface BackendUser {
  id: string;
  email: string;
  fullName: string;
  role: "ADMIN" | "STUDENT";
  avatarUrl?: string | null;
}
interface AuthResult {
  user: BackendUser;
  accessToken: string;
  refreshToken: string;
}

const DEFAULT_USER: AuthUser = {
  id: "",
  name: "Học viên",
  email: "",
  role: "Học viên",
  roleKey: "student",
  initials: "HV",
};

function makeInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function mapUser(be: BackendUser): AuthUser {
  const roleKey: Role = be.role === "ADMIN" ? "admin" : "student";
  return {
    id: be.id,
    name: be.fullName,
    email: be.email,
    role: roleKey === "admin" ? "Quản trị viên" : "Học viên",
    roleKey,
    initials: makeInitials(be.fullName),
    avatarUrl: be.avatarUrl ?? null,
  };
}

/** Ghi cookie + lưu user (client side). */
export function setSession(user: AuthUser) {
  setAuthCookies(user.roleKey);
  tokenStore.setUser(user);
}

function persist(result: AuthResult): AuthUser {
  tokenStore.set(result.accessToken, result.refreshToken);
  const user = mapUser(result.user);
  setSession(user);
  return user;
}

const device = () => ({ deviceId: getDeviceId(), deviceName: getDeviceName() });

// ---------------- public API ----------------
export async function login(email: string, password: string): Promise<AuthUser> {
  const data = await api.post<AuthResult>(
    "/auth/login",
    { email, password, ...device() },
    false,
  );
  return persist(data);
}

export async function register(
  fullName: string,
  email: string,
  password: string,
): Promise<AuthUser> {
  const data = await api.post<AuthResult>(
    "/auth/register",
    { fullName, email, password, ...device() },
    false,
  );
  return persist(data);
}

export async function googleLogin(idToken: string): Promise<AuthUser> {
  const data = await api.post<AuthResult>(
    "/auth/google",
    { idToken, ...device() },
    false,
  );
  return persist(data);
}

export async function forgotPassword(email: string): Promise<string> {
  const data = await api.post<{ message: string }>(
    "/auth/forgot-password",
    { email },
    false,
  );
  return data.message;
}

export async function logout(): Promise<void> {
  const refreshToken = tokenStore.getRefresh();
  if (refreshToken) {
    await apiRequest("/auth/logout", {
      method: "POST",
      body: { refreshToken },
    }).catch(() => undefined);
  }
  clearSession();
}

export function clearSession(): void {
  tokenStore.clear();
  clearAuthCookies();
}

export function getCurrentUser(): AuthUser {
  return tokenStore.getUser<AuthUser>() ?? DEFAULT_USER;
}

export function isAuthed(): boolean {
  return !!tokenStore.getAccess();
}

/** Đồng bộ lại user từ /auth/me. */
export async function refreshCurrentUser(): Promise<AuthUser> {
  const be = await api.get<BackendUser>("/auth/me");
  const user = mapUser(be);
  setSession(user);
  return user;
}
