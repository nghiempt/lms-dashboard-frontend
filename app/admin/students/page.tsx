"use client";

import { useEffect, useState } from "react";
import AdminShell from "../../components/AdminShell";
import { api } from "@/lib/api";
import { formatDate, vnd } from "@/lib/format";

const GRID = "1.5fr 1.6fr 0.7fr 1.3fr 1fr 0.9fr 80px";

interface StudentRow {
  id: string;
  fullName: string;
  email: string;
  status: string;
  courseCount: number;
  avgProgress: number | null;
  totalSpent: number;
  createdAt: string;
}
interface StudentDetail extends StudentRow {
  courses: { id: string; title: string; progressPct: number; enrolledAt: string }[];
}

function initials(name: string) {
  const p = name.trim().split(/\s+/);
  return ((p[0]?.[0] ?? "") + (p.length > 1 ? p[p.length - 1][0] : "")).toUpperCase() || "?";
}

export default function AdminStudentsPage() {
  const [rows, setRows] = useState<StudentRow[]>([]);
  const [total, setTotal] = useState(0);
  const [detail, setDetail] = useState<StudentDetail | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editLocked, setEditLocked] = useState(false);
  const [del, setDel] = useState<{ id: string; name: string } | null>(null);

  function load() {
    api.getFull<StudentRow[]>("/users/students", { limit: 100 }).then((r) => {
      setRows(r.data ?? []);
      setTotal(Number(r.meta?.total ?? r.data?.length ?? 0));
    }).catch(() => undefined);
  }
  useEffect(load, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setDrawerOpen(false); setDel(null); } };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  async function openDrawer(id: string) {
    setDrawerOpen(true);
    setDetail(null);
    const d = await api.get<StudentDetail>(`/users/students/${id}`);
    setDetail(d);
    setEditName(d.fullName);
    setEditLocked(d.status === "LOCKED");
  }

  async function saveDrawer() {
    if (!detail) return;
    await api.patch(`/users/students/${detail.id}`, {
      fullName: editName,
      status: editLocked ? "LOCKED" : "ACTIVE",
    });
    setDrawerOpen(false);
    load();
  }

  async function confirmDel() {
    if (!del) return;
    await api.del(`/users/students/${del.id}`).catch(() => undefined);
    setDel(null);
    load();
  }

  return (
    <AdminShell title="Quản lý học viên" subtitle="Theo dõi và quản lý học viên.">
      <div className="panel">
        <div className="panel-h">
          <h3>Danh sách học viên</h3>
          <span className="sub">{total} học viên</span>
        </div>
        <div className="atbl-h" style={{ gridTemplateColumns: GRID }}>
          <div>Học viên</div><div>Email</div><div>Khóa</div><div>Tiến độ học</div><div>Ngày tham gia</div><div>Trạng thái</div><div />
        </div>
        {rows.map((s) => (
          <div key={s.id} className="atbl-r" style={{ gridTemplateColumns: GRID }}>
            <div className="a-name">
              <div className="a-av">{initials(s.fullName)}</div>
              <div className="a-nm">{s.fullName}</div>
            </div>
            <div className="a-sub" style={{ fontSize: 13, color: "var(--muted)" }}>{s.email}</div>
            <div className="a-nm">{s.courseCount} khóa</div>
            {s.avgProgress !== null ? (
              <div className="prog">
                <div className="track"><div className="fill" style={{ width: `${s.avgProgress}%` }} /></div>
                <span className="pct">{s.avgProgress}%</span>
              </div>
            ) : <span className="a-sub">—</span>}
            <div className="a-sub" style={{ fontSize: 13, color: "var(--muted)" }}>{formatDate(s.createdAt)}</div>
            <div><span className={"badge " + (s.status === "LOCKED" ? "hidden2" : "active")}>{s.status === "LOCKED" ? "Tạm khóa" : "Hoạt động"}</span></div>
            <div className="a-act">
              <button type="button" onClick={() => openDrawer(s.id)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4z" /></svg>
              </button>
              <button type="button" className="del" onClick={() => setDel({ id: s.id, name: s.fullName })}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /></svg>
              </button>
            </div>
          </div>
        ))}
        {rows.length === 0 && <div className="ct-meta" style={{ padding: 12 }}>Chưa có học viên.</div>}
      </div>

      {/* Drawer */}
      <div className={"drawer-ov" + (drawerOpen ? " open" : "")} onClick={(e) => e.target === e.currentTarget && setDrawerOpen(false)}>
        <div className="drawer">
          <div className="dw-head">
            <h3>Thông tin học viên</h3>
            <button type="button" className="dw-x" onClick={() => setDrawerOpen(false)}>✕</button>
          </div>
          <div className="dw-body">
            {!detail ? <div style={{ padding: 12 }}>Đang tải...</div> : (
              <>
                <div className="dw-avatar">
                  <div className="a-av" style={{ width: 56, height: 56, fontSize: 18 }}>{initials(detail.fullName)}</div>
                  <div>
                    <div className="a-nm" style={{ fontSize: 16 }}>{detail.fullName}</div>
                    <div className="a-sub" style={{ fontSize: 13, color: "var(--muted)" }}>{detail.email}</div>
                  </div>
                </div>
                <div className="se-field">
                  <label>Họ và tên</label>
                  <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} />
                </div>
                <div className="se-field">
                  <label>Email</label>
                  <input type="text" value={detail.email} disabled />
                </div>
                <div className="se-field">
                  <label>Trạng thái</label>
                  <div className="seg">
                    <button type="button" className={!editLocked ? "on" : ""} onClick={() => setEditLocked(false)}>Hoạt động</button>
                    <button type="button" className={editLocked ? "on" : ""} onClick={() => setEditLocked(true)}>Tạm khóa</button>
                  </div>
                </div>
                <div className="dw-rolbl">Thống kê</div>
                <div className="dw-readonly">
                  <div className="dw-ro-row"><span className="dw-ro-l">Số khóa đã mua</span><span className="dw-ro-v">{detail.courses.length}</span></div>
                  <div className="dw-ro-row"><span className="dw-ro-l">Ngày tham gia</span><span className="dw-ro-v">{formatDate(detail.createdAt)}</span></div>
                  <div className="dw-ro-row"><span className="dw-ro-l">Tổng chi tiêu</span><span className="dw-ro-v">{vnd(detail.totalSpent)}đ</span></div>
                </div>
                <div className="dw-rolbl" style={{ marginTop: 20 }}>Khóa học đã mua</div>
                <div className="dw-courses">
                  {detail.courses.length ? detail.courses.map((c) => (
                    <div key={c.id} className="dw-course">
                      <div className="dwc-top"><span className="dwc-nm">{c.title}</span><span className="dwc-pct">{c.progressPct}%</span></div>
                      <div className="prog"><div className="track"><div className="fill" style={{ width: `${c.progressPct}%` }} /></div></div>
                      <div className="dwc-meta">Mua ngày {formatDate(c.enrolledAt)}</div>
                    </div>
                  )) : <span className="a-sub">Chưa mua khóa nào</span>}
                </div>
              </>
            )}
          </div>
          <div className="dw-foot">
            <button type="button" className="btn-sec" onClick={() => setDrawerOpen(false)}>Hủy</button>
            <button type="button" className="btn-danger" onClick={saveDrawer}>Lưu thay đổi</button>
          </div>
        </div>
      </div>

      {/* Delete modal */}
      <div className={"modal-ov" + (del ? " open" : "")} onClick={(e) => e.target === e.currentTarget && setDel(null)}>
        <div className="modal">
          <h3>Xóa học viên?</h3>
          <p>Bạn có chắc muốn xóa <b>{del?.name}</b>? Hành động này không thể hoàn tác.</p>
          <div className="modal-act">
            <button type="button" className="btn-sec" onClick={() => setDel(null)}>Hủy</button>
            <button type="button" className="btn-danger" onClick={confirmDel}>Xóa</button>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
