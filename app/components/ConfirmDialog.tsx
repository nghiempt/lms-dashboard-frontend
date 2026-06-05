"use client";

/* ============================================================
   Hộp thoại xác nhận dùng chung cho các hành động bất khả hồi
   (xóa, hoàn tiền…). Dùng chung class .modal-ov/.modal sẵn có.
   ============================================================ */

import { useEffect } from "react";
import { Spinner } from "./Loaders";

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Kiểu nút xác nhận: "danger" (mặc định) hoặc "primary". */
  tone?: "danger" | "primary";
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Xác nhận",
  cancelLabel = "Hủy",
  tone = "danger",
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  return (
    <div
      className={"modal-ov" + (open ? " open" : "")}
      onClick={(e) => e.target === e.currentTarget && onCancel()}
      role="dialog"
      aria-modal="true"
    >
      <div className="modal">
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="modal-act">
          <button type="button" className="btn-sec" onClick={onCancel} disabled={busy}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={tone === "primary" ? "btn-sm" : "btn-danger"}
            onClick={onConfirm}
            disabled={busy}
            style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7 }}
          >
            {busy ? <><Spinner size={14} /> Đang xử lý...</> : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
