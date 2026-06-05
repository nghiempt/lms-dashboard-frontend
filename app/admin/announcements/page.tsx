"use client";

import { useEffect, useState } from "react";
import AdminShell from "../../components/AdminShell";
import ConfirmDialog from "../../components/ConfirmDialog";
import { Spinner } from "../../components/Loaders";
import { useToast } from "../../components/Toast";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/format";

interface Noti {
  id: string;
  title: string;
  body: string;
  scope: string;
  courseId: string | null;
  status: string;
  sentAt: string | null;
  createdAt: string;
  _count: { recipients: number };
}
interface CourseOpt { id: string; title: string }

const COLS = "2.2fr 1.3fr 1fr 1fr 110px";

const EditIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4z" /></svg>
);
const DelIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /></svg>
);

export default function AnnouncementsPage() {
  const toast = useToast();
  const [rows, setRows] = useState<Noti[]>([]);
  const [courses, setCourses] = useState<CourseOpt[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [target, setTarget] = useState("ALL"); // "ALL" | courseId
  const [sending, setSending] = useState(false);
  const [edit, setEdit] = useState<Noti | null>(null);
  const [eTitle, setETitle] = useState("");
  const [eBody, setEBody] = useState("");
  const [delRow, setDelRow] = useState<Noti | null>(null);
  const [deleting, setDeleting] = useState(false);

  function load() {
    setLoading(true);
    setLoadError("");
    api.getFull<Noti[]>("/notifications/admin", { limit: 100 })
      .then((r) => setRows(r.data ?? []))
      .catch((e) => setLoadError((e as Error).message || "Không tải được thông báo."))
      .finally(() => setLoading(false));
  }
  useEffect(() => {
    load();
    api.getFull<CourseOpt[]>("/courses", { limit: 100 }).then((r) => setCourses(r.data ?? [])).catch(() => undefined);
  }, []);

  function payload(asDraft: boolean) {
    const isAll = target === "ALL";
    return {
      title: title.trim(),
      body: body.trim(),
      type: "SYSTEM",
      scope: isAll ? "ALL" : "COURSE",
      courseId: isAll ? undefined : target,
      asDraft,
    };
  }

  const formValid = title.trim().length > 0 && body.trim().length > 0;

  async function send(asDraft: boolean) {
    if (!title.trim()) return toast.error("Vui lòng nhập tiêu đề.");
    if (!body.trim()) return toast.error("Vui lòng nhập nội dung.");
    setSending(true);
    try {
      await api.post("/notifications/send", payload(asDraft));
      // chỉ clear form & báo thành công khi API thực sự thành công
      setTitle(""); setBody(""); setTarget("ALL");
      toast.success(asDraft ? "Đã lưu nháp." : "Đã gửi thông báo.");
      load();
    } catch (e) {
      toast.error((e as Error).message || "Gửi thông báo thất bại.");
    } finally {
      setSending(false);
    }
  }

  async function sendDraft(id: string) {
    try {
      await api.post(`/notifications/admin/${id}/send`);
      toast.success("Đã gửi thông báo.");
      load();
    } catch (e) {
      toast.error((e as Error).message || "Gửi thất bại.");
    }
  }
  async function confirmDelete() {
    if (!delRow) return;
    setDeleting(true);
    try {
      await api.del(`/notifications/admin/${delRow.id}`);
      toast.success("Đã xóa thông báo.");
      setDelRow(null);
      load();
    } catch (e) {
      toast.error((e as Error).message || "Xóa thất bại.");
    } finally {
      setDeleting(false);
    }
  }
  async function saveEdit() {
    if (!edit) return;
    if (!eTitle.trim() || !eBody.trim()) return toast.error("Tiêu đề và nội dung không được để trống.");
    try {
      await api.patch(`/notifications/admin/${edit.id}`, { title: eTitle, body: eBody });
      toast.success("Đã cập nhật thông báo.");
      setEdit(null);
      load();
    } catch (e) {
      toast.error((e as Error).message || "Cập nhật thất bại.");
    }
  }

  const targetLabel = (n: Noti) =>
    n.scope === "ALL" ? "Tất cả học viên" : courses.find((c) => c.id === n.courseId)?.title ?? "Theo khóa";

  return (
    <AdminShell title="Quản lý thông báo" subtitle="Tạo, gửi và quản lý thông báo tới học viên.">
      <div className="ann-grid">
        <div className="panel" style={{ alignSelf: "start" }}>
          <div className="panel-h"><h3>Tạo thông báo</h3></div>
          <div className="fwrap">
            <label className="flabel">Tiêu đề</label>
            <input className="fld" placeholder="VD: Bài giảng mới..." value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="fwrap">
            <label className="flabel">Nội dung</label>
            <textarea className="fld" rows={4} placeholder="Nội dung gửi tới học viên..." value={body} onChange={(e) => setBody(e.target.value)} />
          </div>
          <div className="fwrap">
            <label className="flabel">Gửi tới</label>
            <select className="fld" value={target} onChange={(e) => setTarget(e.target.value)}>
              <option value="ALL">Tất cả học viên</option>
              {courses.map((c) => <option key={c.id} value={c.id}>Khóa: {c.title}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn-sm" style={{ flex: 1, justifyContent: "center" }} type="button" disabled={sending || !formValid} onClick={() => send(false)}>
              {sending ? <><Spinner size={14} /> Đang gửi...</> : "Gửi thông báo"}
            </button>
            <button className="fld" style={{ width: "auto", fontWeight: 600, cursor: "pointer", opacity: sending || !formValid ? 0.55 : 1 }} type="button" disabled={sending || !formValid} onClick={() => send(true)}>
              Lưu nháp
            </button>
          </div>
        </div>

        <div className="panel">
          <div className="panel-h">
            <h3>Thông báo đã tạo</h3>
            <span className="sub">{rows.length} thông báo</span>
          </div>
          <div className="atbl-h" style={{ gridTemplateColumns: COLS }}>
            <div>Tiêu đề</div><div>Đối tượng</div><div>Ngày gửi</div><div>Trạng thái</div><div />
          </div>
          {loadError && (
            <div className="list-error">
              <span>{loadError}</span>
              <button type="button" className="retry" onClick={load}>Thử lại</button>
            </div>
          )}
          {loading && !loadError && [0, 1, 2].map((i) => <div key={i} className="skeleton-row" />)}
          {rows.map((n) => (
            <div key={n.id} className="atbl-r" style={{ gridTemplateColumns: COLS }}>
              <div className="a-nm">{n.title}</div>
              <div className="a-sub" style={{ fontSize: 13, color: "var(--muted)" }}>{targetLabel(n)} · {n._count.recipients} người</div>
              <div className="a-sub" style={{ fontSize: 13, color: "var(--muted)" }}>{n.sentAt ? formatDate(n.sentAt) : "—"}</div>
              <div><span className={"badge " + (n.status === "SENT" ? "done" : "hidden2")}>{n.status === "SENT" ? "Đã gửi" : "Nháp"}</span></div>
              <div className="a-act">
                {n.status === "DRAFT" && (
                  <button type="button" title="Gửi" onClick={() => sendDraft(n.id)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l18-5v12L3 14v-3z" /></svg>
                  </button>
                )}
                {n.status === "DRAFT" && (
                  <button type="button" title="Sửa" onClick={() => { setEdit(n); setETitle(n.title); setEBody(n.body); }}>{EditIcon}</button>
                )}
                <button className="del" type="button" title="Xóa" onClick={() => setDelRow(n)}>{DelIcon}</button>
              </div>
            </div>
          ))}
          {!loading && !loadError && rows.length === 0 && <div className="ct-meta" style={{ padding: 12 }}>Chưa có thông báo.</div>}
        </div>
      </div>

      <ConfirmDialog
        open={!!delRow}
        title="Xóa thông báo?"
        message={<>Bạn có chắc muốn xóa <b>{delRow?.title}</b>? Hành động này không thể hoàn tác.</>}
        confirmLabel="Xóa"
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDelRow(null)}
      />

      <div className={"modal-ov" + (edit ? " open" : "")} onClick={(e) => e.target === e.currentTarget && setEdit(null)}>
        <div className="modal">
          <div className="panel-h" style={{ marginBottom: 16 }}>
            <h3>Chỉnh sửa thông báo</h3>
            <button type="button" className="icon-btn" onClick={() => setEdit(null)} aria-label="Đóng">✕</button>
          </div>
          <div className="fwrap"><label className="flabel">Tiêu đề</label><input className="fld" value={eTitle} onChange={(e) => setETitle(e.target.value)} /></div>
          <div className="fwrap"><label className="flabel">Nội dung</label><textarea className="fld" rows={4} value={eBody} onChange={(e) => setEBody(e.target.value)} /></div>
          <div className="modal-act">
            <button className="btn-sec" type="button" onClick={() => setEdit(null)}>Hủy</button>
            <button className="btn-sm" type="button" disabled={!eTitle.trim() || !eBody.trim()} onClick={saveEdit}>Lưu</button>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
