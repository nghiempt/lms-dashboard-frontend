"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminShell from "../components/AdminShell";
import { AdminIcon } from "../components/adminIcons";

const STATS = [
  { ic: AdminIcon.search, val: "84.6M", lbl: "Doanh thu tháng này", icon: "revenue" as const },
  { val: "1.248", lbl: "Tổng học viên", icon: "users" as const },
  { val: "32", lbl: "Đơn hàng mới", icon: "cart" as const },
  { val: "2", lbl: "Khóa học", icon: "book" as const },
];

const STAT_ICONS = {
  revenue: (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  users: AdminIcon.users,
  cart: AdminIcon.cart,
  book: AdminIcon.book,
};

const BARS = [
  { v: "52M", h: 61, d: "T1" },
  { v: "61M", h: 72, d: "T2" },
  { v: "58M", h: 69, d: "T3" },
  { v: "73M", h: 86, d: "T4" },
  { v: "69M", h: 82, d: "T5" },
  { v: "84.6M", h: 100, d: "T6", peak: true },
];

const BEST = [
  { tag: "KP", name: "Khóa Premium", students: "742 học viên", pct: 88, revenue: "4.37 tỷ" },
  { tag: "PE", name: "Khóa Premium Elite", students: "506 học viên", pct: 100, revenue: "5.51 tỷ" },
];

const ORDERS = [
  { id: "#2042", name: "Tuấn Kiệt", course: "Premium Elite", amount: "10.890.000đ", status: "done", label: "Thành công" },
  { id: "#2041", name: "Minh Trang", course: "Khóa Premium", amount: "5.890.000đ", status: "done", label: "Thành công" },
  { id: "#2040", name: "Quốc Bảo", course: "Premium Elite", amount: "10.890.000đ", status: "pending", label: "Chờ" },
  { id: "#2039", name: "Hải Yến", course: "Khóa Premium", amount: "5.890.000đ", status: "done", label: "Thành công" },
  { id: "#2038", name: "Đức Anh", course: "Khóa Premium", amount: "5.890.000đ", status: "refund", label: "Hoàn tiền" },
];

const ORDER_COLS = "0.8fr 1.4fr 1.4fr 1.1fr 1fr";

export default function AdminDashboardPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <AdminShell title="Tổng quan" subtitle="Chào Danmotion, đây là tình hình hôm nay.">
      <div className="stats" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
        {STATS.map((s, i) => (
          <div key={i} className="panel stat">
            <div className="ic">{STAT_ICONS[s.icon]}</div>
            <div className="val">{s.val}</div>
            <div className="lbl">{s.lbl}</div>
          </div>
        ))}
      </div>

      <div className="charts">
        <div className="panel">
          <div className="panel-h">
            <h3>Doanh thu 6 tháng</h3>
            <span className="sub">Đơn vị: triệu đ</span>
          </div>
          <div className="bars">
            {BARS.map((b, i) => (
              <div key={i} className={"bar" + (b.peak ? " peak" : "")}>
                <span className="v">{b.v}</span>
                <div className="col" style={{ height: mounted ? `${b.h}%` : 0 }} />
                <span className="d">{b.d}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-h">
            <h3>Khóa bán chạy</h3>
          </div>
          {BEST.map((c) => (
            <div key={c.tag} className="atbl-r" style={{ gridTemplateColumns: "2fr 1fr 1fr" }}>
              <div className="a-name">
                <div className="a-thumb">{c.tag}</div>
                <div>
                  <div className="a-nm">{c.name}</div>
                  <div className="a-sub">{c.students}</div>
                </div>
              </div>
              <div className="prog">
                <div className="track">
                  <div className="fill" style={{ width: `${c.pct}%` }} />
                </div>
              </div>
              <div className="price" style={{ textAlign: "right" }}>
                {c.revenue}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="panel">
        <div className="panel-h">
          <h3>Đơn hàng gần đây</h3>
          <Link className="ct-act" href="/admin/orders">
            Xem tất cả
          </Link>
        </div>
        <div className="atbl-h" style={{ gridTemplateColumns: ORDER_COLS }}>
          <div>Mã đơn</div>
          <div>Học viên</div>
          <div>Khóa học</div>
          <div>Số tiền</div>
          <div>Trạng thái</div>
        </div>
        {ORDERS.map((o) => (
          <div key={o.id} className="atbl-r" style={{ gridTemplateColumns: ORDER_COLS }}>
            <div className="a-nm" style={{ color: "var(--accent)" }}>
              {o.id}
            </div>
            <div className="a-nm">{o.name}</div>
            <div className="a-sub" style={{ fontSize: 13, color: "var(--muted)" }}>
              {o.course}
            </div>
            <div className="price">{o.amount}</div>
            <div>
              <span className={"badge " + o.status}>{o.label}</span>
            </div>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
