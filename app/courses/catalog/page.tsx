"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardShell from "../../components/DashboardShell";
import { api } from "@/lib/api";
import { vnd } from "@/lib/format";

interface CatalogCourse {
  id: string;
  title: string;
  shortCode: string | null;
  coverLabel: string | null;
  subtitle: string | null;
  pricing: "FREE" | "PAID";
  price: string;
  _count?: { chapters: number };
}
interface CheckoutInfo {
  orderCode: string;
  amount: number;
  transferContent: string;
  bank: { accountNumber: string; bankName: string; accountHolder: string };
  qrUrl: string;
}

export default function CatalogPage() {
  const router = useRouter();
  const [rows, setRows] = useState<CatalogCourse[]>([]);
  const [ownedIds, setOwnedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [checkout, setCheckout] = useState<CheckoutInfo | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);
  const [msg, setMsg] = useState("");

  function load() {
    Promise.all([
      api.getFull<CatalogCourse[]>("/courses/catalog", { limit: 50 }),
      api.get<{ course: { id: string } }[]>("/my/courses"),
    ])
      .then(([cat, mine]) => {
        setRows(cat.data ?? []);
        setOwnedIds(new Set(mine.map((m) => m.course.id)));
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }
  useEffect(load, []);

  async function buy(c: CatalogCourse) {
    setBusy(c.id);
    setMsg("");
    try {
      const order = await api.post<{ id: string; status: string }>("/orders", {
        courseIds: [c.id],
      });
      // khóa miễn phí: BE tự fulfill -> vào học luôn
      if (order.status === "PAID") {
        router.push(`/courses/${c.id}`);
        return;
      }
      const info = await api.post<CheckoutInfo>(
        `/payments/orders/${order.id}/checkout`,
      );
      setOrderId(order.id);
      setCheckout(info);
    } catch (e) {
      setMsg((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function checkPaid() {
    if (!orderId) return;
    setPolling(true);
    try {
      const order = await api.get<{ status: string }>(`/orders/my/${orderId}`);
      if (order.status === "PAID") {
        setCheckout(null);
        load();
        setMsg("Thanh toán thành công! Khóa học đã được mở.");
      } else {
        setMsg("Chưa nhận được thanh toán. Vui lòng chuyển khoản rồi thử lại.");
      }
    } catch (e) {
      setMsg((e as Error).message);
    } finally {
      setPolling(false);
    }
  }

  return (
    <DashboardShell title="Khám phá khóa học" subtitle="Chọn khóa học phù hợp và bắt đầu ngay.">
      {msg && (
        <div className="panel" style={{ padding: 14, marginBottom: 16, color: "var(--accent)" }}>{msg}</div>
      )}
      {loading && <div className="panel" style={{ padding: 24 }}>Đang tải...</div>}

      <div className="cc-grid">
        {rows.map((c) => {
          const owned = ownedIds.has(c.id);
          return (
            <div key={c.id} className="panel cc-card">
              <div className="cc-cover">
                <span className="cc-tag">{c.shortCode ?? "KH"}</span>
                <span className="cc-cover-l">{c.coverLabel ?? c.title}</span>
              </div>
              <div className="cc-body">
                <div className="cc-top">
                  <span className="badge learning">{c.pricing === "FREE" ? "Miễn phí" : "Có phí"}</span>
                  <span className="cc-price">{c.pricing === "FREE" ? "0đ" : vnd(c.price) + "đ"}</span>
                </div>
                <div className="cc-nm">{c.title}</div>
                <div className="ct-meta">{c.subtitle ?? `${c._count?.chapters ?? 0} chương`}</div>
                {owned ? (
                  <button
                    className="btn"
                    style={{ width: "100%", justifyContent: "center", marginTop: 18 }}
                    onClick={() => router.push(`/courses/${c.id}`)}
                  >
                    Vào học
                  </button>
                ) : (
                  <button
                    className="btn btn-primary"
                    style={{ width: "100%", justifyContent: "center", marginTop: 18 }}
                    disabled={busy === c.id}
                    onClick={() => buy(c)}
                  >
                    {busy === c.id ? "Đang tạo đơn..." : "Mua ngay"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal thanh toán SePay */}
      <div
        className={"modal-ov" + (checkout ? " open" : "")}
        onClick={(e) => e.target === e.currentTarget && setCheckout(null)}
      >
        {checkout && (
          <div className="modal modal-form" style={{ textAlign: "center" }}>
            <div className="mf-head">
              <h3>Thanh toán đơn {checkout.orderCode}</h3>
              <button type="button" className="mf-x" onClick={() => setCheckout(null)}>✕</button>
            </div>
            <p className="sub" style={{ marginBottom: 12 }}>
              Quét mã QR hoặc chuyển khoản với nội dung <b>{checkout.transferContent}</b>
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={checkout.qrUrl} alt="QR thanh toán" style={{ width: 220, height: 220, margin: "0 auto", borderRadius: 12 }} />
            <div style={{ textAlign: "left", margin: "16px 0", fontSize: 14, lineHeight: 1.8 }}>
              <div>Ngân hàng: <b>{checkout.bank.bankName}</b></div>
              <div>Số TK: <b>{checkout.bank.accountNumber}</b></div>
              <div>Chủ TK: <b>{checkout.bank.accountHolder}</b></div>
              <div>Số tiền: <b>{vnd(checkout.amount)}đ</b></div>
              <div>Nội dung: <b>{checkout.transferContent}</b></div>
            </div>
            <div className="modal-act">
              <button type="button" className="btn-sec" onClick={() => setCheckout(null)}>Để sau</button>
              <button type="button" className="btn-primary" disabled={polling} onClick={checkPaid}>
                {polling ? "Đang kiểm tra..." : "Tôi đã thanh toán"}
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
