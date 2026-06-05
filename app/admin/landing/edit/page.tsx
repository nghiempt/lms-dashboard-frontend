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
  videoUrl: string | null;
  duration: string | null;
}
interface Chapter {
  id: string;
  label: string;
  name: string;
  description: string | null;
  lessons: Lesson[];
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
  tag: string | null;
  accessLabel: string;
  supportLabel: string;
  ctaUrl: string | null;
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
  const [course, setCourse] = useState<LandingCourse | null>(null);
  // card / header fields
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("VNĐ");
  const [featured, setFeatured] = useState(false);
  const [badge, setBadge] = useState("");
  const [features, setFeatures] = useState<string[]>([]);
  const [tag, setTag] = useState("");
  const [accessLabel, setAccessLabel] = useState("");
  const [supportLabel, setSupportLabel] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [chModalOpen, setChModalOpen] = useState(false);
  const [chLabel, setChLabel] = useState("");
  const [chName, setChName] = useState("");
  const [pendingDel, setPendingDel] = useState<PendingDelete | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    if (!courseId) return;
    const c = await api.get<LandingCourse>(`/admin/landing-courses/${courseId}`);
    setCourse(c);
    setTitle(c.title);
    setPrice(c.price);
    setCurrency(c.currency ?? "VNĐ");
    setFeatured(c.featured);
    setBadge(c.badge ?? "");
    setFeatures(Array.isArray(c.features) ? c.features : []);
    setTag(c.tag ?? "");
    setAccessLabel(c.accessLabel ?? "");
    setSupportLabel(c.supportLabel ?? "");
    setCtaUrl(c.ctaUrl ?? "");
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
  function patchChapterLocal(chId: string, field: keyof Chapter, value: unknown) {
    setCourse((c) => (!c ? c : { ...c, chapters: c.chapters.map((ch) => (ch.id === chId ? { ...ch, [field]: value } : ch)) }));
  }

  async function saveAll() {
    if (!course) return;
    if (!title.trim()) return toast.error("Tiêu đề khóa học không được để trống.");
    for (const ch of course.chapters) {
      if (!ch.name.trim()) return toast.error("Tên chương không được để trống.");
      for (const l of ch.lessons) {
        if (!l.title.trim()) return toast.error("Tên bài giảng không được để trống.");
      }
    }
    setSaving(true);
    try {
      // MỘT request atomic — BE ghi trong transaction.
      await api.patch(`/admin/landing-courses/${course.id}/tree`, {
        title: title.trim(),
        price: price.trim(),
        currency: currency.trim() || "VNĐ",
        featured,
        badge: badge.trim() || null,
        features: features.map((f) => f.trim()).filter(Boolean),
        tag: tag.trim() || null,
        accessLabel: accessLabel.trim(),
        supportLabel: supportLabel.trim(),
        ctaUrl: ctaUrl.trim() || null,
        chapters: course.chapters.map((ch) => ({
          id: ch.id,
          label: ch.label.trim(),
          name: ch.name.trim(),
          description: ch.description ?? "",
          lessons: ch.lessons.map((l) => ({
            id: l.id,
            title: l.title.trim(),
            videoUrl: l.videoUrl ?? "",
            duration: l.duration ?? "",
          })),
        })),
      });
      toast.success("Đã lưu nội dung Landing Page.");
      load();
    } catch (e) {
      toast.error((e as Error).message || "Lưu thất bại.");
    } finally {
      setSaving(false);
    }
  }

  async function addChapter() {
    if (!course) return;
    try {
      await api.post(`/admin/landing-courses/${course.id}/chapters`, {
        label: chLabel.trim() || "Chương mới",
        name: chName.trim() || `Chương ${course.chapters.length + 1}`,
      });
      setChLabel("");
      setChName("");
      setChModalOpen(false);
      load();
    } catch (e) {
      toast.error((e as Error).message || "Thêm chương thất bại.");
    }
  }
  async function addLesson(chId: string) {
    try {
      await api.post(`/admin/landing-courses/chapters/${chId}/lessons`, { title: "Bài giảng mới" });
      load();
    } catch (e) {
      toast.error((e as Error).message || "Thêm bài giảng thất bại.");
    }
  }
  async function confirmDelete() {
    if (!pendingDel) return;
    setDeleting(true);
    try {
      const path = pendingDel.kind === "chapter"
        ? `/admin/landing-courses/chapters/${pendingDel.id}`
        : `/admin/landing-courses/lessons/${pendingDel.id}`;
      await api.del(path);
      toast.success(pendingDel.kind === "chapter" ? "Đã xóa chương." : "Đã xóa bài giảng.");
      setPendingDel(null);
      load();
    } catch (e) {
      toast.error((e as Error).message || "Xóa thất bại.");
    } finally {
      setDeleting(false);
    }
  }

  if (!courseId) return <AdminShell title="Chỉnh sửa Landing Page" subtitle=""><div className="panel" style={{ padding: 24 }}>Thiếu mã khóa học. <Link href="/admin/landing">← Quay lại</Link></div></AdminShell>;

  if (!course) return <AdminShell title="Chỉnh sửa Landing Page" subtitle="Đang tải khóa học..."><PageLoader label="Đang tải khóa học..." /></AdminShell>;

  return (
    <AdminShell
      title="Chỉnh sửa Landing Page"
      subtitle={`${course.title} — nội dung hiển thị trên trang bán hàng.`}
      actions={<button className="btn-sm" type="button" onClick={saveAll} disabled={saving}>{saving ? "Đang lưu..." : "Lưu Landing Page"}</button>}
    >
      {/* ---------- CARD / GIÁ ---------- */}
      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-h"><h3>Thẻ giá (hiển thị trang chủ)</h3></div>
        <div className="cmeta">
          <div className="fwrap">
            <label className="flabel">Tên khóa học</label>
            <input className="fld" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="fwrap">
            <label className="flabel">Giá (hiển thị nguyên văn)</label>
            <input className="fld" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="VD: 5.890.000" />
          </div>
        </div>
        <div className="cmeta">
          <div className="fwrap">
            <label className="flabel">Đơn vị tiền</label>
            <input className="fld" value={currency} onChange={(e) => setCurrency(e.target.value)} placeholder="VNĐ" />
          </div>
          <div className="fwrap">
            <label className="flabel">Nhãn badge (để trống nếu không có)</label>
            <input className="fld" value={badge} onChange={(e) => setBadge(e.target.value)} placeholder="VD: Giới hạn mỗi tháng" />
          </div>
        </div>
        <div className="fwrap">
          <label className="flabel" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
            Đánh dấu là khóa nổi bật (featured)
          </label>
        </div>

        <div className="fwrap">
          <label className="flabel">Ưu điểm (mỗi dòng 1 ý — hiển thị dưới giá)</label>
          {features.map((f, i) => (
            <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <input
                className="fld"
                value={f}
                onChange={(e) => setFeatures((arr) => arr.map((x, j) => (j === i ? e.target.value : x)))}
                placeholder={`Ưu điểm ${i + 1}`}
              />
              <button className="icon-btn-sm ch-del" type="button" title="Xóa ưu điểm" onClick={() => setFeatures((arr) => arr.filter((_, j) => j !== i))}>{TrashIcon}</button>
            </div>
          ))}
          <button className="btn-add" type="button" onClick={() => setFeatures((arr) => [...arr, ""])}>{PlusIcon}Thêm ưu điểm</button>
        </div>
      </div>

      {/* ---------- HEADER TRANG CHI TIẾT ---------- */}
      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-h"><h3>Header trang chi tiết</h3></div>
        <div className="fwrap">
          <label className="flabel">Mô tả ngắn (tag)</label>
          <textarea className="fld" rows={2} value={tag} onChange={(e) => setTag(e.target.value)} />
        </div>
        <div className="cmeta">
          <div className="fwrap">
            <label className="flabel">Nhãn truy cập</label>
            <input className="fld" value={accessLabel} onChange={(e) => setAccessLabel(e.target.value)} placeholder="trọn đời" />
          </div>
          <div className="fwrap">
            <label className="flabel">Nhãn hỗ trợ</label>
            <input className="fld" value={supportLabel} onChange={(e) => setSupportLabel(e.target.value)} placeholder="1:1" />
          </div>
        </div>
        <div className="fwrap">
          <label className="flabel">Link nút "Tham gia khóa học"</label>
          <input className="fld" value={ctaUrl} onChange={(e) => setCtaUrl(e.target.value)} placeholder="https://..." />
        </div>
      </div>

      {/* ---------- CHƯƠNG & BÀI GIẢNG ---------- */}
      <div className="bld-h">
        <h3 style={{ fontSize: 17, fontWeight: 700 }}>Chương & bài giảng</h3>
        <button className="btn-sm" type="button" onClick={() => setChModalOpen(true)}>{PlusIcon}Thêm chương</button>
      </div>

      <div id="chapters">
        {course.chapters.map((ch, ci) => (
          <div key={ch.id} className="chapter">
            <div className="ch-h" style={{ gap: 8, flexWrap: "wrap" }}>
              <input className="fld" style={{ maxWidth: 150 }} value={ch.label} onChange={(e) => patchChapterLocal(ch.id, "label", e.target.value)} placeholder="Nhãn (Foundation)" />
              <input className="fld ch-title" value={ch.name} onChange={(e) => patchChapterLocal(ch.id, "name", e.target.value)} placeholder="Tên chương" />
              <div className="ch-act">
                <button className="btn-add" type="button" onClick={() => addLesson(ch.id)}>{PlusIcon}Bài giảng</button>
                <button className="icon-btn-sm ch-del" type="button" title="Xóa chương" onClick={() => setPendingDel({ kind: "chapter", id: ch.id, label: ch.name })}>{TrashIcon}</button>
              </div>
            </div>
            <div className="fwrap" style={{ padding: "0 12px 8px" }}>
              <input className="fld" value={ch.description ?? ""} onChange={(e) => patchChapterLocal(ch.id, "description", e.target.value)} placeholder="Mô tả chương (hiển thị trên LP)" />
            </div>
            <div className="lessons">
              {ch.lessons.map((l, li) => (
                <div key={l.id} className="lesson">
                  <div className="ls-h">
                    <span className="ls-no">{ci + 1}.{li + 1}</span>
                    <input className="fld ls-title" placeholder="Tên bài giảng" value={l.title} onChange={(e) => patchLessonLocal(ch.id, l.id, "title", e.target.value)} />
                    <button className="ls-del icon-btn-sm" type="button" title="Xóa bài" onClick={() => setPendingDel({ kind: "lesson", id: l.id, label: l.title })}>{TrashIcon}</button>
                  </div>
                  <div className="ls-meta" style={{ gridTemplateColumns: "2fr 1fr" }}>
                    <input
                      className="fld"
                      placeholder="URL video (YouTube / Bunny / mp4...)"
                      value={l.videoUrl ?? ""}
                      onChange={(e) => patchLessonLocal(ch.id, l.id, "videoUrl", e.target.value)}
                    />
                    <input
                      className="fld"
                      placeholder="Thời lượng (04:30)"
                      value={l.duration ?? ""}
                      onChange={(e) => patchLessonLocal(ch.id, l.id, "duration", e.target.value)}
                    />
                  </div>
                </div>
              ))}
              {ch.lessons.length === 0 && <div className="ct-meta" style={{ padding: 8 }}>Chưa có bài giảng.</div>}
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={!!pendingDel}
        title={pendingDel?.kind === "chapter" ? "Xóa chương?" : "Xóa bài giảng?"}
        message={
          pendingDel?.kind === "chapter"
            ? <>Xóa chương <b>{pendingDel?.label || "này"}</b> sẽ xóa toàn bộ bài giảng bên trong. Hành động này không thể hoàn tác.</>
            : <>Bạn có chắc muốn xóa bài giảng <b>{pendingDel?.label || "này"}</b>? Hành động này không thể hoàn tác.</>
        }
        confirmLabel="Xóa"
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDel(null)}
      />

      <div className={"modal-ov" + (chModalOpen ? " open" : "")} onClick={(e) => e.target === e.currentTarget && setChModalOpen(false)}>
        <div className="modal">
          <h3>Thêm chương mới</h3>
          <div className="fwrap" style={{ marginBottom: 12 }}>
            <label className="flabel">Nhãn cover</label>
            <input className="fld" placeholder="VD: Foundation" value={chLabel} onChange={(e) => setChLabel(e.target.value)} />
          </div>
          <div className="fwrap" style={{ marginBottom: 16 }}>
            <label className="flabel">Tên chương</label>
            <input className="fld" placeholder={`Chương ${(course?.chapters.length ?? 0) + 1}`} value={chName} onChange={(e) => setChName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addChapter()} />
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

export default function LandingEditPage() {
  return (
    <Suspense fallback={null}>
      <EditInner />
    </Suspense>
  );
}
