"use client";

/* ============================================================
   Bộ component loading dùng chung toàn app.
   - <Spinner/>      : icon xoay tròn, kế thừa currentColor.
   - <PageLoader/>   : khối loading giữa trang (spinner + dòng chữ).
   - <Skeleton/>     : 1 khối shimmer (tùy biến width/height).
   - <SkeletonRows/> : nhiều dòng skeleton cho danh sách/bảng.
   - <SkeletonText/> : vài dòng text giả lập đoạn văn.
   ============================================================ */

import type { CSSProperties } from "react";

export function Spinner({ size = 16, stroke = 3 }: { size?: number; stroke?: number }) {
  return (
    <svg className="spin" width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth={stroke} />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" />
    </svg>
  );
}

export function PageLoader({ label = "Đang tải dữ liệu..." }: { label?: string }) {
  return (
    <div className="page-loader" role="status" aria-live="polite">
      <span className="page-loader-spin"><Spinner size={34} stroke={3} /></span>
      <span className="page-loader-tx">{label}</span>
    </div>
  );
}

export function Skeleton({
  width,
  height = 14,
  radius = 8,
  style,
}: {
  width?: number | string;
  height?: number | string;
  radius?: number;
  style?: CSSProperties;
}) {
  return (
    <span
      className="sk"
      style={{ width: width ?? "100%", height, borderRadius: radius, ...style }}
    />
  );
}

export function SkeletonRows({ rows = 3 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton-row" />
      ))}
    </>
  );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="sk-text">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} width={i === lines - 1 ? "60%" : "100%"} height={12} />
      ))}
    </div>
  );
}
