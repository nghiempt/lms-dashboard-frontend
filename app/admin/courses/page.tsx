"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import AdminShell from "../../components/AdminShell";

const GRID = "2.4fr 1.1fr 1fr 1.2fr 1fr 90px";

interface CourseRow {
  tag: string;
  name: string;
  meta: string;
  price: string;
  students: string;
  revenue: string;
  status: string;
  badgeCls: string;
}

const INITIAL_ROWS: CourseRow[] = [
  {
    tag: "KP",
    name: "Khóa Premium",
    meta: "6 chương · 27 bài",
    price: "5.890.000đ",
    students: "742",
    revenue: "4.37 tỷ",
    status: "Đang bán",
    badgeCls: "active",
  },
  {
    tag: "PE",
    name: "Khóa Premium Elite",
    meta: "9 chương · 37 bài",
    price: "10.890.000đ",
    students: "506",
    revenue: "5.51 tỷ",
    status: "Đang bán",
    badgeCls: "active",
  },
];

function makeTag(title: string): string {
  const words = title.match(/[A-Za-zÀ-ỹ]+/g) ?? ["K", "H"];
  return words
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export default function AdminCoursesPage() {
  const router = useRouter();
  const [rows, setRows] = useState<CourseRow[]>(INITIAL_ROWS);
  const [modalOpen, setModalOpen] = useState(false);

  const titleRef = useRef<HTMLInputElement>(null);
  const priceRef = useRef<HTMLInputElement>(null);
  const statusRef = useRef<HTMLSelectElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);

  // Escape closes modal
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModalOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  function handleCreate() {
    const title = (titleRef.current?.value ?? "").trim() || "Khóa học mới";
    const price = (priceRef.current?.value ?? "").trim() || "0";
    const st = statusRef.current?.value ?? "Đang bán";
    const badgeCls = st === "Ẩn" ? "hidden2" : "active";
    const tag = makeTag(title);

    setRows((prev) => [
      ...prev,
      {
        tag,
        name: title,
        meta: "0 chương · 0 bài",
        price: price + "đ",
        students: "0",
        revenue: "0",
        status: st,
        badgeCls,
      },
    ]);

    if (titleRef.current) titleRef.current.value = "";
    if (priceRef.current) priceRef.current.value = "";
    if (descRef.current) descRef.current.value = "";
    setModalOpen(false);
  }

  return (
    <AdminShell
      title="Quản lý khóa học"
      subtitle="Thêm, sửa và quản lý các khóa học."
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
          Thêm khóa học
        </a>
      }
    >
      {/* Course table panel */}
      <div className="panel">
        <div className="panel-h">
          <h3>Tất cả khóa học</h3>
          <span className="sub">{rows.length} khóa</span>
        </div>

        <div
          className="atbl-h"
          style={{ gridTemplateColumns: GRID }}
        >
          <div>Khóa học</div>
          <div>Giá</div>
          <div>Học viên</div>
          <div>Doanh thu</div>
          <div>Trạng thái</div>
          <div />
        </div>

        {rows.map((row, i) => (
          <div
            key={i}
            className="atbl-r"
            style={{ gridTemplateColumns: GRID }}
          >
            <div className="a-name">
              <div className="a-thumb">{row.tag}</div>
              <div>
                <div className="a-nm">{row.name}</div>
                <div className="a-sub">{row.meta}</div>
              </div>
            </div>
            <div className="price">{row.price}</div>
            <div className="a-nm">{row.students}</div>
            <div className="price">{row.revenue}</div>
            <div>
              <span className={"badge " + row.badgeCls}>{row.status}</span>
            </div>
            <div className="a-act">
              <button
                type="button"
                onClick={() => router.push("/admin/courses/edit")}
              >
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
              <button type="button" className="del">
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

      {/* Add Course Modal */}
      <div
        className={"modal-ov" + (modalOpen ? " open" : "")}
        onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}
      >
        <div className="modal modal-form">
          <div className="mf-head">
            <h3>Thêm khóa học</h3>
            <button
              type="button"
              className="mf-x"
              onClick={() => setModalOpen(false)}
            >
              ✕
            </button>
          </div>

          <div className="fwrap">
            <label className="flabel" htmlFor="ncTitle">
              Tên khóa học
            </label>
            <input
              id="ncTitle"
              ref={titleRef}
              className="fld"
              placeholder="VD: Khóa Premium..."
            />
          </div>

          <div className="mf-row">
            <div className="fwrap">
              <label className="flabel" htmlFor="ncPrice">
                Giá (VND)
              </label>
              <input
                id="ncPrice"
                ref={priceRef}
                className="fld"
                placeholder="VD: 5.890.000"
              />
            </div>
            <div className="fwrap">
              <label className="flabel" htmlFor="ncStatus">
                Trạng thái
              </label>
              <select id="ncStatus" ref={statusRef} className="fld">
                <option>Đang bán</option>
                <option>Ẩn</option>
              </select>
            </div>
          </div>

          <div className="fwrap">
            <label className="flabel" htmlFor="ncDesc">
              Mô tả
            </label>
            <textarea
              id="ncDesc"
              ref={descRef}
              className="fld"
              rows={3}
              placeholder="Mô tả ngắn về khóa học..."
            />
          </div>

          <div className="modal-act">
            <button
              type="button"
              className="btn-sec"
              onClick={() => setModalOpen(false)}
            >
              Hủy
            </button>
            <button type="button" className="btn-danger" id="ncCreate" onClick={handleCreate}>
              Tạo khóa học
            </button>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
