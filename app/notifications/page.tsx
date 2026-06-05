"use client";

import { useEffect, useState } from "react";
import { NbBook, NbCard, NbCheck, NbTag } from "../components/dashboardIcons";
import DashboardShell from "../components/DashboardShell";
import { SkeletonRows } from "../components/Loaders";
import { useToast } from "../components/Toast";
import { api } from "@/lib/api";
import { timeAgo } from "@/lib/format";

interface Noti {
  id: string;
  title: string;
  body: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

const ICON_BY_TYPE: Record<string, { ic: React.ReactNode; color: string }> = {
  COURSE: { ic: NbBook, color: "blue" },
  PROMOTION: { ic: NbTag, color: "orange" },
  PAYMENT: { ic: NbCard, color: "green" },
  SYSTEM: { ic: NbCheck, color: "green" },
  COMMUNITY: { ic: NbBook, color: "blue" },
};

function isToday(iso: string): boolean {
  const d = new Date(iso);
  const n = new Date();
  return d.toDateString() === n.toDateString();
}

export default function NotificationsPage() {
  const toast = useToast();
  const [items, setItems] = useState<Noti[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    api.getFull<Noti[]>("/notifications/me", { limit: 50 })
      .then((r) => setItems(r.data ?? []))
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }
  useEffect(load, []);

  async function markRead(id: string) {
    await api.patch(`/notifications/me/${id}/read`).catch(() => undefined);
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  }
  async function markAll() {
    try {
      await api.patch("/notifications/me/read-all");
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success("Đã đánh dấu tất cả là đã đọc.");
    } catch (e) {
      toast.error((e as Error).message || "Thao tác thất bại.");
    }
  }

  const today = items.filter((n) => isToday(n.createdAt));
  const earlier = items.filter((n) => !isToday(n.createdAt));

  const Row = (n: Noti) => {
    const meta = ICON_BY_TYPE[n.type] ?? ICON_BY_TYPE.SYSTEM;
    return (
      <a key={n.id} className={"nf-item" + (!n.isRead ? " unread" : "")} onClick={() => !n.isRead && markRead(n.id)} style={{ cursor: "pointer" }}>
        <span className={"nd-ic " + meta.color}>{meta.ic}</span>
        <div className="nd-tx">
          <p><b>{n.title}</b> — {n.body}</p>
          <time>{timeAgo(n.createdAt)}</time>
        </div>
        {!n.isRead && <span className="nf-dot" />}
      </a>
    );
  };

  return (
    <DashboardShell title="Thông báo" subtitle="Tất cả thông báo & cập nhật của bạn.">
      <div className="panel" style={{ padding: 0 }}>
        <div className="panel-h" style={{ margin: 0, padding: "18px 22px", borderBottom: "1px solid var(--line)" }}>
          <h3>Tất cả thông báo</h3>
          <a className="ct-act" onClick={markAll} style={{ cursor: "pointer" }}>Đánh dấu tất cả đã đọc</a>
        </div>

        {loading && <div style={{ padding: "12px 22px" }}><SkeletonRows rows={5} /></div>}

        {today.length > 0 && <div className="nf-sec">Hôm nay</div>}
        {today.map(Row)}

        {earlier.length > 0 && <div className="nf-sec">Trước đó</div>}
        {earlier.map(Row)}

        {!loading && items.length === 0 && <div className="ct-meta" style={{ padding: 22 }}>Chưa có thông báo nào.</div>}
      </div>
    </DashboardShell>
  );
}
