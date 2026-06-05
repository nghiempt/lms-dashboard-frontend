"use client";

/* ============================================================
   Toast system dùng chung toàn app.
   - Bọc <ToastProvider> ở root layout.
   - Dùng `const toast = useToast();` rồi gọi toast.success/error/info.
   - Tự tắt sau 3s, có icon + màu theo loại, slide-in từ phải.
   ============================================================ */

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";

type ToastKind = "success" | "error" | "info";
interface ToastItem {
  id: number;
  kind: ToastKind;
  message: string;
  leaving?: boolean;
}

interface ToastApi {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const DURATION = 3000; // tự tắt sau 3s theo yêu cầu

const ToastIcon = ({ kind }: { kind: ToastKind }) => {
  if (kind === "success")
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <path d="M22 4 12 14.01l-3-3" />
      </svg>
    );
  if (kind === "error")
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <path d="M15 9l-6 6M9 9l6 6" />
      </svg>
    );
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </svg>
  );
};

const ToastContext = createContext<ToastApi | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const seq = useRef(0);

  const remove = useCallback((id: number) => {
    // đánh dấu rời đi để chạy animation trượt ra rồi mới gỡ khỏi DOM
    setItems((list) => list.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
    setTimeout(() => {
      setItems((list) => list.filter((t) => t.id !== id));
    }, 220);
  }, []);

  const push = useCallback(
    (kind: ToastKind, message: string) => {
      if (!message) return;
      const id = ++seq.current;
      setItems((list) => [...list, { id, kind, message }]);
      setTimeout(() => remove(id), DURATION);
    },
    [remove],
  );

  const api = useRef<ToastApi>({
    success: (m) => push("success", m),
    error: (m) => push("error", m),
    info: (m) => push("info", m),
  });
  // giữ closure mới nhất
  api.current = {
    success: (m) => push("success", m),
    error: (m) => push("error", m),
    info: (m) => push("info", m),
  };

  return (
    <ToastContext.Provider value={api.current}>
      {children}
      <div className="toast-wrap" role="region" aria-label="Thông báo">
        {items.map((t) => (
          <div
            key={t.id}
            className={"toast toast-" + t.kind + (t.leaving ? " leaving" : "")}
            role={t.kind === "error" ? "alert" : "status"}
          >
            <span className="toast-ic" aria-hidden="true">
              <ToastIcon kind={t.kind} />
            </span>
            <span className="toast-msg">{t.message}</span>
            <button
              type="button"
              className="toast-x"
              aria-label="Đóng"
              onClick={() => remove(t.id)}
            >
              ✕
            </button>
            <span className="toast-bar" />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/**
 * Lấy API toast. Trả về no-op nếu chưa có provider (an toàn cho test/SSR).
 */
export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (ctx) return ctx;
  return { success: () => {}, error: () => {}, info: () => {} };
}
