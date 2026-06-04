import type { Metadata } from "next";
import { NbBook, NbChat, NbTag, NbCheck, NbCard } from "../components/dashboardIcons";
import DashboardShell from "../components/DashboardShell";

export const metadata: Metadata = { title: "Thông báo — VIDEO EDITOR" };

const TODAY = [
  { ic: NbBook, color: "blue", body: (<>Bài giảng mới <b>Pacing &amp; nhịp cắt</b> vừa được thêm vào Khóa Premium Elite</>), time: "10 phút trước" },
  { ic: NbChat, color: "blue", body: (<><b>Dân</b> đã trả lời feedback bài tập của bạn</>), time: "2 giờ trước" },
];

const EARLIER = [
  { ic: NbTag, color: "orange", body: <>Ưu đãi đặc biệt: giảm 20% khi nâng cấp lên Premium Elite</>, time: "1 ngày trước" },
  { ic: NbCheck, color: "green", body: (<>Chúc mừng! Bạn đã hoàn thành chương <b>Apple Style</b> 🎉</>), time: "2 ngày trước" },
  { ic: NbCard, color: "green", body: (<>Hóa đơn <b>#INV-1987</b> đã thanh toán thành công</>), time: "3 ngày trước" },
  { ic: NbBook, color: "blue", body: <>Chào mừng bạn đến với VIDEO EDITOR! Bắt đầu lộ trình ngay.</>, time: "5 ngày trước" },
];

export default function NotificationsPage() {
  return (
    <DashboardShell title="Thông báo" subtitle="Tất cả thông báo & cập nhật của bạn.">
      <div className="panel" style={{ padding: 0 }}>
        <div className="panel-h" style={{ margin: 0, padding: "18px 22px", borderBottom: "1px solid var(--line)" }}>
          <h3>Tất cả thông báo</h3>
          <a className="ct-act">Đánh dấu tất cả đã đọc</a>
        </div>

        <div className="nf-sec">Hôm nay</div>
        {TODAY.map((n, i) => (
          <a key={i} className="nf-item unread">
            <span className={"nd-ic " + n.color}>{n.ic}</span>
            <div className="nd-tx">
              <p>{n.body}</p>
              <time>{n.time}</time>
            </div>
            <span className="nf-dot" />
          </a>
        ))}

        <div className="nf-sec">Trước đó</div>
        {EARLIER.map((n, i) => (
          <a key={i} className="nf-item">
            <span className={"nd-ic " + n.color}>{n.ic}</span>
            <div className="nd-tx">
              <p>{n.body}</p>
              <time>{n.time}</time>
            </div>
          </a>
        ))}
      </div>
    </DashboardShell>
  );
}
