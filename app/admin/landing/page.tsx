"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminShell from "../../components/AdminShell";
import { useToast } from "../../components/Toast";
import { api } from "@/lib/api";

interface LandingLesson {
  id: string;
  title: string;
  videoUrl: string | null;
  duration: string | null;
}
interface LandingChapter {
  id: string;
  label: string;
  name: string;
  lessons: LandingLesson[];
}
interface LandingCourse {
  id: string;
  slug: string;
  title: string;
  price: string;
  currency: string;
  featured: boolean;
  badge: string | null;
  features: string[];
  isActive: boolean;
  chapters: LandingChapter[];
}

const GRID = "2.4fr 1.2fr 1fr 1fr 90px";

const EditIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4z" /></svg>
);

export default function AdminLandingPage() {
  const router = useRouter();
  const toast = useToast();
  const [rows, setRows] = useState<LandingCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  function load() {
    setLoading(true);
    setLoadError("");
    api
      .get<LandingCourse[]>("/admin/landing-courses")
      .then((r) => setRows(r ?? []))
      .catch((e) =>
        setLoadError((e as Error).message || "Không tải được dữ liệu Landing Page."),
      )
      .finally(() => setLoading(false));
  }
  useEffect(() => {
    load();
  }, []);

  return (
    <AdminShell
      title="Landing Page"
      subtitle="Nội dung 2 khóa học hiển thị trên Landing Page (chỉ dùng cho trang bán hàng)."
    >
      <div className="panel">
        <div className="panel-h">
          <h3>Khóa học trên Landing Page</h3>
          <span className="sub">{rows.length} khóa</span>
        </div>
        <div className="atbl-h" style={{ gridTemplateColumns: GRID }}>
          <div>Khóa học</div>
          <div>Giá</div>
          <div>Nội dung</div>
          <div>Trạng thái</div>
          <div />
        </div>
        {loadError && (
          <div className="list-error">
            <span>{loadError}</span>
            <button type="button" className="retry" onClick={load}>
              Thử lại
            </button>
          </div>
        )}
        {loading && !loadError && [0, 1].map((i) => <div key={i} className="skeleton-row" />)}
        {!loading &&
          rows.map((row) => {
            const lessons = row.chapters.reduce((s, c) => s + c.lessons.length, 0);
            return (
              <div key={row.id} className="atbl-r" style={{ gridTemplateColumns: GRID }}>
                <div className="a-name">
                  <div className="a-thumb">{row.title.slice(0, 2).toUpperCase()}</div>
                  <div>
                    <div className="a-nm">
                      {row.title}
                      {row.featured && (
                        <span className="badge active" style={{ marginLeft: 8 }}>Nổi bật</span>
                      )}
                    </div>
                    <div className="a-sub">/{row.slug} · {row.features.length} ưu điểm</div>
                  </div>
                </div>
                <div className="price">{row.price} {row.currency}</div>
                <div className="a-nm">{row.chapters.length} chương · {lessons} bài</div>
                <div>
                  <span className={"badge " + (row.isActive ? "active" : "hidden2")}>
                    {row.isActive ? "Đang hiển thị" : "Ẩn"}
                  </span>
                </div>
                <div className="a-act">
                  <button
                    type="button"
                    title="Chỉnh sửa"
                    onClick={() => router.push(`/admin/landing/edit?id=${row.id}`)}
                  >
                    {EditIcon}
                  </button>
                </div>
              </div>
            );
          })}
        {!loading && !loadError && rows.length === 0 && (
          <div className="ct-meta" style={{ padding: 12 }}>Chưa có khóa học nào.</div>
        )}
      </div>
    </AdminShell>
  );
}
