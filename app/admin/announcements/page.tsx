"use client";

import { useEffect, useState } from "react";
import AdminShell from "../../components/AdminShell";
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
  const [rows, setRows] = useState<Noti[]>([]);
  const [courses, setCourses] = useState<CourseOpt[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [target, setTarget] = useState("ALL"); // "ALL" | courseId
  const [msg, setMsg] = useState("");
  const [edit, setEdit] = useState<Noti | null>(null);
  const [eTitle, setETitle] = useState("");
  const [eBody, setEBody] = useState("");

  function load() {
    api.getFull<Noti[]>("/notifications/admin", { limit: 100 }).then((r) => setRows(r.data ?? [])).catch(() => undefined);
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

  async function send(asDraft: boolean) {
    if (!title.trim()) return setMsg("Nhập tiêu đề.");
    setMsg("");
    await api.post("/notifications/send", payload(asDraft)).catch((e) => setMsg((e as Error).message));
    setTitle(""); setBody(""); setTarget("ALL");
    load();
    setMsg(asDraft ? "Đã lưu nháp." : "Đã gửi thông báo.");
  }

  async function sendDraft(id: string) {
    await api.post(`/notifications/admin/${id}/send`).catch(() => undefined);
    load();
  }
  async function del(id: string) {
    await api.del(`/notifications/admin/${id}`).catch(() => undefined);
    load();
  }
  async function saveEdit() {
    if (!edit) return;
    await api.patch(`/notifications/admin/${edit.id}`, { title: eTitle, body: eBody }).catch(() => undefined);
    setEdit(null);
    load();
  }

  const targetLabel = (n: Noti) =>
    n.scope === "ALL" ? "Tất cả học viên" : courses.find((c) => c.id === n.courseId)?.title ?? "Theo khóa";

  return (
    <AdminShell title="Quản lý thông báo" subtitle="Tạo, gửi và quản lý thông báo tới học viên.">
      {msg && <div className="panel" style={{ padding: 12, marginBottom: 14, color: "var(--accent)" }}>{msg}</div>}
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
            <button className="btn-sm" style={{ flex: 1, justifyContent: "center" }} type="button" onClick={() => send(false)}>
              Gửi thông báo
            </button>
            <button className="fld" style={{ width: "auto", fontWeight: 600, cursor: "pointer" }} type="button" onClick={() => send(true)}>
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
                <button type="button" onClick={() => { setEdit(n); setETitle(n.title); setEBody(n.body); }}>{EditIcon}</button>
                <button className="del" type="button" onClick={() => del(n.id)}>{DelIcon}</button>
              </div>
            </div>
          ))}
          {rows.length === 0 && <div className="ct-meta" style={{ padding: 12 }}>Chưa có thông báo.</div>}
        </div>
      </div>

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
            <button className="btn-sm" type="button" onClick={saveEdit}>Lưu</button>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
