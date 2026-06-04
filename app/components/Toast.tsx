"use client";

/* ============================================================
   Toast system dùng chung toàn app.
   - Bọc <ToastProvider> ở root layout.
   - Dùng `const toast = useToast();` rồi gọi toast.success/error/info.
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
}

interface ToastApi {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const seq = useRef(0);

  const remove = useCallback((id: number) => {
    setItems((list) => list.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (kind: ToastKind, message: string) => {
      if (!message) return;
      const id = ++seq.current;
      setItems((list) => [...list, { id, kind, message }]);
      setTimeout(() => remove(id), 4000);
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
          <div key={t.id} className={"toast toast-" + t.kind} role="status">
            <span className="toast-msg">{t.message}</span>
            <button
              type="button"
              className="toast-x"
              aria-label="Đóng"
              onClick={() => remove(t.id)}
            >
              ✕
            </button>
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
