"use client";

import { useEffect, useState } from "react";
import { Icon } from "../components/dashboardIcons";
import DashboardShell from "../components/DashboardShell";

const STATS = [
  { ic: Icon.chart, val: "7 ngày", lbl: "Chuỗi học liên tục" },
  { ic: Icon.book, val: "86/128", lbl: "Bài giảng đã xem" },
  { ic: Icon.home, val: "18.7h", lbl: "Giờ học tuần này" },
];

const BARS = [
  { v: "2.5h", h: 61, d: "T2" },
  { v: "1.8h", h: 44, d: "T3" },
  { v: "3.2h", h: 78, d: "T4" },
  { v: "0.9h", h: 22, d: "T5" },
  { v: "4.1h", h: 100, d: "T6", peak: true },
  { v: "2.7h", h: 66, d: "T7" },
  { v: "3.5h", h: 85, d: "CN" },
];

const PROGRESS = [
  { code: "KP", name: "Khóa Premium", meta: "4/6 chương hoàn thành", pct: 62 },
  { code: "PE", name: "Khóa Premium Elite", meta: "2/9 chương hoàn thành", pct: 18 },
];

export default function ProgressPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <DashboardShell title="Tiến độ học" subtitle="Theo dõi quá trình học tập của bạn.">
      <div className="stats" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        {STATS.map((s) => (
          <div key={s.lbl} className="panel stat">
            <div className="ic">{s.ic}</div>
            <div className="val">{s.val}</div>
            <div className="lbl">{s.lbl}</div>
          </div>
        ))}
      </div>

      <div className="panel" style={{ marginBottom: 20 }}>
        <div className="panel-h">
          <h3>Giờ học 7 ngày qua</h3>
          <span className="sub">Tổng 18.7 giờ</span>
        </div>
        <div className="bars">
          {BARS.map((b) => (
            <div key={b.d} className={"bar" + (b.peak ? " peak" : "")}>
              <span className="v">{b.v}</span>
              <div className="col" style={{ height: mounted ? `${b.h}%` : 0 }} />
              <span className="d">{b.d}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="panel">
        <div className="panel-h">
          <h3>Tiến độ theo khóa</h3>
        </div>
        {PROGRESS.map((p) => (
          <div key={p.code} className="pg-row">
            <div className="ct-course">
              <div className="ct-thumb">{p.code}</div>
              <div style={{ minWidth: 0 }}>
                <div className="ct-nm">{p.name}</div>
                <div className="ct-meta">{p.meta}</div>
              </div>
            </div>
            <div className="prog">
              <div className="track">
                <div className="fill" style={{ width: `${p.pct}%` }} />
              </div>
              <span className="pct">{p.pct}%</span>
            </div>
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}
