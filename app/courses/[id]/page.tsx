"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import DashboardShell from "../../components/DashboardShell";
import { api } from "@/lib/api";
import { duration } from "@/lib/format";

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
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
);
const CheckIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
);

export default function LearnPage() {
  const params = useParams();
  const courseId = String(params.id);
  const [detail, setDetail] = useState<CourseDetail | null>(null);
  const [active, setActive] = useState<LessonNode | null>(null);
  const [play, setPlay] = useState<PlayData | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

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
      const dur = active.durationSec ?? 300;
      await api.post("/my/progress", {
        lessonId: active.id,
        watchedSec: dur,
        lastPositionSec: dur,
        status: "COMPLETED",
      });
      await api.post("/my/study-session", { lessonId: active.id, durationSec: dur });
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

  const lessonCount = detail?.chapters.reduce((s, c) => s + c.lessons.length, 0) ?? 0;
  const doneCount =
    detail?.chapters
      .flatMap((c) => c.lessons)
      .filter((l) => l.progress.status === "COMPLETED").length ?? 0;

  return (
    <DashboardShell
      title={detail?.title ?? "Đang tải..."}
      subtitle={`Tiến độ ${detail?.enrollment?.progressPct ?? 0}% · ${doneCount}/${lessonCount} bài hoàn thành`}
    >
      {error && <div className="panel" style={{ padding: 14, marginBottom: 14, color: "#c0392b" }}>{error}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 20, alignItems: "start" }}>
        {/* Player */}
        <div className="panel">
          {active ? (
            <>
              <div style={{ aspectRatio: "16/9", background: "#000", borderRadius: 12, overflow: "hidden", marginBottom: 16 }}>
                {play?.video?.source === "BUNNY" && (
                  <iframe src={play.video.embedUrl} title={play.title} allow="fullscreen" style={{ width: "100%", height: "100%", border: 0 }} />
                )}
                {play?.video?.source === "YOUTUBE" && (
                  <iframe src={`https://www.youtube.com/embed/${play.video.youtubeId}`} title={play.title} allow="fullscreen" style={{ width: "100%", height: "100%", border: 0 }} />
                )}
                {play && !play.video && play.type === "ARTICLE" && (
                  <div style={{ color: "#fff", padding: 24, height: "100%", overflow: "auto" }} dangerouslySetInnerHTML={{ __html: play.articleHtml ?? "" }} />
                )}
                {play && !play.video && play.type !== "ARTICLE" && (
                  <div style={{ color: "#fff", display: "grid", placeItems: "center", height: "100%" }}>Bài học chưa có video</div>
                )}
                {!play && <div style={{ color: "#fff", display: "grid", placeItems: "center", height: "100%" }}>Đang tải bài học...</div>}
              </div>
              <div className="panel-h">
                <h3>{active.title}</h3>
                <span className="sub">{active.durationSec ? duration(active.durationSec) : ""}</span>
              </div>
              <button
                className="btn btn-primary"
                style={{ marginTop: 8 }}
                disabled={saving || active.progress.status === "COMPLETED"}
                onClick={markComplete}
              >
                {active.progress.status === "COMPLETED" ? "✓ Đã hoàn thành" : saving ? "Đang lưu..." : "Đánh dấu hoàn thành"}
              </button>
            </>
          ) : (
            <div style={{ padding: 24 }}>Chọn một bài học để bắt đầu.</div>
          )}
        </div>

        {/* Curriculum */}
        <div className="panel">
          <div className="panel-h"><h3>Nội dung khóa học</h3></div>
          {detail?.chapters.map((ch, ci) => (
            <div key={ch.id} style={{ marginBottom: 14 }}>
              <div className="ct-nm" style={{ marginBottom: 8 }}>{ci + 1}. {ch.title}</div>
              {ch.lessons.map((l) => {
                const isActive = active?.id === l.id;
                const done = l.progress.status === "COMPLETED";
                return (
                  <button
                    key={l.id}
                    onClick={() => openLesson(l)}
                    disabled={l.locked}
                    style={{
                      display: "flex", alignItems: "center", gap: 10, width: "100%",
                      padding: "10px 12px", marginBottom: 6, borderRadius: 10, textAlign: "left",
                      border: "1px solid var(--line)", cursor: l.locked ? "not-allowed" : "pointer",
                      background: isActive ? "var(--accent-soft, #eef)" : "transparent",
                      opacity: l.locked ? 0.55 : 1,
                    }}
                  >
                    <span style={{ color: done ? "#1a7f46" : "var(--muted)" }}>
                      {l.locked ? LockIcon : done ? CheckIcon : PlayIcon}
                    </span>
                    <span style={{ flex: 1, minWidth: 0, fontSize: 14 }}>{l.title}</span>
                    {l.isPreview && <span className="badge learning" style={{ fontSize: 10 }}>Free</span>}
                    {l.durationSec ? <span className="ct-meta">{duration(l.durationSec)}</span> : null}
                  </button>
                );
              })}
            </div>
          ))}
          <Link className="ct-act" href="/courses">← Về khóa học của tôi</Link>
        </div>
      </div>
    </DashboardShell>
  );
}
