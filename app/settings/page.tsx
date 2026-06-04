"use client";

import { useEffect, useRef, useState } from "react";
import DashboardShell from "../components/DashboardShell";
import { api } from "@/lib/api";
import { refreshCurrentUser } from "@/lib/auth";

const AVATAR = "/assets/avatar.jpg";

const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

interface Me {
  fullName: string;
  email: string;
  phone: string | null;
  bio: string | null;
  avatarUrl: string | null;
  notifyEmail: boolean;
  notifyStudyReminder: boolean;
  notifyCommunity: boolean;
}

function PwRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [show, setShow] = useState(false);
  return (
    <div className="se-field">
      <label>{label}</label>
      <div className="se-pw">
        <input type={show ? "text" : "password"} placeholder="••••••••" value={value} onChange={(e) => onChange(e.target.value)} />
        <button className="se-eye" type="button" onClick={() => setShow((s) => !s)} style={show ? { color: "var(--accent)" } : undefined}>
          <EyeIcon />
        </button>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [me, setMe] = useState<Me | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [profileDirty, setProfileDirty] = useState(false);
  const [msg, setMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const [curPw, setCurPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwMsg, setPwMsg] = useState("");

  const [toggles, setToggles] = useState({ notifyEmail: true, notifyStudyReminder: true, notifyCommunity: false });

  useEffect(() => {
    api.get<Me>("/users/me").then((m) => {
      setMe(m);
      setFullName(m.fullName);
      setPhone(m.phone ?? "");
      setBio(m.bio ?? "");
      setAvatarUrl(m.avatarUrl);
      setToggles({ notifyEmail: m.notifyEmail, notifyStudyReminder: m.notifyStudyReminder, notifyCommunity: m.notifyCommunity });
    }).catch(() => undefined);
  }, []);

  async function saveProfile() {
    setMsg("");
    try {
      await api.patch("/users/me", { fullName, phone, bio });
      await refreshCurrentUser();
      setProfileDirty(false);
      setMsg("Đã lưu hồ sơ.");
    } catch (e) {
      setMsg((e as Error).message);
    }
  }

  async function onPickAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setMsg("Đang tải ảnh...");
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("folder", "avatars");
      form.append("type", "IMAGE");
      const token = localStorage.getItem("lms_access");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1"}/media/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "x-device-id": localStorage.getItem("lms_device") || "" },
        body: form,
      });
      const j = await res.json();
      const url = j?.data?.url as string;
      if (url) {
        await api.patch("/users/me", { avatarUrl: url });
        setAvatarUrl(url);
        await refreshCurrentUser();
        setMsg("Đã cập nhật ảnh đại diện.");
      } else {
        setMsg("Tải ảnh thất bại.");
      }
    } catch (err) {
      setMsg((err as Error).message);
    }
  }

  async function changePassword() {
    setPwMsg("");
    if (newPw.length < 8) return setPwMsg("Mật khẩu mới tối thiểu 8 ký tự.");
    if (newPw !== confirmPw) return setPwMsg("Mật khẩu nhập lại không khớp.");
    try {
      await api.post("/auth/change-password", { currentPassword: curPw, newPassword: newPw });
      setCurPw(""); setNewPw(""); setConfirmPw("");
      setPwMsg("Đổi mật khẩu thành công.");
    } catch (e) {
      setPwMsg((e as Error).message);
    }
  }

  async function toggle(key: keyof typeof toggles) {
    const next = { ...toggles, [key]: !toggles[key] };
    setToggles(next);
    await api.patch("/users/me/notifications", { [key]: next[key] }).catch(() => undefined);
  }

  const TOGGLE_META: { key: keyof typeof toggles; name: string; desc: string }[] = [
    { key: "notifyEmail", name: "Thông báo email", desc: "Nhận cập nhật khóa học & ưu đãi qua email" },
    { key: "notifyStudyReminder", name: "Nhắc nhở học tập", desc: "Nhắc bạn quay lại học mỗi ngày" },
    { key: "notifyCommunity", name: "Thông báo cộng đồng", desc: "Bài viết & hoạt động mới trong cộng đồng" },
  ];

  return (
    <DashboardShell title="Cài đặt" subtitle="Quản lý hồ sơ, bảo mật và thông báo.">
      {msg && <div className="panel" style={{ padding: 12, marginBottom: 14, color: "var(--accent)" }}>{msg}</div>}
      <div className="se-grid">
        <div className="panel">
          <div className="panel-h"><h3>Hồ sơ cá nhân</h3></div>
          <div className="se-avatar">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="big" src={avatarUrl || AVATAR} alt={fullName} />
            <div>
              <button className="btn" type="button" style={{ padding: "9px 16px" }} onClick={() => fileRef.current?.click()}>
                Đổi ảnh
              </button>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={onPickAvatar} />
              <div className="ct-meta" style={{ marginTop: 8 }}>JPG, PNG tối đa 2MB</div>
            </div>
          </div>
          <div className="se-field">
            <label>Họ và tên</label>
            <input type="text" value={fullName} onChange={(e) => { setFullName(e.target.value); setProfileDirty(true); }} />
          </div>
          <div className="se-field">
            <label>Email</label>
            <input type="email" value={me?.email ?? ""} disabled />
          </div>
          <div className="se-field">
            <label>Số điện thoại</label>
            <input type="tel" value={phone} onChange={(e) => { setPhone(e.target.value); setProfileDirty(true); }} />
          </div>
          <div className="se-field">
            <label>Giới thiệu</label>
            <input type="text" value={bio} onChange={(e) => { setBio(e.target.value); setProfileDirty(true); }} />
          </div>
          <button className="btn" type="button" style={{ marginTop: 6 }} disabled={!profileDirty} onClick={saveProfile}>
            Lưu thay đổi
          </button>
        </div>

        <div>
          <div className="panel" style={{ marginBottom: 16 }}>
            <div className="panel-h"><h3>Đổi mật khẩu</h3></div>
            {pwMsg && <div className="ct-meta" style={{ marginBottom: 10, color: "var(--accent)" }}>{pwMsg}</div>}
            <PwRow label="Mật khẩu hiện tại" value={curPw} onChange={setCurPw} />
            <PwRow label="Mật khẩu mới" value={newPw} onChange={setNewPw} />
            <PwRow label="Nhập lại mật khẩu mới" value={confirmPw} onChange={setConfirmPw} />
            <button className="btn" type="button" style={{ marginTop: 6 }} disabled={!curPw || !newPw} onClick={changePassword}>
              Cập nhật mật khẩu
            </button>
          </div>

          <div className="panel">
            <div className="panel-h"><h3>Thông báo</h3></div>
            {TOGGLE_META.map((t) => (
              <div key={t.key} className="se-tog">
                <div>
                  <div className="ct-nm" style={{ fontSize: 14 }}>{t.name}</div>
                  <div className="ct-meta">{t.desc}</div>
                </div>
                <button className="toggle" type="button" data-on={toggles[t.key] ? "1" : "0"} aria-pressed={toggles[t.key]} onClick={() => toggle(t.key)}>
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
