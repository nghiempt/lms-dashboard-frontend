"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DashboardShell from "../../components/DashboardShell";
import { Skeleton, Spinner } from "../../components/Loaders";
import { useToast } from "../../components/Toast";
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
  currency?: string;
  transferContent: string;
  bank: { accountNumber: string; bankName: string; accountHolder: string };
  qrUrl: string;
  expiresAt?: string | null;
}
interface PayStatus {
  orderId: string;
  orderCode: string;
  status: "PENDING" | "PAID" | "CANCELLED" | "REFUNDED";
  paid: boolean;
  paidAt: string | null;
}

type PayState = "pending" | "paid" | "expired" | "failed";

// Lưu đơn đang chờ để khôi phục khi F5 (B4 trong doc).
const PENDING_KEY = "lms_pending_pay";
const POLL_MS = 4000; // 3–5s theo doc, tránh throttle toàn cục

function countdownText(sec: number): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

function CatalogInner() {
  const router = useRouter();
  const toast = useToast();
  const searchParams = useSearchParams();
  const q = searchParams.get("search") ?? "";
  const [rows, setRows] = useState<CatalogCourse[]>([]);
  const [ownedIds, setOwnedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  // ----- trạng thái thanh toán -----
  const [checkout, setCheckout] = useState<CheckoutInfo | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [payCourseId, setPayCourseId] = useState<string | null>(null);
  const [payState, setPayState] = useState<PayState>("pending");
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [cancelling, setCancelling] = useState(false);

  function load() {
    setLoading(true);
    Promise.all([
      api.getFull<CatalogCourse[]>("/courses/catalog", { limit: 50, search: q || undefined }),
      api.get<{ course: { id: string } }[]>("/my/courses"),
    ])
      .then(([cat, mine]) => {
        setRows(cat.data ?? []);
        setOwnedIds(new Set(mine.map((m) => m.course.id)));
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }
  // tải lại khi từ khóa tìm kiếm thay đổi
  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [q]);

  /** Mở modal QR với thông tin checkout. */
  function openCheckout(info: CheckoutInfo, oid: string, courseId: string | null) {
    setCheckout(info);
    setOrderId(oid);
    setPayCourseId(courseId);
    setPayState("pending");
  }

  /** Đóng modal. clearSaved=false để giữ đơn cho phép resume khi quay lại. */
  function hidePayModal(clearSaved: boolean) {
    if (clearSaved) sessionStorage.removeItem(PENDING_KEY);
    setCheckout(null);
    setOrderId(null);
    setPayCourseId(null);
    setPayState("pending");
    setSecondsLeft(null);
  }

  // ----- B4: khôi phục đơn đang chờ sau khi F5 / vào lại trang -----
  useEffect(() => {
    const raw = typeof window !== "undefined" ? sessionStorage.getItem(PENDING_KEY) : null;
    if (!raw) return;
    let saved: { orderId?: string; courseId?: string } | null = null;
    try { saved = JSON.parse(raw); } catch { sessionStorage.removeItem(PENDING_KEY); return; }
    if (!saved?.orderId) { sessionStorage.removeItem(PENDING_KEY); return; }
    (async () => {
      try {
        const s = await api.get<PayStatus>(`/payments/orders/${saved!.orderId}/status`);
        if (s.paid) {
          sessionStorage.removeItem(PENDING_KEY);
          toast.success("Đơn của bạn đã được thanh toán. Khóa học đã mở.");
          load();
          return;
        }
        if (s.status !== "PENDING") { sessionStorage.removeItem(PENDING_KEY); return; }
        // còn PENDING → gọi lại checkout để lấy QR và mở lại modal
        const info = await api.post<CheckoutInfo>(`/payments/orders/${saved!.orderId}/checkout`);
        openCheckout(info, saved!.orderId!, saved!.courseId ?? null);
      } catch {
        sessionStorage.removeItem(PENDING_KEY);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ----- B3: auto-poll trạng thái mỗi POLL_MS khi đang chờ -----
  useEffect(() => {
    if (!orderId || payState !== "pending") return;
    const timer = setInterval(async () => {
      try {
        const s = await api.get<PayStatus>(`/payments/orders/${orderId}/status`);
        if (s.paid) {
          setPayState("paid");
          sessionStorage.removeItem(PENDING_KEY);
          load(); // mở quyền học: refetch danh sách
        } else if (s.status === "CANCELLED" || s.status === "REFUNDED") {
          setPayState("failed");
          sessionStorage.removeItem(PENDING_KEY);
        }
      } catch {
        /* lỗi tạm thời (mạng/throttle) → bỏ qua, vòng sau thử lại */
      }
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [orderId, payState]);

  // ----- Đếm ngược tới expiresAt -----
  useEffect(() => {
    if (!checkout?.expiresAt || payState !== "pending") { setSecondsLeft(null); return; }
    const expMs = new Date(checkout.expiresAt).getTime();
    const tick = () => {
      const left = Math.max(0, Math.round((expMs - Date.now()) / 1000));
      setSecondsLeft(left);
      if (left <= 0) {
        setPayState("expired");
        sessionStorage.removeItem(PENDING_KEY);
      }
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [checkout, payState]);

  async function buy(c: CatalogCourse) {
    setBusy(c.id);
    try {
      const order = await api.post<{ id: string; status: string }>("/orders", {
        courseIds: [c.id],
      });
      // khóa miễn phí (0đ): BE tự fulfill -> vào học luôn, bỏ qua QR
      if (order.status === "PAID") {
        toast.success("Đã ghi danh khóa học miễn phí.");
        router.push(`/courses/${c.id}`);
        return;
      }
      const info = await api.post<CheckoutInfo>(`/payments/orders/${order.id}/checkout`);
      openCheckout(info, order.id, c.id);
      sessionStorage.setItem(PENDING_KEY, JSON.stringify({ orderId: order.id, courseId: c.id }));
    } catch (e) {
      toast.error((e as Error).message || "Không tạo được đơn hàng.");
    } finally {
      setBusy(null);
    }
  }

  async function cancelOrder() {
    if (!orderId) return;
    setCancelling(true);
    try {
      await api.patch(`/orders/my/${orderId}/cancel`, {});
      toast.info("Đã huỷ đơn hàng.");
      hidePayModal(true);
    } catch (e) {
      toast.error((e as Error).message || "Huỷ đơn thất bại.");
    } finally {
      setCancelling(false);
    }
  }

  function goToCourse() {
    const cid = payCourseId;
    hidePayModal(true);
    if (cid) router.push(`/courses/${cid}`);
  }

  const expiringSoon = secondsLeft !== null && secondsLeft <= 60;

  return (
    <DashboardShell title="Khám phá khóa học" subtitle="Chọn khóa học phù hợp và bắt đầu ngay.">
      {loading && (
        <div className="cc-grid">
          {[0, 1, 2].map((i) => (
            <div key={i} className="panel cc-card">
              <Skeleton height={120} radius={0} style={{ display: "block" }} />
              <div className="cc-body">
                <Skeleton width={80} height={20} radius={20} />
                <Skeleton width="85%" height={18} style={{ marginTop: 14 }} />
                <Skeleton width="55%" height={12} style={{ marginTop: 10 }} />
                <Skeleton height={40} radius={10} style={{ marginTop: 18 }} />
              </div>
            </div>
          ))}
        </div>
      )}
      {!loading && q && (
        <div className="ct-meta" style={{ marginBottom: 12 }}>
          Kết quả cho “{q}” · {rows.length} khóa{" "}
          <button type="button" className="link-btn" onClick={() => router.push("/courses/catalog")}>Xóa lọc</button>
        </div>
      )}
      {!loading && rows.length === 0 && (
        <div className="panel" style={{ padding: 24 }}>{q ? `Không tìm thấy khóa học khớp “${q}”.` : "Chưa có khóa học."}</div>
      )}

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
                    {busy === c.id ? <><Spinner size={14} /> Đang tạo đơn...</> : "Mua ngay"}
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
        onClick={(e) => {
          // backdrop: nếu đã xong (paid/expired/failed) thì đóng hẳn, còn đang chờ thì "để sau" (giữ đơn)
          if (e.target !== e.currentTarget) return;
          hidePayModal(payState !== "pending");
        }}
      >
        {checkout && (
          <div className="modal modal-form" style={{ textAlign: "center" }}>
            {/* ====== ĐANG CHỜ THANH TOÁN ====== */}
            {payState === "pending" && (
              <>
                <div className="mf-head">
                  <h3>Thanh toán đơn {checkout.orderCode}</h3>
                  <button type="button" className="mf-x" onClick={() => hidePayModal(false)}>✕</button>
                </div>

                <div className="pay-poll">
                  <Spinner size={15} /> Đang chờ thanh toán, tự động xác nhận khi nhận được tiền…
                </div>

                {secondsLeft !== null && (
                  <div className={"pay-countdown" + (expiringSoon ? " warn" : "")}>
                    {secondsLeft > 0 ? <>Mã QR còn hiệu lực: <b>{countdownText(secondsLeft)}</b></> : "Mã QR đã hết hạn"}
                  </div>
                )}

                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={checkout.qrUrl} alt="QR thanh toán" style={{ width: 220, height: 220, margin: "10px auto", borderRadius: 12, background: "#fff" }} />

                <div className="pay-info">
                  <div className="pay-row"><span>Ngân hàng </span><b>{checkout.bank.bankName}</b></div>
                  <div className="pay-row"><span>Số tài khoản </span><b>{checkout.bank.accountNumber}</b></div>
                  <div className="pay-row"><span>Chủ tài khoản </span><b>{checkout.bank.accountHolder}</b></div>
                  <div className="pay-row"><span>Số tiền </span><b>{vnd(checkout.amount)}đ</b></div>
                  <div className="pay-row"><span>Nội dung CK </span><b>{checkout.transferContent}</b></div>
                </div>

                <div className="modal-act" style={{ justifyContent: "center" }}>
                  <button type="button" className="btn-sec" disabled={cancelling} onClick={cancelOrder}>
                    {cancelling ? <><Spinner size={14} /> Đang huỷ...</> : "Huỷ đơn"}
                  </button>
                </div>
              </>
            )}

            {/* ====== THÀNH CÔNG ====== */}
            {payState === "paid" && (
              <div className="pay-result">
                <div className="pay-ic success">
                  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                </div>
                <h3>Thanh toán thành công!</h3>
                <p className="sub">Đơn {checkout.orderCode} đã được xác nhận. Khóa học đã được mở khóa.</p>
                <div className="modal-act" style={{ justifyContent: "center" }}>
                  <button type="button" className="btn-sec" onClick={() => hidePayModal(true)}>Đóng</button>
                  <button type="button" className="btn-primary" onClick={goToCourse}>Vào học ngay</button>
                </div>
              </div>
            )}

            {/* ====== HẾT HẠN ====== */}
            {payState === "expired" && (
              <div className="pay-result">
                <div className="pay-ic warn">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
                </div>
                <h3>Mã QR đã hết hạn</h3>
                <p className="sub">Đơn {checkout.orderCode} đã quá thời gian thanh toán. Vui lòng tạo lại đơn mới.</p>
                <div className="modal-act" style={{ justifyContent: "center" }}>
                  <button type="button" className="btn-primary" onClick={() => hidePayModal(true)}>Đóng</button>
                </div>
              </div>
            )}

            {/* ====== HUỶ / HOÀN ====== */}
            {payState === "failed" && (
              <div className="pay-result">
                <div className="pay-ic fail">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M15 9l-6 6M9 9l6 6" /></svg>
                </div>
                <h3>Đơn hàng đã bị huỷ</h3>
                <p className="sub">Đơn {checkout.orderCode} không còn hiệu lực. Bạn có thể đặt lại bất cứ lúc nào.</p>
                <div className="modal-act" style={{ justifyContent: "center" }}>
                  <button type="button" className="btn-primary" onClick={() => hidePayModal(true)}>Đóng</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={null}>
      <CatalogInner />
    </Suspense>
  );
}
