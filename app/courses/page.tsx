"use client";

import { useState } from "react";
import DashboardShell from "../components/DashboardShell";

const COURSES = [
  { tag: "KP", cover: "Devin Jatho", price: "5.890.000đ", name: "Khóa Premium", meta: "6 chương · 27 bài", pct: 62 },
  { tag: "PE", cover: "Premium Elite", price: "10.890.000đ", name: "Khóa Premium Elite", meta: "9 chương · 37 bài", pct: 18 },
];

const FILTERS = ["Tất cả (2)", "Đang học (2)"];

export default function CoursesPage() {
  const [filter, setFilter] = useState(0);

  return (
    <DashboardShell title="Khóa học của tôi" subtitle="Quản lý và tiếp tục các khóa học bạn đã đăng ký.">
      <div className="filt">
        {FILTERS.map((f, i) => (
          <button key={f} className={i === filter ? "on" : ""} onClick={() => setFilter(i)}>
            {f}
          </button>
        ))}
      </div>
      <div className="cc-grid">
        {COURSES.map((c) => (
          <div key={c.tag} className="panel cc-card">
            <div className="cc-cover">
              <span className="cc-tag">{c.tag}</span>
              <span className="cc-cover-l">{c.cover}</span>
            </div>
            <div className="cc-body">
              <div className="cc-top">
                <span className="badge learning">Đang học</span>
                <span className="cc-price">{c.price}</span>
              </div>
              <div className="cc-nm">{c.name}</div>
              <div className="ct-meta">{c.meta}</div>
              <div className="prog" style={{ marginTop: 16 }}>
                <div className="track">
                  <div className="fill" style={{ width: `${c.pct}%` }} />
                </div>
                <span className="pct">{c.pct}%</span>
              </div>
              <button className="btn" type="button" style={{ width: "100%", justifyContent: "center", marginTop: 18 }}>
                Tiếp tục học
              </button>
            </div>
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}
