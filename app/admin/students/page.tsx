"use client";

import { useEffect, useState } from "react";
import AdminShell from "../../components/AdminShell";

const GRID = "1.5fr 1.6fr 0.7fr 1.3fr 1fr 0.9fr 80px";

interface CourseEntry {
  n: string;
  d: string;
  p: number;
}

interface StudentRow {
  id: number;
  initials: string;
  name: string;
  email: string;
  courseCount: number;
  progress: number | null;
  joined: string;
  locked: boolean;
  courses: CourseEntry[];
  spent: string;
}

const INITIAL_STUDENTS: StudentRow[] = [
  {
    id: 1,
    initials: "TK",
    name: "Tuấn Kiệt",
    email: "tuankiet@email.com",
    courseCount: 2,
    progress: 40,
    joined: "03/06/2026",
    locked: false,
    courses: [
      { n: "Khóa Premium", d: "12/05/2026", p: 62 },
      { n: "Khóa Premium Elite", d: "03/06/2026", p: 18 },
    ],
    spent: "16.780.000đ",
  },
  {
    id: 2,
    initials: "MT",
    name: "Minh Trang",
    email: "minhtrang@email.com",
    courseCount: 1,
    progress: 45,
    joined: "28/05/2026",
    locked: false,
    courses: [{ n: "Khóa Premium", d: "28/05/2026", p: 45 }],
    spent: "5.890.000đ",
  },
  {
    id: 3,
    initials: "QB",
    name: "Quốc Bảo",
    email: "quocbao@email.com",
    courseCount: 2,
    progress: 55,
    joined: "15/05/2026",
    locked: false,
    courses: [
      { n: "Khóa Premium", d: "10/05/2026", p: 80 },
      { n: "Khóa Premium Elite", d: "15/05/2026", p: 30 },
    ],
    spent: "16.780.000đ",
  },
  {
    id: 4,
    initials: "HY",
    name: "Hải Yến",
    email: "haiyen@email.com",
    courseCount: 1,
    progress: 100,
    joined: "02/05/2026",
    locked: false,
    courses: [{ n: "Khóa Premium", d: "02/05/2026", p: 100 }],
    spent: "5.890.000đ",
  },
  {
    id: 5,
    initials: "DA",
    name: "Đức Anh",
    email: "ducanh@email.com",
    courseCount: 0,
    progress: null,
    joined: "20/04/2026",
    locked: true,
    courses: [],
    spent: "0đ",
  },
  {
    id: 6,
    initials: "LP",
    name: "Lan Phương",
    email: "lanphuong@email.com",
    courseCount: 1,
    progress: 55,
    joined: "11/04/2026",
    locked: false,
    courses: [{ n: "Khóa Premium Elite", d: "11/04/2026", p: 55 }],
    spent: "10.890.000đ",
  },
];

interface DrawerState {
  open: boolean;
  student: StudentRow | null;
  statusLocked: boolean;
}

interface DelState {
  open: boolean;
  studentId: number | null;
  studentName: string;
}

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<StudentRow[]>(INITIAL_STUDENTS);
  const [drawer, setDrawer] = useState<DrawerState>({
    open: false,
    student: null,
    statusLocked: false,
  });
  const [del, setDel] = useState<DelState>({
    open: false,
    studentId: null,
    studentName: "",
  });

  // Escape closes drawer + delete modal
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDrawer((d) => ({ ...d, open: false }));
        setDel((d) => ({ ...d, open: false }));
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  function openDrawer(s: StudentRow) {
    setDrawer({ open: true, student: s, statusLocked: s.locked });
  }

  function closeDrawer() {
    setDrawer((d) => ({ ...d, open: false }));
  }

  function openDel(s: StudentRow) {
    setDel({ open: true, studentId: s.id, studentName: s.name });
  }

  function closeDel() {
    setDel({ open: false, studentId: null, studentName: "" });
  }

  function confirmDel() {
    if (del.studentId !== null) {
      setStudents((prev) => prev.filter((s) => s.id !== del.studentId));
    }
    closeDel();
  }

  return (
    <AdminShell title="Quản lý học viên" subtitle="Theo dõi và quản lý học viên.">
      {/* Student table panel */}
      <div className="panel">
        <div className="panel-h">
          <h3>Danh sách học viên</h3>
          <span className="sub">1.248 học viên</span>
        </div>
        <div className="atbl-h" style={{ gridTemplateColumns: GRID }}>
          <div>Học viên</div>
          <div>Email</div>
          <div>Khóa</div>
          <div>Tiến độ học</div>
          <div>Ngày tham gia</div>
          <div>Trạng thái</div>
          <div />
        </div>

        {students.map((s) => (
          <div key={s.id} className="atbl-r" style={{ gridTemplateColumns: GRID }}>
            <div className="a-name">
              <div className="a-av">{s.initials}</div>
              <div className="a-nm">{s.name}</div>
            </div>
            <div className="a-sub" style={{ fontSize: 13, color: "var(--muted)" }}>
              {s.email}
            </div>
            <div className="a-nm">{s.courseCount} khóa</div>
            {s.progress !== null ? (
              <div className="prog">
                <div className="track">
                  <div className="fill" style={{ width: `${s.progress}%` }} />
                </div>
                <span className="pct">{s.progress}%</span>
              </div>
            ) : (
              <span className="a-sub">—</span>
            )}
            <div className="a-sub" style={{ fontSize: 13, color: "var(--muted)" }}>
              {s.joined}
            </div>
            <div>
              <span className={"badge " + (s.locked ? "hidden2" : "active")}>
                {s.locked ? "Tạm khóa" : "Hoạt động"}
              </span>
            </div>
            <div className="a-act">
              <button type="button" onClick={() => openDrawer(s)}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4z" />
                </svg>
              </button>
              <button type="button" className="del" onClick={() => openDel(s)}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ── Edit Drawer ── */}
      <div
        className={"drawer-ov" + (drawer.open ? " open" : "")}
        onClick={(e) => e.target === e.currentTarget && closeDrawer()}
      >
        <div className="drawer">
          {/* Drawer head */}
          <div className="dw-head">
            <h3>Thông tin học viên</h3>
            <button type="button" className="dw-x" data-close onClick={closeDrawer}>
              ✕
            </button>
          </div>

          {/* Drawer body */}
          <div className="dw-body">
            {drawer.student && (
              <>
                {/* Avatar + name/email */}
                <div className="dw-avatar">
                  <div className="a-av" id="edAva" style={{ width: 56, height: 56, fontSize: 18 }}>
                    {drawer.student.initials}
                  </div>
                  <div>
                    <div className="a-nm" id="edTitle" style={{ fontSize: 16 }}>
                      {drawer.student.name}
                    </div>
                    <div
                      className="a-sub"
                      id="edSubEmail"
                      style={{ fontSize: 13, color: "var(--muted)" }}
                    >
                      {drawer.student.email}
                    </div>
                  </div>
                </div>

                {/* Name field */}
                <div className="se-field">
                  <label htmlFor="edName">Họ và tên</label>
                  <input id="edName" type="text" defaultValue={drawer.student.name} />
                </div>

                {/* Email field */}
                <div className="se-field">
                  <label htmlFor="edEmail">Email</label>
                  <input id="edEmail" type="text" defaultValue={drawer.student.email} />
                </div>

                {/* Status segmented control */}
                <div className="se-field">
                  <label>Trạng thái</label>
                  <div className="seg" id="edStatus">
                    <button
                      type="button"
                      data-v="active"
                      className={!drawer.statusLocked ? "on" : ""}
                      onClick={() => setDrawer((d) => ({ ...d, statusLocked: false }))}
                    >
                      Hoạt động
                    </button>
                    <button
                      type="button"
                      data-v="locked"
                      className={drawer.statusLocked ? "on" : ""}
                      onClick={() => setDrawer((d) => ({ ...d, statusLocked: true }))}
                    >
                      Tạm khóa
                    </button>
                  </div>
                </div>

                {/* Read-only stats */}
                <div className="dw-rolbl">Thống kê</div>
                <div className="dw-readonly">
                  <div className="dw-ro-row">
                    <span className="dw-ro-l">Số khóa đã mua</span>
                    <span className="dw-ro-v" id="edCount">
                      {drawer.student.courses.length}
                    </span>
                  </div>
                  <div className="dw-ro-row">
                    <span className="dw-ro-l">Ngày tham gia</span>
                    <span className="dw-ro-v" id="edJoined">
                      {drawer.student.joined}
                    </span>
                  </div>
                  <div className="dw-ro-row">
                    <span className="dw-ro-l">Tổng chi tiêu</span>
                    <span className="dw-ro-v" id="edSpent">
                      {drawer.student.spent}
                    </span>
                  </div>
                </div>

                {/* Purchased courses */}
                <div className="dw-rolbl" style={{ marginTop: 20 }}>
                  Khóa học đã mua
                </div>
                <div className="dw-courses" id="edCourses">
                  {drawer.student.courses.length > 0 ? (
                    drawer.student.courses.map((c, i) => (
                      <div key={i} className="dw-course">
                        <div className="dwc-top">
                          <span className="dwc-nm">{c.n}</span>
                          <span className="dwc-pct">{c.p}%</span>
                        </div>
                        <div className="prog">
                          <div className="track">
                            <div className="fill" style={{ width: `${c.p}%` }} />
                          </div>
                        </div>
                        <div className="dwc-meta">Mua ngày {c.d}</div>
                      </div>
                    ))
                  ) : (
                    <span className="a-sub">Chưa mua khóa nào</span>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Drawer footer */}
          <div className="dw-foot">
            <button type="button" className="btn-sec" data-close onClick={closeDrawer}>
              Hủy
            </button>
            <button type="button" className="btn-danger" onClick={closeDrawer}>
              Lưu thay đổi
            </button>
          </div>
        </div>
      </div>

      {/* ── Delete Confirm Modal ── */}
      <div
        className={"modal-ov" + (del.open ? " open" : "")}
        id="delModal"
        onClick={(e) => e.target === e.currentTarget && closeDel()}
      >
        <div className="modal">
          <div className="modal-ic">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            </svg>
          </div>
          <h3>Xóa học viên?</h3>
          <p>
            Bạn có chắc muốn xóa học viên{" "}
            <b id="delName">{del.studentName}</b>? Hành động này không thể hoàn tác.
          </p>
          <div className="modal-act">
            <button type="button" className="btn-sec" data-close onClick={closeDel}>
              Hủy
            </button>
            <button type="button" className="btn-danger" data-confirm onClick={confirmDel}>
              Xóa
            </button>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
