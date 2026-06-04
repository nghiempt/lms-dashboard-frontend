"use client";

import AdminShell from "../../components/AdminShell";

export default function AdminNotificationsPage() {
  return (
    <AdminShell title="Thông báo" subtitle="Tất cả hoạt động & cập nhật của hệ thống.">
      <div className="panel" style={{ padding: 0 }}>
        <div
          className="panel-h"
          style={{ margin: 0, padding: "18px 22px", borderBottom: "1px solid var(--line)" }}
        >
          <h3>Tất cả thông báo</h3>
          <a className="ct-act">Đánh dấu tất cả đã đọc</a>
        </div>

        {/* Section: Hôm nay */}
        <div className="nf-sec">Hôm nay</div>

        {/* Item 1 – unread */}
        <a className="nf-item unread">
          <span className="nd-ic blue">
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" />
            </svg>
          </span>
          <div className="nd-tx">
            <p>
              Đơn hàng mới <b>#INV-2042</b> từ Tuấn Kiệt — 10.890.000đ
            </p>
            <time>5 phút trước</time>
          </div>
          <span className="nf-dot" />
        </a>

        {/* Item 2 – unread */}
        <a className="nf-item unread">
          <span className="nd-ic blue">
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 11l-3 3-1.5-1.5" />
            </svg>
          </span>
          <div className="nd-tx">
            <p>
              Học viên mới <b>Minh Trang</b> vừa đăng ký tài khoản
            </p>
            <time>1 giờ trước</time>
          </div>
          <span className="nf-dot" />
        </a>

        {/* Item 3 – unread */}
        <a className="nf-item unread">
          <span className="nd-ic orange">
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </span>
          <div className="nd-tx">
            <p>
              Yêu cầu <b>hoàn tiền</b> từ Đức Anh cho Khóa Premium
            </p>
            <time>3 giờ trước</time>
          </div>
          <span className="nf-dot" />
        </a>

        {/* Section: Trước đó */}
        <div className="nf-sec">Trước đó</div>

        {/* Item 4 */}
        <a className="nf-item">
          <span className="nd-ic green">
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </span>
          <div className="nd-tx">
            <p>
              Khóa Premium đạt mốc <b>742 học viên</b> 🎉
            </p>
            <time>1 ngày trước</time>
          </div>
        </a>

        {/* Item 5 */}
        <a className="nf-item">
          <span className="nd-ic green">
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 3v18h18" />
              <path d="M7 14l3-3 3 3 5-6" />
            </svg>
          </span>
          <div className="nd-tx">
            <p>
              Doanh thu tháng 6 đạt <b>84.6M</b>
            </p>
            <time>2 ngày trước</time>
          </div>
        </a>

        {/* Item 6 */}
        <a className="nf-item">
          <span className="nd-ic blue">
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </span>
          <div className="nd-tx">
            <p>
              Hải Yến đã hoàn thành <b>Khóa Premium</b>
            </p>
            <time>3 ngày trước</time>
          </div>
        </a>
      </div>
    </AdminShell>
  );
}
