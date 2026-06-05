"use client";

import { useEffect, useState } from "react";
import { Icon } from "../components/dashboardIcons";
import DashboardShell from "../components/DashboardShell";
import { Skeleton, SkeletonRows } from "../components/Loaders";
import { api } from "@/lib/api";
import { formatDate, vnd } from "@/lib/format";

interface Summary {
  totalPaid: number;
  coursesOwned: number;
  pendingInvoices: number;
}
interface Order {
  id: string;
  code: string;
  total: string;
  status: string;
  createdAt: string;
  items: { title: string }[];
}

const STATUS = {
  PAID: { cls: "done", label: "Đã thanh toán" },
  PENDING: { cls: "pending", label: "Chờ thanh toán" },
  REFUNDED: { cls: "refund", label: "Hoàn tiền" },
  CANCELLED: { cls: "hidden2", label: "Đã hủy" },
  EXPIRED: { cls: "hidden2", label: "Hết hạn" },
} as Record<string, { cls: string; label: string }>;

export default function PaymentPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    api.get<Summary>("/orders/my/summary").then(setSummary).catch(() => undefined);
    api.getFull<Order[]>("/orders/my", { limit: 50 }).then((r) => setOrders(r.data ?? [])).catch(() => undefined);
  }, []);

  const STATS = [
    { ic: Icon.card, val: vnd(summary?.totalPaid ?? 0), unit: "đ", lbl: "Tổng đã thanh toán" },
    { ic: Icon.bag, val: String(summary?.coursesOwned ?? 0), lbl: "Khóa đã sở hữu" },
    { ic: Icon.chart, val: String(summary?.pendingInvoices ?? 0), lbl: "Hóa đơn chờ thanh toán" },
  ];

  return (
    <DashboardShell title="Thanh toán & hóa đơn" subtitle="Quản lý phương thức thanh toán và lịch sử giao dịch.">
      <div className="pay-top">
        {STATS.map((s) => (
          <div key={s.lbl} className="panel stat">
            <div className="ic">{s.ic}</div>
            <div className="val">
              {summary ? (
                <>
                  {s.val}
                  {s.unit && <span style={{ fontSize: 14, color: "var(--muted-2)" }}>{s.unit}</span>}
                </>
              ) : (
                <Skeleton width={80} height={26} radius={6} />
              )}
            </div>
            <div className="lbl">{s.lbl}</div>
          </div>
        ))}
      </div>

      <div className="panel" style={{ marginBottom: 20 }}>
        <div className="panel-h">
          <h3>Phương thức thanh toán</h3>
        </div>
        <div className="method">
          <div className="mc" />
          <div>
            <div className="ct-nm">Chuyển khoản ngân hàng / SePay</div>
            <div className="ct-meta">Quét QR khi mua khóa học · Tự động xác nhận</div>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-h">
          <h3>Lịch sử hóa đơn</h3>
          <span className="sub">{orders.length} hóa đơn</span>
        </div>
        <div className="iv-row iv-head">
          <div>Khóa học</div>
          <div>Số tiền</div>
          <div>Trạng thái</div>
          <div />
        </div>
        {!summary && <SkeletonRows rows={4} />}
        {orders.map((o) => {
          const st = STATUS[o.status] ?? STATUS.PENDING;
          return (
            <div key={o.id} className="iv-row">
              <div>
                <div className="ct-nm">{o.items.map((i) => i.title).join(", ") || "Đơn hàng"}</div>
                <div className="ct-meta">#{o.code} · {formatDate(o.createdAt)}</div>
              </div>
              <div className="price">
                {vnd(o.total)}
                <span style={{ fontSize: 11, color: "var(--muted-2)", fontWeight: 400 }}>đ</span>
              </div>
              <div>
                <span className={"badge " + st.cls}>{st.label}</span>
              </div>
              <div style={{ textAlign: "right" }}>
                {o.status === "PENDING" && (
                  <a className="ct-act" href="/courses/catalog">Thanh toán</a>
                )}
              </div>
            </div>
          );
        })}
        {summary && orders.length === 0 && <div className="ct-meta" style={{ padding: 12 }}>Chưa có hóa đơn.</div>}
      </div>
    </DashboardShell>
  );
}
