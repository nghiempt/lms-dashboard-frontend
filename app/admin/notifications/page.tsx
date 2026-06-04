"use client";

import { useEffect, useState } from "react";
import AdminShell from "../../components/AdminShell";
import { api } from "@/lib/api";
import { timeAgo } from "@/lib/format";

interface Log {
  id: string;
  type: string;
  action: string;
  createdAt: string;
  user: { fullName: string } | null;
}

const ICON: Record<string, { color: string; svg: React.ReactNode }> = {
  PURCHASE: {
    color: "blue",
    svg: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" /></svg>,
  },
  LOGIN: {
    color: "green",
    svg: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><path d="M10 17l5-5-5-5" /><path d="M15 12H3" /></svg>,
  },
  VIEW_LESSON: {
    color: "blue",
    svg: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></svg>,
  },
};
function isToday(iso: string) {
  return new Date(iso).toDateString() === new Date().toDateString();
}

export default function AdminNotificationsPage() {
  const [rows, setRows] = useState<Log[]>([]);
  useEffect(() => {
    api.getFull<Log[]>("/activity", { limit: 50 }).then((r) => setRows(r.data ?? [])).catch(() => undefined);
  }, []);

  const today = rows.filter((r) => isToday(r.createdAt));
  const earlier = rows.filter((r) => !isToday(r.createdAt));

  const Row = (r: Log) => {
    const ic = ICON[r.type] ?? ICON.LOGIN;
    return (
      <a key={r.id} className="nf-item">
        <span className={"nd-ic " + ic.color}>{ic.svg}</span>
        <div className="nd-tx">
          <p><b>{r.user?.fullName ?? "Hệ thống"}</b> — {r.action}</p>
          <time>{timeAgo(r.createdAt)}</time>
        </div>
      </a>
    );
  };

  return (
    <AdminShell title="Thông báo" subtitle="Tất cả hoạt động & cập nhật của hệ thống.">
      <div className="panel" style={{ padding: 0 }}>
        <div className="panel-h" style={{ margin: 0, padding: "18px 22px", borderBottom: "1px solid var(--line)" }}>
          <h3>Hoạt động hệ thống</h3>
        </div>
        {today.length > 0 && <div className="nf-sec">Hôm nay</div>}
        {today.map(Row)}
        {earlier.length > 0 && <div className="nf-sec">Trước đó</div>}
        {earlier.map(Row)}
        {rows.length === 0 && <div className="ct-meta" style={{ padding: 22 }}>Chưa có hoạt động.</div>}
      </div>
    </AdminShell>
  );
}
