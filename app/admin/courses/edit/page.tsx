"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import AdminShell from "../../../components/AdminShell";
import ConfirmDialog from "../../../components/ConfirmDialog";
import { PageLoader } from "../../../components/Loaders";
import { useToast } from "../../../components/Toast";
import { api } from "@/lib/api";

interface Lesson {
  id: string;
  title: string;
  videoSource: "BUNNY" | "YOUTUBE";
  bunnyVideoId: string | null;
  videoUrl: string | null;
  isPreview: boolean;
  level: "BASIC" | "ADVANCED";
  isLocked: boolean;
}
interface Chapter { id: string; title: string; lessons: Lesson[] }
interface CourseTree {
  id: string;
  title: string;
  price: string;
  description: string | null;
  chapters: Chapter[];
}

const TrashIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /></svg>
);
const PlusIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
);

interface PendingDelete {
  kind: "chapter" | "lesson";
  id: string;
  label: string;
}

function EditInner() {
  const toast = useToast();
  const courseId = useSearchParams().get("id") ?? "";
  const [course, setCourse] = useState<CourseTree | null>(null);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [desc, setDesc] = useState("");
  const [saving, setSaving] = useState(false);
  const [chModalOpen, setChModalOpen] = useState(false);
  const [chTitle, setChTitle] = useState("");
  const [pendingDel, setPendingDel] = useState<PendingDelete | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    if (!courseId) return;
    const c = await api.get<CourseTree>(`/courses/${courseId}`);
    setCourse(c);
    setTitle(c.title);
    setPrice(String(Number(c.price)));
    setDesc(c.description ?? "");
  }, [courseId]);

  useEffect(() => {
    load().catch((e) => toast.error((e as Error).message || "Không tải được khóa học."));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load]);

  function patchLessonLocal(chId: string, lsId: string, field: keyof Lesson, value: unknown) {
    setCourse((c) =>
      !c ? c : {
        ...c,
        chapters: c.chapters.map((ch) =>
          ch.id !== chId ? ch : { ...ch, lessons: ch.lessons.map((l) => (l.id === lsId ? { ...l, [field]: value } : l)) },
        ),
      },
    );
  }
  function patchChapterTitleLocal(chId: string, value: string) {
    setCourse((c) => (!c ? c : { ...c, chapters: c.chapters.map((ch) => (ch.id === chId ? { ...ch, title: value } : ch)) }));
  }

  async function saveAll() {
    if (!course) return;
    // Validate phía client trước khi gửi
    if (!title.trim()) return toast.error("Tiêu đề khóa học không được để trống.");
    for (const ch of course.chapters) {
      if (!ch.title.trim()) return toast.error("Tên chương không được để trống.");
      for (const l of ch.lessons) {
        if (!l.title.trim()) return toast.error("Tên bài học không được để trống.");
      }
    }
    setSaving(true);
    try {
      // MỘT request atomic — BE ghi trong transaction, không còn N+1 ghi dở.
      await api.patch(`/courses/${course.id}/tree`, {
        title: title.trim(),
        price: Number(price.replace(/\D/g, "")) || 0,
        description: desc,
        chapters: course.chapters.map((ch) => ({
          id: ch.id,
          title: ch.title.trim(),
          lessons: ch.lessons.map((l) => ({
            id: l.id,
            title: l.title.trim(),
            videoSource: l.videoSource,
            bunnyVideoId: l.videoSource === "BUNNY" ? l.bunnyVideoId : null,
            videoUrl: l.videoSource === "YOUTUBE" ? l.videoUrl : null,
            level: l.level,
            isPreview: l.isPreview,
            isLocked: l.isLocked,
          })),
        })),
      });
      toast.success("Đã lưu khóa học.");
    } catch (e) {
      toast.error((e as Error).message || "Lưu thất bại.");
    } finally {
      setSaving(false);
    }
  }

  async function addChapter() {
    if (!course) return;
    try {
      await api.post(`/courses/${course.id}/chapters`, { title: chTitle.trim() || `Chương ${course.chapters.length + 1}` });
      setChTitle("");
      setChModalOpen(false);
      load();
    } catch (e) {
      toast.error((e as Error).message || "Thêm chương thất bại.");
    }
  }
  async function addLesson(chId: string) {
    try {
      await api.post(`/courses/chapters/${chId}/lessons`, { title: "Bài học mới" });
      load();
    } catch (e) {
      toast.error((e as Error).message || "Thêm bài học thất bại.");
    }
  }
  async function confirmDelete() {
    if (!pendingDel) return;
    setDeleting(true);
    try {
      const path = pendingDel.kind === "chapter"
        ? `/courses/chapters/${pendingDel.id}`
        : `/courses/lessons/${pendingDel.id}`;
      await api.del(path);
      toast.success(pendingDel.kind === "chapter" ? "Đã xóa chương." : "Đã xóa bài học.");
      setPendingDel(null);
      load();
    } catch (e) {
      toast.error((e as Error).message || "Xóa thất bại.");
    } finally {
      setDeleting(false);
    }
  }

  if (!courseId) return <AdminShell title="Chỉnh sửa khóa học" subtitle=""><div className="panel" style={{ padding: 24 }}>Thiếu mã khóa học. <Link href="/admin/courses">← Quay lại</Link></div></AdminShell>;

  if (!course) return <AdminShell title="Chỉnh sửa khóa học" subtitle="Đang tải khóa học..."><PageLoader label="Đang tải khóa học..." /></AdminShell>;

  return (
    <AdminShell
      title="Chỉnh sửa khóa học"
      subtitle={`${course.title} — quản lý chương, bài học & video.`}
      actions={<button className="btn-sm" type="button" onClick={saveAll} disabled={saving}>{saving ? "Đang lưu..." : "Lưu khóa học"}</button>}
    >
      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-h"><h3>Thông tin khóa học</h3></div>
        <div className="cmeta">
          <div className="fwrap">
            <label className="flabel">Tiêu đề khóa học</label>
            <input className="fld" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="fwrap">
            <label className="flabel">Giá (VNĐ)</label>
            <input className="fld" value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
        </div>
        <div className="fwrap">
          <label className="flabel">Mô tả ngắn</label>
          <textarea className="fld" rows={2} value={desc} onChange={(e) => setDesc(e.target.value)} />
        </div>
      </div>

      <div className="bld-h">
        <h3 style={{ fontSize: 17, fontWeight: 700 }}>Chương & bài học</h3>
        <button className="btn-sm" type="button" onClick={() => setChModalOpen(true)}>{PlusIcon}Thêm chương</button>
      </div>

      <div id="chapters">
        {course?.chapters.map((ch, ci) => (
          <div key={ch.id} className="chapter">
            <div className="ch-h">
              <input className="fld ch-title" value={ch.title} onChange={(e) => patchChapterTitleLocal(ch.id, e.target.value)} />
              <div className="ch-act">
                <button className="btn-add" type="button" onClick={() => addLesson(ch.id)}>{PlusIcon}Bài học</button>
                <button className="icon-btn-sm ch-del" type="button" title="Xóa chương" onClick={() => setPendingDel({ kind: "chapter", id: ch.id, label: ch.title })}>{TrashIcon}</button>
              </div>
            </div>
            <div className="lessons">
              {ch.lessons.map((l, li) => (
                <div key={l.id} className="lesson">
                  <div className="ls-h">
                    <span className="ls-no">{ci + 1}.{li + 1}</span>
                    <input className="fld ls-title" placeholder="Tên bài học" value={l.title} onChange={(e) => patchLessonLocal(ch.id, l.id, "title", e.target.value)} />
                    <button className="ls-del icon-btn-sm" type="button" title="Xóa bài" onClick={() => setPendingDel({ kind: "lesson", id: l.id, label: l.title })}>{TrashIcon}</button>
                  </div>
                  <div className="ls-meta">
                    <select className="fld" value={l.videoSource} onChange={(e) => patchLessonLocal(ch.id, l.id, "videoSource", e.target.value)}>
                      <option value="YOUTUBE">YouTube</option>
                      <option value="BUNNY">Bunny</option>
                    </select>
                    <input
                      className="fld"
                      placeholder="Video ID / URL"
                      value={(l.videoSource === "YOUTUBE" ? l.videoUrl : l.bunnyVideoId) ?? ""}
                      onChange={(e) => patchLessonLocal(ch.id, l.id, l.videoSource === "YOUTUBE" ? "videoUrl" : "bunnyVideoId", e.target.value)}
                    />
                    <select className="fld" value={l.isPreview ? "free" : "paid"} onChange={(e) => patchLessonLocal(ch.id, l.id, "isPreview", e.target.value === "free")}>
                      <option value="free">Miễn phí</option>
                      <option value="paid">Có phí</option>
                    </select>
                    <select className="fld" value={l.level} onChange={(e) => patchLessonLocal(ch.id, l.id, "level", e.target.value)}>
                      <option value="BASIC">Cơ bản</option>
                      <option value="ADVANCED">Nâng cao</option>
                    </select>
                    <select className="fld" value={l.isLocked ? "lock" : "open"} onChange={(e) => patchLessonLocal(ch.id, l.id, "isLocked", e.target.value === "lock")}>
                      <option value="open">Mở khóa</option>
                      <option value="lock">Khóa</option>
                    </select>
                  </div>
                </div>
              ))}
              {ch.lessons.length === 0 && <div className="ct-meta" style={{ padding: 8 }}>Chưa có bài học.</div>}
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={!!pendingDel}
        title={pendingDel?.kind === "chapter" ? "Xóa chương?" : "Xóa bài học?"}
        message={
          pendingDel?.kind === "chapter"
            ? <>Xóa chương <b>{pendingDel?.label || "này"}</b> sẽ xóa toàn bộ bài học bên trong. Hành động này không thể hoàn tác.</>
            : <>Bạn có chắc muốn xóa bài học <b>{pendingDel?.label || "này"}</b>? Hành động này không thể hoàn tác.</>
        }
        confirmLabel="Xóa"
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDel(null)}
      />

      <div className={"modal-ov" + (chModalOpen ? " open" : "")} onClick={(e) => e.target === e.currentTarget && setChModalOpen(false)}>
        <div className="modal">
          <h3>Thêm chương mới</h3>
          <div className="fwrap" style={{ marginBottom: 16 }}>
            <label className="flabel">Tên chương</label>
            <input className="fld" placeholder={`Chương ${(course?.chapters.length ?? 0) + 1}`} value={chTitle} onChange={(e) => setChTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addChapter()} />
          </div>
          <div className="modal-act">
            <button className="btn-sec" type="button" onClick={() => setChModalOpen(false)}>Hủy</button>
            <button className="btn-sm" type="button" onClick={addChapter}>Tạo chương</button>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

export default function CourseEditPage() {
  return (
    <Suspense fallback={null}>
      <EditInner />
    </Suspense>
  );
}
