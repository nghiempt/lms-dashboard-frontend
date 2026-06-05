"use client";

import { useEffect, useRef, useState } from "react";
import AdminShell from "../../components/AdminShell";
import ConfirmDialog from "../../components/ConfirmDialog";
import { Spinner } from "../../components/Loaders";
import { useToast } from "../../components/Toast";
import { api, uploadMedia } from "@/lib/api";
import { fileSize, prettyFileType } from "@/lib/format";

const GRID = "2fr 0.8fr 0.9fr 1.2fr 0.7fr 1fr 80px";

interface DocRow {
  id: string;
  title: string;
  fileType: string | null;
  url: string | null;
  sizeBytes: number | null;
  downloadCount: number;
  course: { id: string; title: string } | null;
}
interface CourseOpt { id: string; title: string }

const FileSvg = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /></svg>
);
const TrashSvg = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /></svg>
);
const OpenSvg = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><path d="M15 3h6v6M10 14 21 3" /></svg>
);

const MAX_UPLOAD_BYTES = 500 * 1024 * 1024; // 500MB như UI ghi

export default function AdminResourcesPage() {
  const toast = useToast();
  const [rows, setRows] = useState<DocRow[]>([]);
  const [courses, setCourses] = useState<CourseOpt[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [picked, setPicked] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [courseId, setCourseId] = useState("");
  const [delRow, setDelRow] = useState<DocRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function load() {
    setLoading(true);
    setLoadError("");
    api.getFull<DocRow[]>("/documents/admin", { limit: 100 })
      .then((r) => setRows(r.data ?? []))
      .catch((e) => setLoadError((e as Error).message || "Không tải được tài liệu."))
      .finally(() => setLoading(false));
  }
  useEffect(() => {
    load();
    api.getFull<CourseOpt[]>("/courses", { limit: 100 }).then((r) => setCourses(r.data ?? [])).catch(() => undefined);
  }, []);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > MAX_UPLOAD_BYTES) {
      toast.error("File vượt quá 500MB.");
      e.target.value = "";
      return;
    }
    setPicked(f);
    if (!name) setName(f.name);
  }

  async function upload() {
    if (!picked) return;
    setBusy(true);
    try {
      const form = new FormData();
      form.append("file", picked);
      form.append("folder", "documents");
      form.append("type", "DOCUMENT");
      const media = await uploadMedia(form); // qua api wrapper: refresh 401 + guard JSON
      if (!media?.id) throw new Error("Tải file lên thất bại.");
      await api.post("/documents", {
        title: name || picked.name,
        kind: "FILE",
        mediaId: media.id,
        url: media.url,
        fileType: type || picked.type || "FILE",
        sizeBytes: picked.size,
        courseId: courseId || undefined,
        isPublic: true,
      });
      setModalOpen(false);
      setPicked(null); setName(""); setType(""); setCourseId("");
      toast.success("Đã tải lên tài liệu.");
      load();
    } catch (e) {
      toast.error((e as Error).message || "Tải lên thất bại.");
    } finally {
      setBusy(false);
    }
  }

  async function confirmDelete() {
    if (!delRow) return;
    setDeleting(true);
    try {
      await api.del(`/documents/${delRow.id}`);
      toast.success("Đã xóa tài liệu.");
      setDelRow(null);
      load();
    } catch (e) {
      toast.error((e as Error).message || "Xóa thất bại.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <AdminShell
      title="Kho tài liệu"
      subtitle="Quản lý tài nguyên & tài liệu khóa học."
      actions={
        <a className="btn-sm" href="#" onClick={(e) => { e.preventDefault(); setModalOpen(true); }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
          Tải lên tài liệu
        </a>
      }
    >
      <div className="panel">
        <div className="panel-h">
          <h3>Tất cả tài liệu</h3>
          <span className="sub">{rows.length} tài liệu</span>
        </div>
        <div className="atbl-h" style={{ gridTemplateColumns: GRID }}>
          <div>Tên tài liệu</div><div>Loại</div><div>Dung lượng</div><div>Thuộc khóa</div><div>Lượt tải</div><div>Liên kết</div><div />
        </div>
        {loadError && (
          <div className="list-error">
            <span>{loadError}</span>
            <button type="button" className="retry" onClick={load}>Thử lại</button>
          </div>
        )}
        {loading && !loadError && [0, 1, 2].map((i) => <div key={i} className="skeleton-row" />)}
        {rows.map((row) => (
          <div key={row.id} className="atbl-r" style={{ gridTemplateColumns: GRID }}>
            <div className="a-name"><div className="a-ic"><FileSvg /></div><div className="a-nm">{row.title}</div></div>
            <div><span className="ftype-chip">{prettyFileType(row.fileType, row.url || row.title)}</span></div>
            <div className="a-sub" style={{ fontSize: 13, color: "var(--muted)" }}>{fileSize(row.sizeBytes)}</div>
            <div className="a-sub" style={{ fontSize: 13, color: "var(--muted)" }}>{row.course?.title ?? "Tất cả khóa"}</div>
            <div className="a-nm">{row.downloadCount} tải</div>
            <div>
              {row.url ? (
                <a className="doc-link" href={row.url} target="_blank" rel="noopener noreferrer">
                  <OpenSvg /> Mở file
                </a>
              ) : (
                <span className="a-sub" style={{ fontSize: 13, color: "var(--muted-2)" }}>—</span>
              )}
            </div>
            <div className="a-act">
              <button type="button" className="del" aria-label="Xóa" onClick={() => setDelRow(row)}><TrashSvg /></button>
            </div>
          </div>
        ))}
        {!loading && !loadError && rows.length === 0 && <div className="ct-meta" style={{ padding: 12 }}>Chưa có tài liệu.</div>}
      </div>

      <ConfirmDialog
        open={!!delRow}
        title="Xóa tài liệu?"
        message={<>Bạn có chắc muốn xóa <b>{delRow?.title}</b>? Hành động này không thể hoàn tác.</>}
        confirmLabel="Xóa"
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDelRow(null)}
      />

      <div className={"modal-ov" + (modalOpen ? " open" : "")} onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}>
        <div className="modal modal-form">
          <div className="mf-head">
            <h3>Tải lên tài liệu</h3>
            <button type="button" className="mf-x" onClick={() => setModalOpen(false)}>✕</button>
          </div>
          <div className="dz" onClick={() => fileRef.current?.click()}>
            <div className="dz-ic">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="M17 8l-5-5-5 5" /><path d="M12 3v12" /></svg>
            </div>
            <div className="dz-t">{picked ? picked.name : "Bấm để chọn file"}</div>
            <div className="dz-s">{picked ? fileSize(picked.size) + " · đã chọn" : "PDF, ZIP, LUT, Preset... tối đa 500MB"}</div>
            <input ref={fileRef} type="file" style={{ display: "none" }} onChange={onFile} />
          </div>
          <div className="fwrap">
            <label className="flabel">Tên tài liệu</label>
            <input className="fld" value={name} onChange={(e) => setName(e.target.value)} placeholder="VD: Cinematic LUT Pack..." />
          </div>
          <div className="mf-row">
            <div className="fwrap">
              <label className="flabel">Loại file</label>
              <input className="fld" value={type} onChange={(e) => setType(e.target.value)} placeholder="VD: PDF, LUT · .cube..." />
            </div>
            <div className="fwrap">
              <label className="flabel">Thuộc khóa</label>
              <select className="fld" value={courseId} onChange={(e) => setCourseId(e.target.value)}>
                <option value="">Tất cả khóa</option>
                {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
          </div>
          <div className="modal-act">
            <button type="button" className="btn-sec" onClick={() => setModalOpen(false)}>Hủy</button>
            <button type="button" className="btn-danger" disabled={!picked || !name.trim() || busy} onClick={upload}>
              {busy ? <><Spinner size={14} /> Đang tải...</> : "Tải lên"}
            </button>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
