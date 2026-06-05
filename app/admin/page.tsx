"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminShell from "../components/AdminShell";
import { AdminIcon } from "../components/adminIcons";
import { Skeleton, SkeletonRows } from "../components/Loaders";
import { api } from "@/lib/api";
import { compactVnd, vnd } from "@/lib/format";

interface Overview {
  revenueThisMonth: number;
  students: number;
  newOrdersThisMonth: number;
  courses: number;
}
interface RevenuePoint { month: string; revenue: number; count: number }
interface TopCourse { courseId: string; title: string; revenue: number; sales: number; studentsCount: number }
interface OrderRow {
  id: string; code: string; total: string; status: string;
  user: { fullName: string }; items: { title: string }[];
}

const STAT_ICONS = {
  revenue: (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  users: AdminIcon.users, cart: AdminIcon.cart, book: AdminIcon.book,
};
const ORDER_COLS = "0.9fr 1.4fr 1.4fr 1.1fr 1fr";
const ORDER_STATUS: Record<string, { cls: string; label: string }> = {
  PAID: { cls: "done", label: "Thành công" },
  PENDING: { cls: "pending", label: "Chờ" },
  REFUNDED: { cls: "refund", label: "Hoàn tiền" },
  CANCELLED: { cls: "hidden2", label: "Đã hủy" },
};

export default function AdminDashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [ov, setOv] = useState<Overview | null>(null);
  const [revenue, setRevenue] = useState<RevenuePoint[]>([]);
  const [top, setTop] = useState<TopCourse[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    api.get<Overview>("/stats/overview").then(setOv).catch(() => undefined);
    api.get<{ data: RevenuePoint[] }>("/stats/revenue", { months: 6 }).then((r) => setRevenue(r.data)).catch(() => undefined);
    api.get<TopCourse[]>("/stats/top-courses", { limit: 5 }).then(setTop).catch(() => undefined);
    api.getFull<OrderRow[]>("/orders", { limit: 5 }).then((r) => setOrders(r.data ?? [])).catch(() => undefined);
    return () => cancelAnimationFrame(id);
  }, []);

  const STATS = [
    { ic: STAT_ICONS.revenue, val: compactVnd(ov?.revenueThisMonth ?? 0), lbl: "Doanh thu tháng này" },
    { ic: STAT_ICONS.users, val: vnd(ov?.students ?? 0), lbl: "Tổng học viên" },
    { ic: STAT_ICONS.cart, val: String(ov?.newOrdersThisMonth ?? 0), lbl: "Đơn hàng tháng này" },
    { ic: STAT_ICONS.book, val: String(ov?.courses ?? 0), lbl: "Khóa học" },
  ];

  const maxRev = Math.max(1, ...revenue.map((r) => r.revenue));
  const bars = revenue.map((r) => ({
    v: compactVnd(r.revenue),
    h: Math.round((r.revenue / maxRev) * 100),
    d: "T" + Number(r.month.split("-")[1]),
    peak: r.revenue === maxRev && r.revenue > 0,
  }));
  const maxTopRev = Math.max(1, ...top.map((t) => t.revenue));

  return (
    <AdminShell title="Tổng quan" subtitle="Tình hình kinh doanh & học tập hôm nay.">
      <div className="stats" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
        {STATS.map((s, i) => (
          <div key={i} className="panel stat">
            <div className="ic">{s.ic}</div>
            <div className="val">{ov ? s.val : <Skeleton width={70} height={26} radius={6} />}</div>
            <div className="lbl">{s.lbl}</div>
          </div>
        ))}
      </div>

      <div className="charts">
        <div className="panel">
          <div className="panel-h">
            <h3>Doanh thu 6 tháng</h3>
            <span className="sub">Đơn vị: VNĐ</span>
          </div>
          <div className="bars">
            {bars.map((b, i) => (
              <div key={i} className={"bar" + (b.peak ? " peak" : "")}>
                <span className="v">{b.v}</span>
                <div className="col" style={{ height: mounted ? `${b.h}%` : 0 }} />
                <span className="d">{b.d}</span>
              </div>
            ))}
            {bars.length === 0 && <div className="ct-meta">Chưa có dữ liệu doanh thu.</div>}
          </div>
        </div>

        <div className="panel">
          <div className="panel-h"><h3>Khóa bán chạy</h3></div>
          {!ov && <SkeletonRows rows={4} />}
          {top.map((c) => (
            <div key={c.courseId} className="atbl-r" style={{ gridTemplateColumns: "2fr 1fr 1fr" }}>
              <div className="a-name">
                <div className="a-thumb">{c.title.slice(0, 2).toUpperCase()}</div>
                <div>
                  <div className="a-nm">{c.title}</div>
                  <div className="a-sub">{c.studentsCount} học viên</div>
                </div>
              </div>
              <div className="prog">
                <div className="track"><div className="fill" style={{ width: `${Math.round((c.revenue / maxTopRev) * 100)}%` }} /></div>
              </div>
              <div className="price" style={{ textAlign: "right" }}>{compactVnd(c.revenue)}</div>
            </div>
          ))}
          {ov && top.length === 0 && <div className="ct-meta">Chưa có dữ liệu.</div>}
        </div>
      </div>

      <div className="panel">
        <div className="panel-h">
          <h3>Đơn hàng gần đây</h3>
          <Link className="ct-act" href="/admin/orders">Xem tất cả</Link>
        </div>
        <div className="atbl-h" style={{ gridTemplateColumns: ORDER_COLS }}>
          <div>Mã đơn</div><div>Học viên</div><div>Khóa học</div><div>Số tiền</div><div>Trạng thái</div>
        </div>
        {!ov && <SkeletonRows rows={4} />}
        {orders.map((o) => {
          const st = ORDER_STATUS[o.status] ?? ORDER_STATUS.PENDING;
          return (
            <div key={o.id} className="atbl-r" style={{ gridTemplateColumns: ORDER_COLS }}>
              <div className="a-nm" style={{ color: "var(--accent)" }}>#{o.code}</div>
              <div className="a-nm">{o.user?.fullName}</div>
              <div className="a-sub" style={{ fontSize: 13, color: "var(--muted)" }}>{o.items[0]?.title}</div>
              <div className="price">{vnd(o.total)}đ</div>
              <div><span className={"badge " + st.cls}>{st.label}</span></div>
            </div>
          );
        })}
        {ov && orders.length === 0 && <div className="ct-meta" style={{ padding: 12 }}>Chưa có đơn hàng.</div>}
      </div>
    </AdminShell>
  );
}
