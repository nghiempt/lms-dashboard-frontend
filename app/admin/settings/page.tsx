"use client";

import { useState } from "react";
import AdminShell from "../../components/AdminShell";

// ---------------------------------------------------------------------------
// Toggle state helpers
// ---------------------------------------------------------------------------
type ToggleKey = "vnpay" | "momo" | "bank" | "emailNew" | "refundAlert";

const INITIAL_TOGGLES: Record<ToggleKey, boolean> = {
  vnpay: true,
  momo: true,
  bank: false,
  emailNew: true,
  refundAlert: true,
};

// ---------------------------------------------------------------------------
// Eye-button SVG (reused for all three password fields)
// ---------------------------------------------------------------------------
function EyeIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------
export default function AdminSettingsPage() {
  // ── Profile fields ────────────────────────────────────────────────────────
  const [displayName, setDisplayName] = useState("Danmotion");
  const [email, setEmail] = useState("admin@videoeditor.vn");

  // ── Password fields ───────────────────────────────────────────────────────
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");

  // Eye-toggle: true = show as text, false = password
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  // ── Website fields ────────────────────────────────────────────────────────
  const [siteName, setSiteName] = useState("VIDEO EDITOR");
  const [contactEmail, setContactEmail] = useState("contact@videoeditor.vn");
  const [hotline, setHotline] = useState("0901 234 567");
  const [tiktok, setTiktok] = useState("https://tiktok.com/@danmotion");
  const [youtube, setYoutube] = useState("https://youtube.com/@danmotion");

  // ── Toggle switches ───────────────────────────────────────────────────────
  const [toggles, setToggles] = useState(INITIAL_TOGGLES);

  function flipToggle(key: ToggleKey) {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <AdminShell
      title="Cài đặt"
      subtitle="Quản lý cấu hình hệ thống và tài khoản quản trị."
    >
      <div className="se-grid">
        {/* ── LEFT COLUMN ─────────────────────────────────────────────────── */}
        <div>
          {/* Admin profile */}
          <div className="panel" style={{ marginBottom: 16 }}>
            <div className="panel-h">
              <h3>Hồ sơ quản trị</h3>
            </div>
            <div className="se-avatar">
              <div className="big">DM</div>
              <div>
                <button className="btn-sm">Đổi ảnh</button>
              </div>
            </div>
            <div className="se-field">
              <label>Tên hiển thị</label>
              <input
                type="text"
                value={displayName}
                placeholder=""
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
            <div className="se-field">
              <label>Email</label>
              <input
                type="email"
                value={email}
                placeholder=""
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button className="btn-sm">Lưu thay đổi</button>
          </div>

          {/* Change password */}
          <div className="panel">
            <div className="panel-h">
              <h3>Đổi mật khẩu</h3>
            </div>

            {/* Current password */}
            <div className="se-field">
              <label>Mật khẩu hiện tại</label>
              <div className="se-pw">
                <input
                  type={showCurrentPw ? "text" : "password"}
                  placeholder="••••••••"
                  value={currentPw}
                  onChange={(e) => setCurrentPw(e.target.value)}
                />
                <button
                  className="se-eye"
                  type="button"
                  style={{ color: showCurrentPw ? "var(--accent)" : undefined }}
                  onClick={() => setShowCurrentPw((v) => !v)}
                >
                  <EyeIcon />
                </button>
              </div>
            </div>

            {/* New password */}
            <div className="se-field">
              <label>Mật khẩu mới</label>
              <div className="se-pw">
                <input
                  type={showNewPw ? "text" : "password"}
                  placeholder="Tối thiểu 8 ký tự"
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                />
                <button
                  className="se-eye"
                  type="button"
                  style={{ color: showNewPw ? "var(--accent)" : undefined }}
                  onClick={() => setShowNewPw((v) => !v)}
                >
                  <EyeIcon />
                </button>
              </div>
            </div>

            {/* Confirm new password */}
            <div className="se-field">
              <label>Nhập lại mật khẩu mới</label>
              <div className="se-pw">
                <input
                  type={showConfirmPw ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                />
                <button
                  className="se-eye"
                  type="button"
                  style={{ color: showConfirmPw ? "var(--accent)" : undefined }}
                  onClick={() => setShowConfirmPw((v) => !v)}
                >
                  <EyeIcon />
                </button>
              </div>
            </div>

            <button className="btn-sm">Cập nhật mật khẩu</button>
          </div>
        </div>

        {/* ── RIGHT COLUMN ────────────────────────────────────────────────── */}
        <div>
          {/* Website info */}
          <div className="panel" style={{ marginBottom: 16 }}>
            <div className="panel-h">
              <h3>Thông tin website</h3>
            </div>
            <div className="se-field">
              <label>Tên website</label>
              <input
                type="text"
                value={siteName}
                placeholder=""
                onChange={(e) => setSiteName(e.target.value)}
              />
            </div>
            <div className="se-field">
              <label>Email liên hệ</label>
              <input
                type="email"
                value={contactEmail}
                placeholder=""
                onChange={(e) => setContactEmail(e.target.value)}
              />
            </div>
            <div className="se-field">
              <label>Hotline</label>
              <input
                type="tel"
                value={hotline}
                placeholder=""
                onChange={(e) => setHotline(e.target.value)}
              />
            </div>
            <div className="se-field">
              <label>Link TikTok</label>
              <input
                type="text"
                value={tiktok}
                placeholder=""
                onChange={(e) => setTiktok(e.target.value)}
              />
            </div>
            <div className="se-field">
              <label>Link YouTube</label>
              <input
                type="text"
                value={youtube}
                placeholder=""
                onChange={(e) => setYoutube(e.target.value)}
              />
            </div>
            <button className="btn-sm">Lưu cấu hình</button>
          </div>

          {/* Payment gateways */}
          <div className="panel" style={{ marginBottom: 16 }}>
            <div className="panel-h">
              <h3>Cổng thanh toán</h3>
            </div>

            <div className="se-tog">
              <div>
                <div className="a-nm" style={{ fontSize: 14 }}>VNPay</div>
                <div className="a-sub">Cho phép thanh toán qua VNPay</div>
              </div>
              <button
                className="toggle"
                data-on={toggles.vnpay ? "1" : "0"}
                onClick={() => flipToggle("vnpay")}
              >
                <i />
              </button>
            </div>

            <div className="se-tog">
              <div>
                <div className="a-nm" style={{ fontSize: 14 }}>Momo</div>
                <div className="a-sub">Cho phép thanh toán qua ví Momo</div>
              </div>
              <button
                className="toggle"
                data-on={toggles.momo ? "1" : "0"}
                onClick={() => flipToggle("momo")}
              >
                <i />
              </button>
            </div>

            <div className="se-tog">
              <div>
                <div className="a-nm" style={{ fontSize: 14 }}>Chuyển khoản ngân hàng</div>
                <div className="a-sub">Hiển thị thông tin chuyển khoản thủ công</div>
              </div>
              <button
                className="toggle"
                data-on={toggles.bank ? "1" : "0"}
                onClick={() => flipToggle("bank")}
              >
                <i />
              </button>
            </div>
          </div>

          {/* Notifications */}
          <div className="panel">
            <div className="panel-h">
              <h3>Thông báo</h3>
            </div>

            <div className="se-tog">
              <div>
                <div className="a-nm" style={{ fontSize: 14 }}>Email khi có đơn mới</div>
                <div className="a-sub">Gửi email cho admin khi có giao dịch</div>
              </div>
              <button
                className="toggle"
                data-on={toggles.emailNew ? "1" : "0"}
                onClick={() => flipToggle("emailNew")}
              >
                <i />
              </button>
            </div>

            <div className="se-tog">
              <div>
                <div className="a-nm" style={{ fontSize: 14 }}>Cảnh báo hoàn tiền</div>
                <div className="a-sub">Thông báo khi có yêu cầu hoàn tiền</div>
              </div>
              <button
                className="toggle"
                data-on={toggles.refundAlert ? "1" : "0"}
                onClick={() => flipToggle("refundAlert")}
              >
                <i />
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
