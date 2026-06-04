"use client";

import { useEffect, useState } from "react";
import AdminShell from "../../components/AdminShell";

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

interface Announcement {
  id: number;
  title: string;
  target: string;
  date: string;
  status: "Đã gửi" | "Nháp";
}

const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  { id: 1, title: "Bài giảng mới chương Apple Style", target: "Tất cả học viên", date: "03/06/2026", status: "Đã gửi" },
  { id: 2, title: "Ưu đãi nâng cấp Premium Elite -20%", target: "Khóa Premium", date: "01/06/2026", status: "Đã gửi" },
  { id: 3, title: "Bảo trì hệ thống 02:00 28/05", target: "Tất cả học viên", date: "27/05/2026", status: "Đã gửi" },
  { id: 4, title: "Lịch coaching tháng 6", target: "Premium Elite", date: "—", status: "Nháp" },
];

const TARGET_OPTIONS = ["Tất cả học viên", "Khóa Premium", "Khóa Premium Elite", "Premium Elite"];
const STATUS_OPTIONS: Array<"Đã gửi" | "Nháp"> = ["Đã gửi", "Nháp"];

// ---------------------------------------------------------------------------
// Edit SVG icons (inlined for reuse)
// ---------------------------------------------------------------------------

const EditIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4z" />
  </svg>
);

const DelIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
  </svg>
);

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);

  // ---- Create form state ----
  const [createTitle, setCreateTitle] = useState("");
  const [createBody, setCreateBody] = useState("");
  const [createTarget, setCreateTarget] = useState("Tất cả học viên");

  // ---- Edit modal state ----
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [anTitle, setAnTitle] = useState("");
  const [anBody, setAnBody] = useState("");
  const [anTarget, setAnTarget] = useState("Tất cả học viên");
  const [anStatus, setAnStatus] = useState<"Đã gửi" | "Nháp">("Đã gửi");

  // Close modal on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  function openEdit(ann: Announcement) {
    setEditId(ann.id);
    setAnTitle(ann.title);
    setAnBody("");
    setAnTarget(ann.target);
    setAnStatus(ann.status);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditId(null);
  }

  function handleSave() {
    if (editId === null) return;
    const trimmed = anTitle.trim();
    setAnnouncements((prev) =>
      prev.map((a) =>
        a.id === editId
          ? {
              ...a,
              title: trimmed || a.title,
              target: anTarget,
              status: anStatus,
            }
          : a
      )
    );
    closeModal();
  }

  function handleDelete(id: number) {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
  }

  function handleSend() {
    if (!createTitle.trim()) return;
    const newAnn: Announcement = {
      id: Date.now(),
      title: createTitle.trim(),
      target: createTarget,
      date: new Date().toLocaleDateString("vi-VN"),
      status: "Đã gửi",
    };
    setAnnouncements((prev) => [newAnn, ...prev]);
    setCreateTitle("");
    setCreateBody("");
    setCreateTarget("Tất cả học viên");
  }

  function handleDraft() {
    if (!createTitle.trim()) return;
    const newAnn: Announcement = {
      id: Date.now(),
      title: createTitle.trim(),
      target: createTarget,
      date: "—",
      status: "Nháp",
    };
    setAnnouncements((prev) => [newAnn, ...prev]);
    setCreateTitle("");
    setCreateBody("");
    setCreateTarget("Tất cả học viên");
  }

  const COLS = "2.4fr 1.3fr 1fr 1fr 90px";

  return (
    <AdminShell title="Quản lý thông báo" subtitle="Tạo, gửi và quản lý thông báo tới học viên.">
      <div className="ann-grid">
        {/* ---------------------------------------------------------------- */}
        {/* Create panel                                                       */}
        {/* ---------------------------------------------------------------- */}
        <div className="panel" style={{ alignSelf: "start" }}>
          <div className="panel-h">
            <h3>Tạo thông báo</h3>
          </div>
          <div className="fwrap">
            <label className="flabel">Tiêu đề</label>
            <input
              className="fld"
              placeholder="VD: Bài giảng mới..."
              value={createTitle}
              onChange={(e) => setCreateTitle(e.target.value)}
            />
          </div>
          <div className="fwrap">
            <label className="flabel">Nội dung</label>
            <textarea
              className="fld"
              rows={4}
              placeholder="Nội dung thông báo gửi tới học viên..."
              value={createBody}
              onChange={(e) => setCreateBody(e.target.value)}
            />
          </div>
          <div className="fwrap">
            <label className="flabel">Gửi tới</label>
            <select
              className="fld"
              value={createTarget}
              onChange={(e) => setCreateTarget(e.target.value)}
            >
              <option>Tất cả học viên</option>
              <option>Khóa Premium</option>
              <option>Khóa Premium Elite</option>
            </select>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              className="btn-sm"
              style={{ flex: 1, justifyContent: "center" }}
              type="button"
              onClick={handleSend}
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 11l18-5v12L3 14v-3z" />
                <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
              </svg>{" "}
              Gửi thông báo
            </button>
            <button
              className="fld"
              style={{ width: "auto", fontWeight: 600, cursor: "pointer" }}
              type="button"
              onClick={handleDraft}
            >
              Lưu nháp
            </button>
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Announcements table panel                                         */}
        {/* ---------------------------------------------------------------- */}
        <div className="panel">
          <div className="panel-h">
            <h3>Thông báo đã tạo</h3>
            <span className="sub">{announcements.length} thông báo</span>
          </div>
          <div className="atbl-h" style={{ gridTemplateColumns: COLS }}>
            <div>Tiêu đề</div>
            <div>Đối tượng</div>
            <div>Ngày gửi</div>
            <div>Trạng thái</div>
            <div />
          </div>
          {announcements.map((ann) => (
            <div key={ann.id} className="atbl-r" style={{ gridTemplateColumns: COLS }}>
              <div className="a-nm">{ann.title}</div>
              <div className="a-sub" style={{ fontSize: 13, color: "var(--muted)" }}>
                {ann.target}
              </div>
              <div className="a-sub" style={{ fontSize: 13, color: "var(--muted)" }}>
                {ann.date}
              </div>
              <div>
                <span className={"badge " + (ann.status === "Đã gửi" ? "done" : "hidden2")}>
                  {ann.status}
                </span>
              </div>
              <div className="a-act">
                <button type="button" onClick={() => openEdit(ann)}>
                  {EditIcon}
                </button>
                <button className="del" type="button" onClick={() => handleDelete(ann.id)}>
                  {DelIcon}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Edit modal (annModal)                                               */}
      {/* ------------------------------------------------------------------ */}
      <div
        className={"modal-ov" + (modalOpen ? " open" : "")}
        id="annModal"
        onClick={(e) => e.target === e.currentTarget && closeModal()}
      >
        <div className="modal">
          <div className="panel-h" style={{ marginBottom: 16 }}>
            <h3>Chỉnh sửa thông báo</h3>
            <button
              type="button"
              className="icon-btn"
              data-close
              onClick={closeModal}
              aria-label="Đóng"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="fwrap">
            <label className="flabel">Tiêu đề</label>
            <input
              id="anTitle"
              className="fld"
              placeholder="Tiêu đề thông báo"
              value={anTitle}
              onChange={(e) => setAnTitle(e.target.value)}
            />
          </div>
          <div className="fwrap">
            <label className="flabel">Nội dung</label>
            <textarea
              id="anBody"
              className="fld"
              rows={4}
              placeholder="Nội dung thông báo..."
              value={anBody}
              onChange={(e) => setAnBody(e.target.value)}
            />
          </div>
          <div className="fwrap">
            <label className="flabel">Gửi tới</label>
            <select
              id="anTarget"
              className="fld"
              value={anTarget}
              onChange={(e) => setAnTarget(e.target.value)}
            >
              {TARGET_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
          <div className="fwrap">
            <label className="flabel">Trạng thái</label>
            <select
              id="anStatus"
              className="fld"
              value={anStatus}
              onChange={(e) => setAnStatus(e.target.value as "Đã gửi" | "Nháp")}
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
          <div className="modal-act">
            <button className="btn-sec" type="button" data-close onClick={closeModal}>
              Hủy
            </button>
            <button className="btn-sm" type="button" id="anSave" onClick={handleSave}>
              Lưu thay đổi
            </button>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
