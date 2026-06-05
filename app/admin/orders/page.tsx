"use client";

import { useEffect, useState } from "react";
import AdminShell from "../../components/AdminShell";
import { Skeleton, SkeletonRows } from "../../components/Loaders";
import { useToast } from "../../components/Toast";
import { api } from "@/lib/api";
import { compactVnd, formatDate, vnd } from "@/lib/format";

const COLS = "1fr 1.2fr 1.3fr 1fr 0.9fr 0.9fr 1fr";

interface Summary { totalRevenue: number; successCount: number; pendingCount: number; refundCount: number }
interface OrderRow {
  id: string; code: string; total: string; status: string; createdAt: string;
  user: { fullName: string }; items: { title: string }[];
}
const STATUS: Record<string, { cls: string; label: string }> = {
  PAID: { cls: "done", label: "Thành công" },
  PENDING: { cls: "pending", label: "Chờ" },
  REFUNDED: { cls: "refund", label: "Hoàn tiền" },
  CANCELLED: { cls: "hidden2", label: "Đã hủy" },
};

const IconMoney = (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
);
const IconCart = (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" /></svg>
);
const IconWait = (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
);
const IconRefund = (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6" /><path d="M21 17a9 9 0 0 0-15-6.7L3 13" /></svg>
);

export default function AdminOrdersPage() {
  const toast = useToast();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [rows, setRows] = useState<OrderRow[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  function load() {
    api.get<Summary>("/orders/summary").then(setSummary).catch(() => undefined);
    api.getFull<OrderRow[]>("/orders", { limit: 100 }).then((r) => setRows(r.data ?? [])).catch(() => undefined);
  }
  useEffect(load, []);

  async function confirm(id: string) {
    setBusy(id);
    try {
      await api.patch(`/orders/${id}/confirm`, {});
      toast.success("Đã xác nhận đơn hàng.");
      load();
    } catch (e) {
      toast.error((e as Error).message || "Xác nhận đơn thất bại.");
    } finally {
      setBusy(null);
    }
  }
  async function refund(id: string) {
    setBusy(id);
    try {
      await api.patch(`/orders/${id}/refund`, {});
      toast.success("Đã hoàn tiền đơn hàng.");
      load();
    } catch (e) {
      toast.error((e as Error).message || "Hoàn tiền thất bại.");
    } finally {
      setBusy(null);
    }
  }

  const cards = [
    { ic: IconMoney, val: compactVnd(summary?.totalRevenue ?? 0), lbl: "Tổng doanh thu" },
    { ic: IconCart, val: String(summary?.successCount ?? 0), lbl: "Đơn thành công" },
    { ic: IconWait, val: String(summary?.pendingCount ?? 0), lbl: "Đơn chờ xử lý" },
    { ic: IconRefund, val: String(summary?.refundCount ?? 0), lbl: "Đơn hoàn tiền" },
  ];

  return (
    <AdminShell title="Đơn hàng & thanh toán" subtitle="Quản lý giao dịch và doanh thu.">
      <div className="stats" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
        {cards.map((c, i) => (
          <div key={i} className="panel stat">
            <div className="ic">{c.ic}</div>
            <div className="val">{summary ? c.val : <Skeleton width={70} height={26} radius={6} />}</div>
            <div className="lbl">{c.lbl}</div>
          </div>
        ))}
      </div>

      <div className="panel">
        <div className="panel-h">
          <h3>Tất cả đơn hàng</h3>
          <span className="sub">{rows.length} đơn</span>
        </div>
        <div className="atbl-h" style={{ gridTemplateColumns: COLS }}>
          <div>Mã đơn</div><div>Học viên</div><div>Khóa học</div><div>Số tiền</div><div>Ngày</div><div>Trạng thái</div><div>Hành động</div>
        </div>
        {!summary && <SkeletonRows rows={5} />}
        {rows.map((o) => {
          const st = STATUS[o.status] ?? STATUS.PENDING;
          return (
            <div key={o.id} className="atbl-r" style={{ gridTemplateColumns: COLS }}>
              <div className="a-nm" style={{ color: "var(--accent)" }}>#{o.code}</div>
              <div className="a-nm">{o.user?.fullName}</div>
              <div className="a-sub" style={{ fontSize: 13, color: "var(--muted)" }}>{o.items.map((i) => i.title).join(", ")}</div>
              <div className="price">{vnd(o.total)}đ</div>
              <div className="a-sub" style={{ fontSize: 13, color: "var(--muted)" }}>{formatDate(o.createdAt)}</div>
              <div><span className={"badge " + st.cls}>{st.label}</span></div>
              <div>
                {o.status === "PENDING" && (
                  <button className="ct-act" disabled={busy === o.id} onClick={() => confirm(o.id)} style={{ cursor: "pointer" }}>Xác nhận</button>
                )}
                {o.status === "PAID" && (
                  <button className="ct-act" disabled={busy === o.id} onClick={() => refund(o.id)} style={{ cursor: "pointer", color: "#c0392b" }}>Hoàn tiền</button>
                )}
              </div>
            </div>
          );
        })}
        {summary && rows.length === 0 && <div className="ct-meta" style={{ padding: 12 }}>Chưa có đơn hàng.</div>}
      </div>
    </AdminShell>
  );
}
