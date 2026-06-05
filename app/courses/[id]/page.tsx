"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import DashboardShell from "../../components/DashboardShell";
import { PageLoader, Spinner } from "../../components/Loaders";
import { api } from "@/lib/api";
import { duration } from "@/lib/format";
import { sanitizeHtml } from "@/lib/sanitizeHtml";

interface LessonNode {
  id: string;
  title: string;
  type: string;
  durationSec: number | null;
  isPreview: boolean;
  locked: boolean;
  progress: { status: string; watchedSec: number; lastPositionSec: number };
}
interface ChapterNode {
  id: string;
  title: string;
  lessons: LessonNode[];
}
interface CourseDetail {
  id: string;
  title: string;
  enrolled: boolean;
  enrollment: { progressPct: number; status: string } | null;
  chapters: ChapterNode[];
}
interface PlayData {
  id: string;
  title: string;
  type: string;
  articleHtml: string | null;
  durationSec: number | null;
  video:
    | { source: "BUNNY"; embedUrl: string; watermark: string }
    | { source: "YOUTUBE"; youtubeId: string }
    | null;
}

const LockIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
const PlayIcon = (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
);
const CheckIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
);
const BackIcon = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M11 18l-6-6 6-6" /></svg>
);

function typeLabel(type: string): string {
  const t = (type || "").toUpperCase();
  if (t === "ARTICLE") return "Bài đọc";
  if (t === "QUIZ") return "Trắc nghiệm";
  return "Video";
}

export default function LearnPage() {
  const params = useParams();
  const courseId = String(params.id);
  const [detail, setDetail] = useState<CourseDetail | null>(null);
  const [active, setActive] = useState<LessonNode | null>(null);
  const [play, setPlay] = useState<PlayData | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  // mốc thời gian mở bài học hiện tại → đo thời lượng xem thực tế (không bịa).
  const openedAtRef = useRef<number | null>(null);

  const loadDetail = useCallback(async () => {
    const d = await api.get<CourseDetail>(`/courses/${courseId}/detail`);
    setDetail(d);
    return d;
  }, [courseId]);

  useEffect(() => {
    loadDetail()
      .then((d) => {
        const first = d.chapters.flatMap((c) => c.lessons).find((l) => !l.locked);
        if (first) openLesson(first);
      })
      .catch((e) => setError((e as Error).message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  async function openLesson(l: LessonNode) {
    if (l.locked) return;
    setActive(l);
    setPlay(null);
    setError("");
    openedAtRef.current = Date.now(); // bắt đầu đo thời lượng xem
    try {
      const p = await api.get<PlayData>(`/courses/lessons/${l.id}/play`);
      setPlay(p);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function markComplete() {
    if (!active) return;
    setSaving(true);
    try {
      // Thời lượng xem THỰC TẾ (giây) = thời gian ở trên bài học, chặn trên bằng
      // độ dài bài học nếu có. Không còn bịa watchedSec = durationSec/300.
      const elapsedSec = openedAtRef.current
        ? Math.max(1, Math.round((Date.now() - openedAtRef.current) / 1000))
        : 1;
      const watched = active.durationSec
        ? Math.min(elapsedSec, active.durationSec)
        : elapsedSec;
      await api.post("/my/progress", {
        lessonId: active.id,
        watchedSec: watched,
        lastPositionSec: watched,
        status: "COMPLETED",
      });
      await api.post("/my/study-session", { lessonId: active.id, durationSec: watched });
      const d = await loadDetail();
      // cập nhật active từ dữ liệu mới
      const updated = d.chapters.flatMap((c) => c.lessons).find((x) => x.id === active.id);
      if (updated) setActive(updated);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  const allLessons = detail?.chapters.flatMap((c) => c.lessons) ?? [];
  const lessonCount = allLessons.length;
  const doneCount = allLessons.filter((l) => l.progress.status === "COMPLETED").length;
  const pct = detail?.enrollment?.progressPct ?? (lessonCount ? Math.round((doneCount / lessonCount) * 100) : 0);
  const isDone = active?.progress.status === "COMPLETED";

  // Đang tải lần đầu: hiển thị loader đẹp thay cho chữ trơn.
  if (!detail && !error) {
    return (
      <DashboardShell title="Đang tải khóa học" subtitle="Vui lòng chờ trong giây lát...">
        <PageLoader label="Đang tải nội dung khóa học..." />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      title={detail?.title ?? "Khóa học"}
      subtitle={`Tiến độ ${pct}% · ${doneCount}/${lessonCount} bài hoàn thành`}
    >
      {error && (
        <div className="list-error" style={{ marginBottom: 16 }}>
          <span>{error}</span>
        </div>
      )}

      <div className="cdx">
        {/* ===== Cột trái: sân khấu video + thông tin bài học ===== */}
        <div className="cdx-main">
          <div className="cdx-stage">
            {/* --- LOGIC VIDEO GIỮ NGUYÊN --- */}
            {play?.video?.source === "BUNNY" && (
              <iframe src={play.video.embedUrl} title={play.title} allow="fullscreen" style={{ width: "100%", height: "100%", border: 0 }} />
            )}
            {play?.video?.source === "YOUTUBE" && (
              <iframe src={`https://www.youtube.com/embed/${play.video.youtubeId}`} title={play.title} allow="fullscreen" style={{ width: "100%", height: "100%", border: 0 }} />
            )}
            {play && !play.video && play.type === "ARTICLE" && (
              <div className="cdx-article" dangerouslySetInnerHTML={{ __html: sanitizeHtml(play.articleHtml) }} />
            )}
            {play && !play.video && play.type !== "ARTICLE" && (
              <div className="cdx-stage-empty">Bài học chưa có video</div>
            )}
            {!play && active && (
              <div className="cdx-stage-empty">
                <Spinner size={30} />
                <span style={{ marginTop: 12 }}>Đang tải bài học...</span>
              </div>
            )}
            {!active && <div className="cdx-stage-empty">Chọn một bài học để bắt đầu</div>}
          </div>

          {active && (
            <div className="cdx-lesson">
              <div className="cdx-lesson-tags">
                <span className="cdx-pill">{typeLabel(active.type)}</span>
                {active.isPreview && <span className="cdx-pill free">Học thử</span>}
                {isDone && <span className="cdx-pill done">{CheckIcon} Đã hoàn thành</span>}
              </div>
              <h2 className="cdx-lesson-title">{active.title}</h2>
              <div className="cdx-lesson-meta">
                {active.durationSec ? (
                  <span className="cdx-meta-item">{PlayIcon} {duration(active.durationSec)} phút</span>
                ) : null}
              </div>
              <button
                className="btn btn-primary cdx-complete"
                disabled={saving || isDone}
                onClick={markComplete}
              >
                {isDone ? (
                  <>{CheckIcon} Đã hoàn thành</>
                ) : saving ? (
                  <><Spinner size={15} /> Đang lưu...</>
                ) : (
                  "Đánh dấu hoàn thành"
                )}
              </button>
            </div>
          )}
        </div>

        {/* ===== Cột phải: chương trình học ===== */}
        <aside className="cdx-side">
          <div className="cdx-side-head">
            <div className="cdx-side-title">Nội dung khóa học</div>
            <div className="cdx-side-sub">{detail?.chapters.length ?? 0} chương · {lessonCount} bài học</div>
            <div className="cdx-prog">
              <div className="cdx-prog-track"><div className="cdx-prog-fill" style={{ width: `${pct}%` }} /></div>
              <span className="cdx-prog-pct">{pct}%</span>
            </div>
          </div>

          <div className="cdx-chapters">
            {detail?.chapters.map((ch, ci) => {
              const chDone = ch.lessons.filter((l) => l.progress.status === "COMPLETED").length;
              return (
                <div key={ch.id} className="cdx-ch">
                  <div className="cdx-ch-h">
                    <span className="cdx-ch-no">{ci + 1}</span>
                    <span className="cdx-ch-nm">{ch.title}</span>
                    <span className="cdx-ch-count">{chDone}/{ch.lessons.length}</span>
                  </div>
                  <div className="cdx-les-list">
                    {ch.lessons.map((l) => {
                      const isActive = active?.id === l.id;
                      const done = l.progress.status === "COMPLETED";
                      return (
                        <button
                          key={l.id}
                          onClick={() => openLesson(l)}
                          disabled={l.locked}
                          className={"cdx-les" + (isActive ? " active" : "") + (l.locked ? " locked" : "")}
                        >
                          <span className={"cdx-les-ic" + (done ? " done" : "")}>
                            {l.locked ? LockIcon : done ? CheckIcon : PlayIcon}
                          </span>
                          <span className="cdx-les-nm">{l.title}</span>
                          {l.isPreview && <span className="cdx-pill free sm">Free</span>}
                          {l.durationSec ? <span className="cdx-les-dur">{duration(l.durationSec)}</span> : null}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <Link className="cdx-back" href="/courses">{BackIcon} Về khóa học của tôi</Link>
        </aside>
      </div>
    </DashboardShell>
  );
}
