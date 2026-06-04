/* ============================================================
   API client — fetch wrapper cho LMS Backend.
   - Tự gắn Authorization: Bearer <access> + x-device-id.
   - Tự refresh khi gặp 401 (xoay vòng token) rồi retry 1 lần.
   - Trả về envelope { success, data, meta, error } của BE.
   ============================================================ */

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

const ACCESS_KEY = "lms_access";
const REFRESH_KEY = "lms_refresh";
const USER_KEY = "auth_user";
const DEVICE_KEY = "lms_device";

/** Cookie để middleware nhận biết đã đăng nhập + role. */
export const AUTH_COOKIE = "auth_token";
export const ROLE_COOKIE = "auth_role";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

export interface ApiEnvelope<T = unknown> {
  success: boolean;
  data: T;
  meta: Record<string, unknown> | null;
  error: { code: string; message: string; details?: unknown } | null;
}

export class ApiError extends Error {
  code: string;
  details?: unknown;
  status: number;
  constructor(message: string, code: string, status: number, details?: unknown) {
    super(message);
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

// ---------------- token & device helpers ----------------
export const tokenStore = {
  getAccess: () =>
    typeof window === "undefined" ? null : localStorage.getItem(ACCESS_KEY),
  getRefresh: () =>
    typeof window === "undefined" ? null : localStorage.getItem(REFRESH_KEY),
  set(access: string, refresh: string) {
    localStorage.setItem(ACCESS_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
  },
  clear() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
  },
  setUser(user: unknown) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  getUser<T>(): T | null {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as T) : null;
  },
};

export function getDeviceId(): string {
  if (typeof window === "undefined") return "ssr";
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id =
      (crypto as Crypto & { randomUUID?: () => string }).randomUUID?.() ??
      "dev-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}

export function getDeviceName(): string {
  if (typeof navigator === "undefined") return "Web";
  const ua = navigator.userAgent;
  const browser = /Edg/.test(ua)
    ? "Edge"
    : /Chrome/.test(ua)
      ? "Chrome"
      : /Safari/.test(ua)
        ? "Safari"
        : /Firefox/.test(ua)
          ? "Firefox"
          : "Trình duyệt";
  const os = /Windows/.test(ua)
    ? "Windows"
    : /Mac OS/.test(ua)
      ? "macOS"
      : /Android/.test(ua)
        ? "Android"
        : /iPhone|iPad/.test(ua)
          ? "iOS"
          : "";
  return os ? `${browser} · ${os}` : browser;
}

export function setAuthCookies(roleKey: string) {
  document.cookie = `${AUTH_COOKIE}=1; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`;
  document.cookie = `${ROLE_COOKIE}=${roleKey}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`;
}
export function clearAuthCookies() {
  document.cookie = `${AUTH_COOKIE}=; path=/; max-age=0; samesite=lax`;
  document.cookie = `${ROLE_COOKIE}=; path=/; max-age=0; samesite=lax`;
}

// ---------------- core request ----------------
let refreshing: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  const refreshToken = tokenStore.getRefresh();
  if (!refreshToken) return false;
  if (!refreshing) {
    refreshing = fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    })
      .then(async (r) => {
        const j = (await r.json().catch(() => null)) as ApiEnvelope | null;
        if (r.ok && j?.success && j.data) {
          const d = j.data as { accessToken: string; refreshToken: string };
          tokenStore.set(d.accessToken, d.refreshToken);
          return true;
        }
        return false;
      })
      .catch(() => false)
      .finally(() => {
        refreshing = null;
      });
  }
  return refreshing;
}

interface RequestOpts {
  method?: string;
  body?: unknown;
  auth?: boolean;
  retry?: boolean;
  query?: Record<string, string | number | boolean | undefined>;
}

export async function apiRequest<T = unknown>(
  path: string,
  opts: RequestOpts = {},
): Promise<ApiEnvelope<T>> {
  const { method = "GET", body, auth = true, retry = true, query } = opts;

  let url = `${API_BASE}${path}`;
  if (query) {
    const qs = Object.entries(query)
      .filter(([, v]) => v !== undefined && v !== "")
      .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
      .join("&");
    if (qs) url += `?${qs}`;
  }

  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = tokenStore.getAccess();
    if (token) headers["Authorization"] = `Bearer ${token}`;
    headers["x-device-id"] = getDeviceId();
  }

  const res = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // 401 -> thử refresh rồi retry 1 lần
  if (res.status === 401 && auth && retry) {
    const ok = await tryRefresh();
    if (ok) return apiRequest<T>(path, { ...opts, retry: false });
    tokenStore.clear();
    clearAuthCookies();
  }

  const json = (await res.json().catch(() => null)) as ApiEnvelope<T> | null;
  if (!json) {
    throw new ApiError("Không nhận được phản hồi hợp lệ từ máy chủ.", "NETWORK", res.status);
  }
  if (!json.success) {
    throw new ApiError(
      json.error?.message ?? "Đã có lỗi xảy ra.",
      json.error?.code ?? "ERROR",
      res.status,
      json.error?.details,
    );
  }
  return json;
}

/** Helpers gọn: trả thẳng data. */
export const api = {
  get: <T>(path: string, query?: RequestOpts["query"]) =>
    apiRequest<T>(path, { method: "GET", query }).then((r) => r.data),
  getFull: <T>(path: string, query?: RequestOpts["query"]) =>
    apiRequest<T>(path, { method: "GET", query }),
  post: <T>(path: string, body?: unknown, auth = true) =>
    apiRequest<T>(path, { method: "POST", body, auth }).then((r) => r.data),
  patch: <T>(path: string, body?: unknown) =>
    apiRequest<T>(path, { method: "PATCH", body }).then((r) => r.data),
  del: <T>(path: string) =>
    apiRequest<T>(path, { method: "DELETE" }).then((r) => r.data),
};
