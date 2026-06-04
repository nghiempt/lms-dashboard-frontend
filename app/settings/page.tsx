"use client";

import { useState } from "react";
import DashboardShell from "../components/DashboardShell";

const AVATAR = "/assets/avatar.jpg";

const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const PROFILE_FIELDS = [
  { label: "Họ và tên", type: "text", value: "Tuấn Kiệt" },
  { label: "Email", type: "email", value: "tuankiet@email.com" },
  { label: "Số điện thoại", type: "tel", value: "0901 234 567" },
  { label: "Giới thiệu", type: "text", value: "Video Editor freelance, đang học để làm việc với client quốc tế." },
];

const PW_FIELDS = [
  { label: "Mật khẩu hiện tại", placeholder: "••••••••" },
  { label: "Mật khẩu mới", placeholder: "Tối thiểu 8 ký tự" },
  { label: "Nhập lại mật khẩu mới", placeholder: "••••••••" },
];

const TOGGLES = [
  { name: "Thông báo email", desc: "Nhận cập nhật khóa học & ưu đãi qua email", on: true },
  { name: "Nhắc nhở học tập", desc: "Nhắc bạn quay lại học mỗi ngày", on: true },
  { name: "Thông báo cộng đồng", desc: "Bài viết & hoạt động mới trong cộng đồng", on: false },
];

function PwRow({ label, placeholder, onChange }: { label: string; placeholder: string; onChange: () => void }) {
  const [show, setShow] = useState(false);
  return (
    <div className="se-field">
      <label>{label}</label>
      <div className="se-pw">
        <input type={show ? "text" : "password"} placeholder={placeholder} onChange={onChange} />
        <button
          className="se-eye"
          type="button"
          aria-label={show ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          onClick={() => setShow((s) => !s)}
          style={show ? { color: "var(--accent)" } : undefined}
        >
          <EyeIcon />
        </button>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [profileDirty, setProfileDirty] = useState(false);
  const [pwDirty, setPwDirty] = useState(false);
  const [toggles, setToggles] = useState(TOGGLES.map((t) => t.on));

  return (
    <DashboardShell title="Cài đặt" subtitle="Quản lý hồ sơ, bảo mật và thông báo.">
      <div className="se-grid">
        <div className="panel">
          <div className="panel-h">
            <h3>Hồ sơ cá nhân</h3>
          </div>
          <div className="se-avatar">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="big" src={AVATAR} alt="Tuấn Kiệt" />
            <div>
              <button className="btn" type="button" style={{ padding: "9px 16px" }}>
                Đổi ảnh
              </button>
              <div className="ct-meta" style={{ marginTop: 8 }}>
                JPG, PNG tối đa 2MB
              </div>
            </div>
          </div>
          {PROFILE_FIELDS.map((f) => (
            <div key={f.label} className="se-field">
              <label>{f.label}</label>
              <input type={f.type} defaultValue={f.value} onChange={() => setProfileDirty(true)} />
            </div>
          ))}
          <button className="btn" type="button" style={{ marginTop: 6 }} disabled={!profileDirty}>
            Lưu thay đổi
          </button>
        </div>

        <div>
          <div className="panel" style={{ marginBottom: 16 }}>
            <div className="panel-h">
              <h3>Đổi mật khẩu</h3>
            </div>
            {PW_FIELDS.map((f) => (
              <PwRow key={f.label} label={f.label} placeholder={f.placeholder} onChange={() => setPwDirty(true)} />
            ))}
            <button className="btn" type="button" style={{ marginTop: 6 }} disabled={!pwDirty}>
              Cập nhật mật khẩu
            </button>
          </div>

          <div className="panel">
            <div className="panel-h">
              <h3>Thông báo</h3>
            </div>
            {TOGGLES.map((t, i) => (
              <div key={t.name} className="se-tog">
                <div>
                  <div className="ct-nm" style={{ fontSize: 14 }}>
                    {t.name}
                  </div>
                  <div className="ct-meta">{t.desc}</div>
                </div>
                <button
                  className="toggle"
                  type="button"
                  data-on={toggles[i] ? "1" : "0"}
                  aria-pressed={toggles[i]}
                  aria-label={t.name}
                  onClick={() => setToggles((prev) => prev.map((v, j) => (j === i ? !v : v)))}
                >
                  <i />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
