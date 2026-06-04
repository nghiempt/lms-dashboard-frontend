"use client";

import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/auth";
import { Icon } from "./dashboardIcons";
import DashboardShell from "./DashboardShell";

const STATS = [
  { ic: Icon.bag, val: "2", lbl: "Khóa học đã mua" },
  { ic: Icon.clock, val: "48.5h", lbl: "Tổng giờ học" },
  { ic: Icon.eye, val: "86", lbl: "Video đã xem" },
  { ic: Icon.list, val: "42", lbl: "Video còn lại" },
  { ic: Icon.share, val: "67%", lbl: "Tỷ lệ hoàn thành" },
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

const COURSES = [
  { code: "KP", name: "Khóa Premium", meta: "6 chương · 27 bài", pct: 62, price: "5.890.000", status: "learning", statusLabel: "Đang học" },
  { code: "PE", name: "Khóa Premium Elite", meta: "9 chương · 37 bài", pct: 18, price: "10.890.000", status: "learning", statusLabel: "Đang học" },
];

const DONUT_PCT = 67;

export default function Dashboard() {
  const [name, setName] = useState("Tuấn Kiệt");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setName(getCurrentUser().name);
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const C = 2 * Math.PI * 70;

  return (
    <DashboardShell title={<>Chào, {name} 👋</>} subtitle="Hôm nay học gì nào? Tiếp tục lộ trình của bạn.">
      <div className="stats">
        {STATS.map((s) => (
          <div key={s.lbl} className="panel stat">
            <div className="ic">{s.ic}</div>
            <div className="val">{s.val}</div>
            <div className="lbl">{s.lbl}</div>
          </div>
        ))}
      </div>

      <div className="charts">
        <div className="panel">
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
            <h3>Tỷ lệ hoàn thành</h3>
          </div>
          <div className="donut-wrap">
            <div className="donut">
              <svg width="170" height="170" viewBox="0 0 170 170">
                <circle className="ring-bg" cx="85" cy="85" r="70" />
                <circle
                  className="ring"
                  cx="85"
                  cy="85"
                  r="70"
                  style={{ strokeDasharray: C, strokeDashoffset: mounted ? C * (1 - DONUT_PCT / 100) : C }}
                />
              </svg>
              <div className="ctr">
                <b>{DONUT_PCT}%</b>
                <span>hoàn thành</span>
              </div>
            </div>
            <div className="donut-foot">86/128 video đã xem trên toàn bộ khóa</div>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-h">
          <h3>Khóa học của tôi</h3>
          <span className="sub">2 khóa</span>
        </div>
        <div className="ctable">
          <div className="ct-head">
            <div>Khóa học</div>
            <div>Tiến trình</div>
            <div>Học phí</div>
            <div>Trạng thái</div>
            <div />
          </div>
          {COURSES.map((c) => (
            <div key={c.code} className="ct-row">
              <div className="ct-course">
                <div className="ct-thumb">{c.code}</div>
                <div style={{ minWidth: 0 }}>
                  <div className="ct-nm">{c.name}</div>
                  <div className="ct-meta">{c.meta}</div>
                </div>
              </div>
              <div className="prog">
                <div className="track">
                  <div className="fill" style={{ width: `${c.pct}%` }} />
                </div>
                <span className="pct">{c.pct}%</span>
              </div>
              <div className="price">
                {c.price}
                <span style={{ fontSize: 11, color: "var(--muted-2)", fontWeight: 400 }}>đ</span>
              </div>
              <div>
                <span className={"badge " + c.status}>{c.statusLabel}</span>
              </div>
              <button className="ct-act" type="button">
                Tiếp tục
              </button>
            </div>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
