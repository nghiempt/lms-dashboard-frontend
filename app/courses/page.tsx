"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DashboardShell from "../components/DashboardShell";
import { Skeleton } from "../components/Loaders";
import { api } from "@/lib/api";
import { vnd } from "@/lib/format";

interface MyCourse {
  id: string;
  status: string;
  progressPct: number;
  course: {
    id: string;
    title: string;
    shortCode: string | null;
    coverLabel: string | null;
    price: string;
    chapterCount: number;
    lessonCount: number;
  };
}

const STATUS = {
  LEARNING: { cls: "learning", label: "Đang học" },
  COMPLETED: { cls: "done", label: "Hoàn thành" },
  EXPIRED: { cls: "refund", label: "Hết hạn" },
} as Record<string, { cls: string; label: string }>;

export default function CoursesPage() {
  const router = useRouter();
  const [rows, setRows] = useState<MyCourse[]>([]);
  const [filter, setFilter] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<MyCourse[]>("/my/courses")
      .then(setRows)
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  const learningCount = useMemo(
    () => rows.filter((r) => r.status === "LEARNING").length,
    [rows],
  );
  const FILTERS = [`Tất cả (${rows.length})`, `Đang học (${learningCount})`];
  const visible = filter === 1 ? rows.filter((r) => r.status === "LEARNING") : rows;

  return (
    <DashboardShell
      title="Khóa học của tôi"
      subtitle="Quản lý và tiếp tục các khóa học bạn đã đăng ký."
    >
      <div className="filt" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 8 }}>
          {FILTERS.map((f, i) => (
            <button key={f} className={i === filter ? "on" : ""} onClick={() => setFilter(i)}>
              {f}
            </button>
          ))}
        </div>
        <Link className="btn" href="/courses/catalog">+ Khám phá khóa học</Link>
      </div>

      {loading && (
        <div className="cc-grid">
          {[0, 1, 2].map((i) => (
            <div key={i} className="panel cc-card">
              <Skeleton height={120} radius={0} style={{ display: "block" }} />
              <div className="cc-body">
                <Skeleton width={80} height={20} radius={20} />
                <Skeleton width="85%" height={18} style={{ marginTop: 14 }} />
                <Skeleton width="55%" height={12} style={{ marginTop: 10 }} />
                <Skeleton height={8} radius={6} style={{ marginTop: 18 }} />
                <Skeleton height={40} radius={10} style={{ marginTop: 18 }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && visible.length === 0 && (
        <div className="panel" style={{ padding: 24 }}>
          Bạn chưa có khóa học nào. <Link href="/courses/catalog">Khám phá khóa học →</Link>
        </div>
      )}

      <div className="cc-grid">
        {visible.map((r) => {
          const st = STATUS[r.status] ?? STATUS.LEARNING;
          return (
            <div key={r.id} className="panel cc-card">
              <div className="cc-cover">
                <span className="cc-tag">{r.course.shortCode ?? "KH"}</span>
                <span className="cc-cover-l">{r.course.coverLabel ?? r.course.title}</span>
              </div>
              <div className="cc-body">
                <div className="cc-top">
                  <span className={"badge " + st.cls}>{st.label}</span>
                  <span className="cc-price">{vnd(r.course.price)}đ</span>
                </div>
                <div className="cc-nm">{r.course.title}</div>
                <div className="ct-meta">
                  {r.course.chapterCount} chương · {r.course.lessonCount} bài
                </div>
                <div className="prog" style={{ marginTop: 16 }}>
                  <div className="track">
                    <div className="fill" style={{ width: `${r.progressPct}%` }} />
                  </div>
                  <span className="pct">{r.progressPct}%</span>
                </div>
                <button
                  className="btn"
                  type="button"
                  style={{ width: "100%", justifyContent: "center", marginTop: 18 }}
                  onClick={() => router.push(`/courses/${r.course.id}`)}
                >
                  Tiếp tục học
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </DashboardShell>
  );
}
