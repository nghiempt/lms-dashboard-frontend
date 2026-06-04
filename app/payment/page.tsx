import type { Metadata } from "next";
import { Icon } from "../components/dashboardIcons";
import DashboardShell from "../components/DashboardShell";

export const metadata: Metadata = { title: "Thanh toán — VIDEO EDITOR" };

const STATS = [
  { ic: Icon.card, val: "16.780.000", unit: "đ", lbl: "Tổng đã thanh toán" },
  { ic: Icon.bag, val: "2", lbl: "Khóa đã sở hữu" },
  { ic: Icon.chart, val: "0", lbl: "Hóa đơn chờ thanh toán" },
];

const INVOICES = [
  { name: "Khóa Premium Elite", id: "#INV-2042 · 03/06/2026", price: "10.890.000" },
  { name: "Khóa Premium", id: "#INV-1987 · 12/05/2026", price: "5.890.000" },
];

export default function PaymentPage() {
  return (
    <DashboardShell title="Thanh toán & hóa đơn" subtitle="Quản lý phương thức thanh toán và lịch sử giao dịch.">
      <div className="pay-top">
        {STATS.map((s) => (
          <div key={s.lbl} className="panel stat">
            <div className="ic">{s.ic}</div>
            <div className="val">
              {s.val}
              {s.unit && <span style={{ fontSize: 14, color: "var(--muted-2)" }}>{s.unit}</span>}
            </div>
            <div className="lbl">{s.lbl}</div>
          </div>
        ))}
      </div>

      <div className="panel" style={{ marginBottom: 20 }}>
        <div className="panel-h">
          <h3>Phương thức thanh toán</h3>
          <a className="ct-act">+ Thêm phương thức</a>
        </div>
        <div className="method">
          <div className="mc" />
          <div>
            <div className="ct-nm">Visa •••• 6411</div>
            <div className="ct-meta">Hết hạn 08/27 · Mặc định</div>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-h">
          <h3>Lịch sử hóa đơn</h3>
          <span className="sub">2 hóa đơn</span>
        </div>
        <div className="iv-row iv-head">
          <div>Khóa học</div>
          <div>Số tiền</div>
          <div>Trạng thái</div>
          <div />
        </div>
        {INVOICES.map((iv) => (
          <div key={iv.id} className="iv-row">
            <div>
              <div className="ct-nm">{iv.name}</div>
              <div className="ct-meta">{iv.id}</div>
            </div>
            <div className="price">
              {iv.price}
              <span style={{ fontSize: 11, color: "var(--muted-2)", fontWeight: 400 }}>đ</span>
            </div>
            <div>
              <span className="badge done">Đã thanh toán</span>
            </div>
            <div style={{ textAlign: "right" }}>
              <a className="ct-act">Tải hóa đơn</a>
            </div>
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}
