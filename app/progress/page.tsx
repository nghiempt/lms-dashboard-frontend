"use client";

import { useEffect, useState } from "react";
import { Icon } from "../components/dashboardIcons";
import DashboardShell from "../components/DashboardShell";
import { Skeleton, SkeletonRows } from "../components/Loaders";
import { api } from "@/lib/api";

interface StudyStats {
  totalHours: number;
  streak: number;
  data: { date: string; hours: number }[];
}
interface DashboardData {
  videosWatched: number;
  videosRemaining: number;
}
interface MyCourse {
  id: string;
  progressPct: number;
  course: { title: string; shortCode: string | null; chapterCount: number; lessonCount: number };
}

function weekday(iso: string): string {
  const d = new Date(iso).getDay();
  return d === 0 ? "CN" : "T" + (d + 1);
}

export default function ProgressPage() {
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState<StudyStats | null>(null);
  const [dash, setDash] = useState<DashboardData | null>(null);
  const [courses, setCourses] = useState<MyCourse[]>([]);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    api.get<StudyStats>("/my/study-stats", { days: 7 }).then(setStats).catch(() => undefined);
    api.get<DashboardData>("/my/dashboard").then(setDash).catch(() => undefined);
    api.get<MyCourse[]>("/my/courses").then(setCourses).catch(() => undefined);
    return () => cancelAnimationFrame(id);
  }, []);

  const watched = dash?.videosWatched ?? 0;
  const total = watched + (dash?.videosRemaining ?? 0);

  const STATS = [
    { ic: Icon.chart, val: `${stats?.streak ?? 0} ngày`, lbl: "Chuỗi học liên tục" },
    { ic: Icon.book, val: `${watched}/${total}`, lbl: "Bài giảng đã xem" },
    { ic: Icon.home, val: `${stats?.totalHours ?? 0}h`, lbl: "Giờ học tuần này" },
  ];

  const maxHours = Math.max(0.01, ...(stats?.data ?? []).map((b) => b.hours));
  const bars = (stats?.data ?? []).map((b) => ({
    v: `${b.hours}h`,
    h: Math.round((b.hours / maxHours) * 100),
    d: weekday(b.date),
    peak: b.hours === maxHours && b.hours > 0,
  }));

  return (
    <DashboardShell title="Tiến độ học" subtitle="Theo dõi quá trình học tập của bạn.">
      <div className="stats" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        {STATS.map((s) => (
          <div key={s.lbl} className="panel stat">
            <div className="ic">{s.ic}</div>
            <div className="val">{stats && dash ? s.val : <Skeleton width={64} height={26} radius={6} />}</div>
            <div className="lbl">{s.lbl}</div>
          </div>
        ))}
      </div>

      <div className="panel" style={{ marginBottom: 20 }}>
        <div className="panel-h">
          <h3>Giờ học 7 ngày qua</h3>
          <span className="sub">Tổng {stats?.totalHours ?? 0} giờ</span>
        </div>
        <div className="bars">
          {bars.map((b, i) => (
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
          <h3>Tiến độ theo khóa</h3>
        </div>
        {!dash && <SkeletonRows rows={3} />}
        {courses.map((p) => (
          <div key={p.id} className="pg-row">
            <div className="ct-course">
              <div className="ct-thumb">{p.course.shortCode ?? "KH"}</div>
              <div style={{ minWidth: 0 }}>
                <div className="ct-nm">{p.course.title}</div>
                <div className="ct-meta">{p.course.chapterCount} chương · {p.course.lessonCount} bài</div>
              </div>
            </div>
            <div className="prog">
              <div className="track">
                <div className="fill" style={{ width: `${p.progressPct}%` }} />
              </div>
              <span className="pct">{p.progressPct}%</span>
            </div>
          </div>
        ))}
        {dash && courses.length === 0 && <div className="ct-meta" style={{ padding: 12 }}>Chưa có dữ liệu.</div>}
      </div>
    </DashboardShell>
  );
}
