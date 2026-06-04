"use client";

import { useEffect, useRef, useState } from "react";
import AdminShell from "../../components/AdminShell";

const GRID = "2.4fr 1.3fr 0.9fr 1.3fr 0.8fr 90px";

interface ResourceRow {
  name: string;
  type: string;
  size: string;
  course: string;
  downloads: string;
}

const INITIAL_ROWS: ResourceRow[] = [
  { name: "Devin Jatho Cheatsheet.pdf", type: "PDF", size: "2.4 MB", course: "Khóa Premium", downloads: "312 tải" },
  { name: "Cinematic LUT Pack", type: "LUT · .cube", size: "18 MB", course: "Khóa Premium", downloads: "241 tải" },
  { name: "Premiere Presets v2", type: "Preset · .prfpset", size: "8.6 MB", course: "Premium Elite", downloads: "198 tải" },
  { name: "SFX & Transition Library", type: "Audio · .zip", size: "420 MB", course: "Khóa Premium", downloads: "174 tải" },
  { name: "Project Template — Apple Style", type: "Template · .zip", size: "96 MB", course: "Premium Elite", downloads: "120 tải" },
  { name: "100 Hook Ideas.pdf", type: "PDF", size: "1.1 MB", course: "Tất cả khóa", downloads: "405 tải" },
];

const FileSvg = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6" />
  </svg>
);

const DlSvg = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <path d="M7 10l5 5 5-5" />
    <path d="M12 15V3" />
  </svg>
);

const TrashSvg = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
  </svg>
);

function fmtSize(bytes: number): string {
  return bytes >= 1048576
    ? (bytes / 1048576).toFixed(1) + " MB"
    : Math.round(bytes / 1024) + " KB";
}

export default function AdminResourcesPage() {
  const [rows, setRows] = useState<ResourceRow[]>(INITIAL_ROWS);
  const [modalOpen, setModalOpen] = useState(false);

  // dropzone / form state
  const [dzTitle, setDzTitle] = useState("Kéo thả file vào đây hoặc bấm để chọn");
  const [dzSub, setDzSub] = useState("PDF, ZIP, LUT, Preset... tối đa 500MB");
  const [pendingSize, setPendingSize] = useState("—");

  const nameRef = useRef<HTMLInputElement>(null);
  const typeRef = useRef<HTMLInputElement>(null);
  const courseRef = useRef<HTMLSelectElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Escape closes modal
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModalOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  function resetModal() {
    setDzTitle("Kéo thả file vào đây hoặc bấm để chọn");
    setDzSub("PDF, ZIP, LUT, Preset... tối đa 500MB");
    setPendingSize("—");
    if (nameRef.current) nameRef.current.value = "";
    if (typeRef.current) typeRef.current.value = "";
    if (fileRef.current) fileRef.current.value = "";
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const size = fmtSize(f.size);
    setPendingSize(size);
    setDzTitle(f.name);
    setDzSub(size + " · đã chọn");
    if (nameRef.current) nameRef.current.value = f.name;
  }

  function handleUpload() {
    const name = (nameRef.current?.value ?? "").trim() || "Tài liệu mới";
    const type = (typeRef.current?.value ?? "").trim() || "—";
    const course = courseRef.current?.value ?? "Khóa Premium";
    setRows((prev) => [
      ...prev,
      { name, type, size: pendingSize, course, downloads: "0 tải" },
    ]);
    resetModal();
    setModalOpen(false);
  }

  return (
    <AdminShell
      title="Kho tài liệu"
      subtitle="Quản lý tài nguyên & tài liệu khóa học."
      actions={
        <a
          className="btn-sm"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setModalOpen(true);
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          Tải lên tài liệu
        </a>
      }
    >
      {/* Resources table panel */}
      <div className="panel">
        <div className="panel-h">
          <h3>Tất cả tài liệu</h3>
          <span className="sub">{rows.length} tài liệu</span>
        </div>

        <div className="atbl-h" style={{ gridTemplateColumns: GRID }}>
          <div>Tên tài liệu</div>
          <div>Loại</div>
          <div>Dung lượng</div>
          <div>Thuộc khóa</div>
          <div>Lượt tải</div>
          <div />
        </div>

        {rows.map((row, i) => (
          <div key={i} className="atbl-r" style={{ gridTemplateColumns: GRID }}>
            <div className="a-name">
              <div className="a-ic">
                <FileSvg />
              </div>
              <div className="a-nm">{row.name}</div>
            </div>
            <div className="a-sub" style={{ fontSize: 13, color: "var(--muted)" }}>
              {row.type}
            </div>
            <div className="a-sub" style={{ fontSize: 13, color: "var(--muted)" }}>
              {row.size}
            </div>
            <div className="a-sub" style={{ fontSize: 13, color: "var(--muted)" }}>
              {row.course}
            </div>
            <div className="a-nm">{row.downloads}</div>
            <div className="a-act">
              <button type="button">
                <DlSvg />
              </button>
              <button type="button" className="del">
                <TrashSvg />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Upload modal */}
      <div
        className={"modal-ov" + (modalOpen ? " open" : "")}
        onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}
      >
        <div className="modal modal-form">
          <div className="mf-head">
            <h3>Tải lên tài liệu</h3>
            <button
              type="button"
              className="mf-x"
              data-close=""
              onClick={() => { resetModal(); setModalOpen(false); }}
            >
              ✕
            </button>
          </div>

          {/* Dropzone */}
          <div
            className="dz"
            onClick={() => fileRef.current?.click()}
          >
            <div className="dz-ic">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <path d="M17 8l-5-5-5 5" />
                <path d="M12 3v12" />
              </svg>
            </div>
            <div id="dzT" className="dz-t">{dzTitle}</div>
            <div id="dzS" className="dz-s">{dzSub}</div>
            <input
              id="dzInput"
              ref={fileRef}
              type="file"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
          </div>

          <div className="fwrap">
            <label className="flabel" htmlFor="rcName">Tên tài liệu</label>
            <input
              id="rcName"
              ref={nameRef}
              className="fld"
              placeholder="VD: Cinematic LUT Pack..."
            />
          </div>

          <div className="mf-row">
            <div className="fwrap">
              <label className="flabel" htmlFor="rcType">Loại file</label>
              <input
                id="rcType"
                ref={typeRef}
                className="fld"
                placeholder="VD: PDF, LUT · .cube..."
              />
            </div>
            <div className="fwrap">
              <label className="flabel" htmlFor="rcCourse">Thuộc khóa</label>
              <select id="rcCourse" ref={courseRef} className="fld">
                <option>Khóa Premium</option>
                <option>Premium Elite</option>
                <option>Tất cả khóa</option>
              </select>
            </div>
          </div>

          <div className="modal-act">
            <button
              type="button"
              className="btn-sec"
              data-close=""
              onClick={() => { resetModal(); setModalOpen(false); }}
            >
              Hủy
            </button>
            <button
              type="button"
              className="btn-danger"
              id="rcUpload"
              onClick={handleUpload}
            >
              Tải lên
            </button>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
