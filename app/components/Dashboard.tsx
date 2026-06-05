"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { api } from "@/lib/api";
import { vnd } from "@/lib/format";
import { Icon } from "./dashboardIcons";
import DashboardShell from "./DashboardShell";
import { Skeleton, SkeletonRows } from "./Loaders";

interface DashboardData {
  coursesBought: number;
  totalHours: number;
  videosWatched: number;
  videosRemaining: number;
  completionRate: number;
  courses: {
    id: string;
    title: string;
    shortCode: string | null;
    progressPct: number;
    status: string;
    price: string;
  }[];
}
interface StudyStats {
  totalHours: number;
  data: { date: string; hours: number }[];
}

const STATUS_LABEL: Record<string, { cls: string; label: string }> = {
  LEARNING: { cls: "learning", label: "Đang học" },
  COMPLETED: { cls: "done", label: "Hoàn thành" },
  EXPIRED: { cls: "refund", label: "Hết hạn" },
};

function weekday(iso: string): string {
  const d = new Date(iso).getDay();
  return d === 0 ? "CN" : "T" + (d + 1);
}

export default function Dashboard() {
  const router = useRouter();
  const [name, setName] = useState("bạn");
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState<DashboardData | null>(null);
  const [stats, setStats] = useState<StudyStats | null>(null);

  useEffect(() => {
    setName(getCurrentUser().name);
    const id = requestAnimationFrame(() => setMounted(true));
    api.get<DashboardData>("/my/dashboard").then(setData).catch(() => undefined);
    api.get<StudyStats>("/my/study-stats", { days: 7 }).then(setStats).catch(() => undefined);
    return () => cancelAnimationFrame(id);
  }, []);

  const C = 2 * Math.PI * 70;
  const donutPct = data?.completionRate ?? 0;
  const totalVideos = (data?.videosWatched ?? 0) + (data?.videosRemaining ?? 0);

  const maxHours = Math.max(0.01, ...(stats?.data ?? []).map((b) => b.hours));
  const bars = (stats?.data ?? []).map((b) => ({
    v: `${b.hours}h`,
    h: Math.round((b.hours / maxHours) * 100),
    d: weekday(b.date),
    peak: b.hours === maxHours && b.hours > 0,
  }));

  const STATS = [
    { ic: Icon.bag, val: String(data?.coursesBought ?? 0), lbl: "Khóa học đã mua" },
    { ic: Icon.clock, val: `${data?.totalHours ?? 0}h`, lbl: "Tổng giờ học" },
    { ic: Icon.eye, val: String(data?.videosWatched ?? 0), lbl: "Video đã xem" },
    { ic: Icon.list, val: String(data?.videosRemaining ?? 0), lbl: "Video còn lại" },
    { ic: Icon.share, val: `${donutPct}%`, lbl: "Tỷ lệ hoàn thành" },
  ];

  return (
    <DashboardShell title={<>Chào, {name} 👋</>} subtitle="Hôm nay học gì nào? Tiếp tục lộ trình của bạn.">
      <div className="stats">
        {STATS.map((s) => (
          <div key={s.lbl} className="panel stat">
            <div className="ic">{s.ic}</div>
            <div className="val">{data ? s.val : <Skeleton width={48} height={26} radius={6} />}</div>
            <div className="lbl">{s.lbl}</div>
          </div>
        ))}
      </div>

      <div className="charts">
        <div className="panel">
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
                  style={{ strokeDasharray: C, strokeDashoffset: mounted ? C * (1 - donutPct / 100) : C }}
                />
              </svg>
              <div className="ctr">
                <b>{donutPct}%</b>
                <span>hoàn thành</span>
              </div>
            </div>
            <div className="donut-foot">
              {data?.videosWatched ?? 0}/{totalVideos} video đã xem trên toàn bộ khóa
            </div>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-h">
          <h3>Khóa học của tôi</h3>
          <span className="sub">{data?.courses.length ?? 0} khóa</span>
        </div>
        <div className="ctable">
          <div className="ct-head">
            <div>Khóa học</div>
            <div>Tiến trình</div>
            <div>Học phí</div>
            <div>Trạng thái</div>
            <div />
          </div>
          {!data && <SkeletonRows rows={4} />}
          {(data?.courses ?? []).map((c) => {
            const st = STATUS_LABEL[c.status] ?? STATUS_LABEL.LEARNING;
            return (
              <div key={c.id} className="ct-row">
                <div className="ct-course">
                  <div className="ct-thumb">{c.shortCode ?? c.title.slice(0, 2).toUpperCase()}</div>
                  <div style={{ minWidth: 0 }}>
                    <div className="ct-nm">{c.title}</div>
                    <div className="ct-meta">&nbsp;</div>
                  </div>
                </div>
                <div className="prog">
                  <div className="track">
                    <div className="fill" style={{ width: `${c.progressPct}%` }} />
                  </div>
                  <span className="pct">{c.progressPct}%</span>
                </div>
                <div className="price">
                  {vnd(c.price)}
                  <span style={{ fontSize: 11, color: "var(--muted-2)", fontWeight: 400 }}>đ</span>
                </div>
                <div>
                  <span className={"badge " + st.cls}>{st.label}</span>
                </div>
                <button className="ct-act" type="button" onClick={() => router.push(`/courses/${c.id}`)}>
                  Tiếp tục
                </button>
              </div>
            );
          })}
          {data && data.courses.length === 0 && (
            <div className="ct-row">
              <div className="ct-meta" style={{ padding: 12 }}>
                Bạn chưa mua khóa nào. <a href="/courses">Khám phá khóa học →</a>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
