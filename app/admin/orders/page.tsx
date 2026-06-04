"use client";

import AdminShell from "../../components/AdminShell";

const COLS = "1fr 1.3fr 1.4fr 1.1fr 1fr 1fr";

const ORDERS = [
  {
    id: "#INV-2042",
    name: "Tuấn Kiệt",
    course: "Premium Elite",
    amount: "10.890.000đ",
    date: "03/06/2026",
    status: "done",
    label: "Thành công",
  },
  {
    id: "#INV-2041",
    name: "Minh Trang",
    course: "Khóa Premium",
    amount: "5.890.000đ",
    date: "02/06/2026",
    status: "done",
    label: "Thành công",
  },
  {
    id: "#INV-2040",
    name: "Quốc Bảo",
    course: "Premium Elite",
    amount: "10.890.000đ",
    date: "01/06/2026",
    status: "pending",
    label: "Chờ",
  },
  {
    id: "#INV-2039",
    name: "Hải Yến",
    course: "Khóa Premium",
    amount: "5.890.000đ",
    date: "30/05/2026",
    status: "done",
    label: "Thành công",
  },
  {
    id: "#INV-2038",
    name: "Đức Anh",
    course: "Khóa Premium",
    amount: "5.890.000đ",
    date: "29/05/2026",
    status: "refund",
    label: "Hoàn tiền",
  },
  {
    id: "#INV-2037",
    name: "Lan Phương",
    course: "Premium Elite",
    amount: "10.890.000đ",
    date: "27/05/2026",
    status: "done",
    label: "Thành công",
  },
];

export default function AdminOrdersPage() {
  return (
    <AdminShell title="Đơn hàng & thanh toán" subtitle="Quản lý giao dịch và doanh thu.">
      <div className="stats" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
        {/* Tổng doanh thu */}
        <div className="panel stat">
          <div className="ic">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div className="val">9.88 tỷ</div>
          <div className="lbl">Tổng doanh thu</div>
        </div>

        {/* Đơn thành công */}
        <div className="panel stat">
          <div className="ic">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" />
            </svg>
          </div>
          <div className="val">1.196</div>
          <div className="lbl">Đơn thành công</div>
        </div>

        {/* Đơn chờ xử lý */}
        <div className="panel stat">
          <div className="ic">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3v18h18" />
              <path d="M7 14l3-3 3 3 5-6" />
            </svg>
          </div>
          <div className="val">18</div>
          <div className="lbl">Đơn chờ xử lý</div>
        </div>

        {/* Đơn hoàn tiền */}
        <div className="panel stat">
          <div className="ic">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </div>
          <div className="val">7</div>
          <div className="lbl">Đơn hoàn tiền</div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-h">
          <h3>Tất cả đơn hàng</h3>
          <span className="sub">1.221 đơn</span>
        </div>
        <div className="atbl-h" style={{ gridTemplateColumns: COLS }}>
          <div>Mã đơn</div>
          <div>Học viên</div>
          <div>Khóa học</div>
          <div>Số tiền</div>
          <div>Ngày</div>
          <div>Trạng thái</div>
        </div>
        {ORDERS.map((o) => (
          <div key={o.id} className="atbl-r" style={{ gridTemplateColumns: COLS }}>
            <div className="a-nm" style={{ color: "var(--accent)" }}>
              {o.id}
            </div>
            <div className="a-nm">{o.name}</div>
            <div className="a-sub" style={{ fontSize: 13, color: "var(--muted)" }}>
              {o.course}
            </div>
            <div className="price">{o.amount}</div>
            <div className="a-sub" style={{ fontSize: 13, color: "var(--muted)" }}>
              {o.date}
            </div>
            <div>
              <span className={"badge " + o.status}>{o.label}</span>
            </div>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
