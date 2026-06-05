/* Tiện ích định dạng dùng chung cho toàn FE. */

/** 5890000 -> "5.890.000" */
export function vnd(n: number | string | null | undefined): string {
  const num = Number(n ?? 0);
  return num.toLocaleString("vi-VN");
}

/** 84600000 -> "84.6M" ; 9880000000 -> "9.88 tỷ" (cho thẻ thống kê admin) */
export function compactVnd(n: number | string | null | undefined): string {
  const num = Number(n ?? 0);
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(2).replace(/\.?0+$/, "") + " tỷ";
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (num >= 1_000) return Math.round(num / 1_000) + "K";
  return String(num);
}

/** Map MIME phổ biến -> nhãn gọn. */
const MIME_LABEL: Record<string, string> = {
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "DOCX",
  "application/msword": "DOC",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "XLSX",
  "application/vnd.ms-excel": "XLS",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "PPTX",
  "application/vnd.ms-powerpoint": "PPT",
  "application/pdf": "PDF",
  "application/zip": "ZIP",
  "application/x-zip-compressed": "ZIP",
  "application/x-rar-compressed": "RAR",
  "application/vnd.rar": "RAR",
  "application/x-7z-compressed": "7Z",
  "text/plain": "TXT",
  "text/csv": "CSV",
  "image/jpeg": "JPG",
  "image/png": "PNG",
  "image/gif": "GIF",
  "image/webp": "WEBP",
  "image/svg+xml": "SVG",
  "video/mp4": "MP4",
  "video/quicktime": "MOV",
  "audio/mpeg": "MP3",
};

/**
 * Chuẩn hoá nhãn loại file để hiển thị: nhận MIME, đuôi file, hoặc tên file
 * và trả về nhãn ngắn gọn viết hoa (VD: "DOCX", "PDF"). Có thể truyền thêm
 * tên/url file để suy ra đuôi khi fileType là MIME lạ.
 */
export function prettyFileType(
  fileType: string | null | undefined,
  fallbackName?: string | null,
): string {
  const raw = (fileType ?? "").trim();
  if (raw) {
    const lower = raw.toLowerCase();
    if (MIME_LABEL[lower]) return MIME_LABEL[lower];
    // không phải MIME (vd "PDF", "LUT", ".cube") -> bỏ dấu chấm, viết hoa
    if (!lower.includes("/")) return raw.replace(/^\./, "").toUpperCase();
    // MIME lạ -> lấy phần subtype rút gọn
    const sub = lower.split("/")[1] ?? "";
    const short = sub.split(/[.+-]/).pop() ?? sub;
    if (short && short.length <= 5) return short.toUpperCase();
  }
  // suy ra từ đuôi tên/url file
  const name = (fallbackName ?? "").split("?")[0];
  const ext = name.includes(".") ? name.split(".").pop() : "";
  if (ext && ext.length <= 5) return ext.toUpperCase();
  return "FILE";
}

/** bytes -> "2.4 MB" */
export function fileSize(bytes: number | null | undefined): string {
  const b = Number(bytes ?? 0);
  if (b >= 1_048_576) return (b / 1_048_576).toFixed(1) + " MB";
  if (b >= 1024) return Math.round(b / 1024) + " KB";
  return b + " B";
}

/** ISO -> "03/06/2026" */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("vi-VN");
}

/** ISO -> "03/06/2026 14:22" */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return (
    d.toLocaleDateString("vi-VN") +
    " " +
    d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
  );
}

/** ISO -> "10 phút trước" / "2 giờ trước" / "3 ngày trước" */
export function timeAgo(iso: string | null | undefined): string {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "vừa xong";
  if (min < 60) return `${min} phút trước`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} giờ trước`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day} ngày trước`;
  return formatDate(iso);
}

/** giây -> "12:30" */
export function duration(sec: number | null | undefined): string {
  const s = Number(sec ?? 0);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}
