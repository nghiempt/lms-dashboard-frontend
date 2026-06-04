"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import AdminShell from "../../components/AdminShell";
import { useToast } from "../../components/Toast";
import { api } from "@/lib/api";
import { compactVnd, vnd } from "@/lib/format";

const GRID = "2.4fr 1.1fr 1fr 1.2fr 1fr 90px";

interface CourseRow {
  id: string;
  title: string;
  shortCode: string | null;
  price: string;
  status: string;
  chapterCount: number;
  lessonCount: number;
  studentsCount: number;
  revenue: number;
}

const STATUS: Record<string, { cls: string; label: string }> = {
  PUBLISHED: { cls: "active", label: "Đang bán" },
  DRAFT: { cls: "hidden2", label: "Nháp" },
  ARCHIVED: { cls: "hidden2", label: "Ẩn" },
};

function AdminCoursesInner() {
  const router = useRouter();
  const toast = useToast();
  const searchParams = useSearchParams();
  const q = searchParams.get("search") ?? "";
  const [rows, setRows] = useState<CourseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [delId, setDelId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const titleRef = useRef<HTMLInputElement>(null);
  const priceRef = useRef<HTMLInputElement>(null);
  const statusRef = useRef<HTMLSelectElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);

  function load() {
    setLoading(true);
    setLoadError("");
    api.getFull<CourseRow[]>("/courses", { limit: 100, search: q || undefined })
      .then((r) => setRows(r.data ?? []))
      .catch((e) => setLoadError((e as Error).message || "Không tải được khóa học."))
      .finally(() => setLoading(false));
  }
  // tải lại khi từ khóa tìm kiếm trên topbar thay đổi
  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [q]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setModalOpen(false); setDelId(null); } };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  async function handleCreate() {
    const title = (titleRef.current?.value ?? "").trim();
    if (!title) {
      toast.error("Vui lòng nhập tên khóa học.");
      titleRef.current?.focus();
      return;
    }
    const price = Number((priceRef.current?.value ?? "0").replace(/\D/g, "")) || 0;
    const status = statusRef.current?.value === "Ẩn" ? "DRAFT" : "PUBLISHED";
    setSaving(true);
    try {
      await api.post("/courses", {
        title,
        price,
        pricing: price > 0 ? "PAID" : "FREE",
        status,
        description: descRef.current?.value ?? "",
      });
      setModalOpen(false);
      toast.success("Đã tạo khóa học.");
      load();
    } catch (e) {
      // không nuốt lỗi: modal vẫn mở để người dùng thử lại
      toast.error((e as Error).message || "Tạo khóa học thất bại.");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!delId) return;
    setDeleting(true);
    try {
      await api.del(`/courses/${delId}`);
      toast.success("Đã xóa khóa học.");
      setDelId(null);
      load();
    } catch (e) {
      toast.error((e as Error).message || "Xóa thất bại.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <AdminShell
      title="Quản lý khóa học"
      subtitle="Thêm, sửa và quản lý các khóa học."
      actions={
        <a className="btn-sm" href="#" onClick={(e) => { e.preventDefault(); setModalOpen(true); }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
          Thêm khóa học
        </a>
      }
    >
      <div className="panel">
        <div className="panel-h">
          <h3>Tất cả khóa học</h3>
          <span className="sub">
            {q ? <>Kết quả cho “{q}” · {rows.length} khóa · <Link href="/admin/courses">Xóa lọc</Link></> : `${rows.length} khóa`}
          </span>
        </div>
        <div className="atbl-h" style={{ gridTemplateColumns: GRID }}>
          <div>Khóa học</div><div>Giá</div><div>Học viên</div><div>Doanh thu</div><div>Trạng thái</div><div />
        </div>
        {loadError && (
          <div className="list-error">
            <span>{loadError}</span>
            <button type="button" className="retry" onClick={load}>Thử lại</button>
          </div>
        )}
        {loading && !loadError && [0, 1, 2].map((i) => <div key={i} className="skeleton-row" />)}
        {rows.map((row) => {
          const st = STATUS[row.status] ?? STATUS.DRAFT;
          return (
            <div key={row.id} className="atbl-r" style={{ gridTemplateColumns: GRID }}>
              <div className="a-name">
                <div className="a-thumb">{row.shortCode ?? row.title.slice(0, 2).toUpperCase()}</div>
                <div>
                  <div className="a-nm">{row.title}</div>
                  <div className="a-sub">{row.chapterCount} chương · {row.lessonCount} bài</div>
                </div>
              </div>
              <div className="price">{vnd(row.price)}đ</div>
              <div className="a-nm">{row.studentsCount}</div>
              <div className="price">{compactVnd(row.revenue)}</div>
              <div><span className={"badge " + st.cls}>{st.label}</span></div>
              <div className="a-act">
                <button type="button" onClick={() => router.push(`/admin/courses/edit?id=${row.id}`)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4z" /></svg>
                </button>
                <button type="button" className="del" onClick={() => setDelId(row.id)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /></svg>
                </button>
              </div>
            </div>
          );
        })}
        {!loading && !loadError && rows.length === 0 && <div className="ct-meta" style={{ padding: 12 }}>Chưa có khóa học.</div>}
      </div>

      {/* Add Course Modal */}
      <div className={"modal-ov" + (modalOpen ? " open" : "")} onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}>
        <div className="modal modal-form">
          <div className="mf-head">
            <h3>Thêm khóa học</h3>
            <button type="button" className="mf-x" onClick={() => setModalOpen(false)}>✕</button>
          </div>
          <div className="fwrap">
            <label className="flabel">Tên khóa học</label>
            <input ref={titleRef} className="fld" placeholder="VD: Khóa Premium..." />
          </div>
          <div className="mf-row">
            <div className="fwrap">
              <label className="flabel">Giá (VND)</label>
              <input ref={priceRef} className="fld" placeholder="VD: 5890000" />
            </div>
            <div className="fwrap">
              <label className="flabel">Trạng thái</label>
              <select ref={statusRef} className="fld"><option>Đang bán</option><option>Ẩn</option></select>
            </div>
          </div>
          <div className="fwrap">
            <label className="flabel">Mô tả</label>
            <textarea ref={descRef} className="fld" rows={3} placeholder="Mô tả ngắn..." />
          </div>
          <div className="modal-act">
            <button type="button" className="btn-sec" onClick={() => setModalOpen(false)}>Hủy</button>
            <button type="button" className="btn-danger" disabled={saving} onClick={handleCreate}>{saving ? "Đang tạo..." : "Tạo khóa học"}</button>
          </div>
        </div>
      </div>

      {/* Delete confirm */}
      <div className={"modal-ov" + (delId ? " open" : "")} onClick={(e) => e.target === e.currentTarget && setDelId(null)}>
        <div className="modal">
          <h3>Xóa khóa học?</h3>
          <p>Hành động này không thể hoàn tác.</p>
          <div className="modal-act">
            <button type="button" className="btn-sec" onClick={() => setDelId(null)} disabled={deleting}>Hủy</button>
            <button type="button" className="btn-danger" onClick={confirmDelete} disabled={deleting}>{deleting ? "Đang xóa..." : "Xóa"}</button>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

export default function AdminCoursesPage() {
  return (
    <Suspense fallback={null}>
      <AdminCoursesInner />
    </Suspense>
  );
}
