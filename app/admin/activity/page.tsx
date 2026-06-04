"use client";

import AdminShell from "../../components/AdminShell";

const COLS = "1.5fr 1.4fr 2fr 1.2fr 1.3fr";

const LOGS = [
  {
    av: "TK",
    name: "Tuấn Kiệt",
    time: "03/06/2026 14:22",
    action: 'Xem bài "Pacing & nhịp cắt"',
    ip: "113.161.40.12",
    device: "Chrome · macOS",
  },
  {
    av: "MT",
    name: "Minh Trang",
    time: "03/06/2026 13:50",
    action: "Đăng nhập",
    ip: "27.72.101.5",
    device: "Safari · iPhone",
  },
  {
    av: "QB",
    name: "Quốc Bảo",
    time: "03/06/2026 11:08",
    action: 'Hoàn thành chương "Apple Style"',
    ip: "14.231.200.77",
    device: "Chrome · Windows",
  },
  {
    av: "HY",
    name: "Hải Yến",
    time: "02/06/2026 21:33",
    action: "Mua Khóa Premium",
    ip: "171.244.9.10",
    device: "Edge · Windows",
  },
  {
    av: "TK",
    name: "Tuấn Kiệt",
    time: "02/06/2026 20:15",
    action: 'Tải tài liệu "Cinematic LUT Pack"',
    ip: "113.161.40.12",
    device: "Chrome · macOS",
  },
  {
    av: "LP",
    name: "Lan Phương",
    time: "02/06/2026 19:02",
    action: "Đăng nhập",
    ip: "116.96.44.21",
    device: "Chrome · Android",
  },
  {
    av: "MT",
    name: "Minh Trang",
    time: "01/06/2026 22:40",
    action: 'Xem bài "Clean type motion"',
    ip: "27.72.101.5",
    device: "Safari · iPhone",
  },
  {
    av: "QB",
    name: "Quốc Bảo",
    time: "01/06/2026 09:18",
    action: "Đăng xuất",
    ip: "14.231.200.77",
    device: "Chrome · Windows",
  },
];

export default function AdminActivityPage() {
  return (
    <AdminShell title="Nhật ký hoạt động" subtitle="Nhật ký truy cập của học viên.">
      <div className="panel">
        <div className="panel-h">
          <h3>Nhật ký truy cập học viên</h3>
          <span className="sub">8 hoạt động gần đây</span>
        </div>
        <div className="atbl-h" style={{ gridTemplateColumns: COLS }}>
          <div>Tài khoản</div>
          <div>Thời gian truy cập</div>
          <div>Hành động</div>
          <div>IP</div>
          <div>Thiết bị</div>
        </div>
        {LOGS.map((row, i) => (
          <div key={i} className="atbl-r" style={{ gridTemplateColumns: COLS }}>
            <div className="a-name">
              <div className="a-av">{row.av}</div>
              <div className="a-nm">{row.name}</div>
            </div>
            <div className="a-sub" style={{ fontSize: 13, color: "var(--muted)" }}>
              {row.time}
            </div>
            <div className="a-nm" style={{ fontWeight: 500, fontSize: 13.5 }}>
              {row.action}
            </div>
            <div
              className="a-sub"
              style={{ fontSize: 13, color: "var(--muted)", fontVariantNumeric: "tabular-nums" }}
            >
              {row.ip}
            </div>
            <div className="a-sub" style={{ fontSize: 13, color: "var(--muted)" }}>
              {row.device}
            </div>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
