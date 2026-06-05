"use client";

import { useEffect, useState } from "react";
import AdminShell from "../../components/AdminShell";
import { Spinner } from "../../components/Loaders";
import { useToast } from "../../components/Toast";
import { api } from "@/lib/api";
import { refreshCurrentUser } from "@/lib/auth";

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
const isUrl = (v: string) => /^https?:\/\/.+/i.test(v.trim());

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></svg>
  );
}

function PwRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [show, setShow] = useState(false);
  return (
    <div className="se-field">
      <label>{label}</label>
      <div className="se-pw">
        <input type={show ? "text" : "password"} placeholder="••••••••" value={value} onChange={(e) => onChange(e.target.value)} />
        <button className="se-eye" type="button" style={{ color: show ? "var(--accent)" : undefined }} onClick={() => setShow((s) => !s)}><EyeIcon /></button>
      </div>
    </div>
  );
}

interface Me { fullName: string; email: string }
type ToggleKey = "payment.sepay" | "payment.bank" | "notify.new_order" | "notify.refund";

export default function AdminSettingsPage() {
  const toast = useToast();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const [curPw, setCurPw] = useState(""); const [newPw, setNewPw] = useState(""); const [confirmPw, setConfirmPw] = useState("");
  const [pwMsg, setPwMsg] = useState("");
  const [savingPw, setSavingPw] = useState(false);

  const [site, setSite] = useState({ "site.name": "", "contact.email": "", "contact.hotline": "", "social.tiktok": "", "social.youtube": "" });
  const [savingSite, setSavingSite] = useState(false);
  const [toggles, setToggles] = useState<Record<ToggleKey, boolean>>({ "payment.sepay": true, "payment.bank": false, "notify.new_order": true, "notify.refund": true });

  // ---- Điều kiện hợp lệ (gate nút submit) ----
  const profileValid = displayName.trim().length >= 2;
  const pwValid = curPw.length > 0 && newPw.length >= 8 && newPw === confirmPw;
  const siteValid =
    site["site.name"].trim().length > 0 &&
    (!site["contact.email"].trim() || isEmail(site["contact.email"])) &&
    (!site["social.tiktok"].trim() || isUrl(site["social.tiktok"])) &&
    (!site["social.youtube"].trim() || isUrl(site["social.youtube"]));

  useEffect(() => {
    api.get<Me>("/users/me").then((m) => { setDisplayName(m.fullName); setEmail(m.email); }).catch(() => undefined);
    api.get<{ map: Record<string, unknown> }>("/settings").then(({ map }) => {
      setSite((s) => ({
        "site.name": String(map["site.name"] ?? ""),
        "contact.email": String(map["contact.email"] ?? ""),
        "contact.hotline": String(map["contact.hotline"] ?? ""),
        "social.tiktok": String(map["social.tiktok"] ?? ""),
        "social.youtube": String(map["social.youtube"] ?? ""),
      }));
      setToggles((t) => ({
        "payment.sepay": map["payment.sepay"] === true ? true : map["payment.sepay"] === false ? false : t["payment.sepay"],
        "payment.bank": map["payment.bank"] === true,
        "notify.new_order": map["notify.new_order"] !== false,
        "notify.refund": map["notify.refund"] !== false,
      }));
    }).catch(() => undefined);
  }, []);

  async function saveProfile() {
    if (!profileValid) return toast.error("Tên hiển thị tối thiểu 2 ký tự.");
    setSavingProfile(true);
    try {
      await api.patch("/users/me", { fullName: displayName.trim() });
      await refreshCurrentUser();
      toast.success("Đã lưu hồ sơ.");
    } catch (e) {
      toast.error((e as Error).message || "Lưu hồ sơ thất bại.");
    } finally {
      setSavingProfile(false);
    }
  }
  async function changePassword() {
    setPwMsg("");
    if (newPw.length < 8) return setPwMsg("Mật khẩu mới tối thiểu 8 ký tự.");
    if (newPw !== confirmPw) return setPwMsg("Mật khẩu nhập lại không khớp.");
    setSavingPw(true);
    try {
      await api.post("/auth/change-password", { currentPassword: curPw, newPassword: newPw });
      setCurPw(""); setNewPw(""); setConfirmPw("");
      toast.success("Đổi mật khẩu thành công.");
    } catch (e) {
      setPwMsg((e as Error).message);
    } finally {
      setSavingPw(false);
    }
  }
  async function saveSite() {
    if (!siteValid) return toast.error("Vui lòng kiểm tra lại thông tin website (tên, email, link).");
    setSavingSite(true);
    const items = [
      { key: "site.name", value: site["site.name"], group: "general" },
      { key: "contact.email", value: site["contact.email"], group: "contact" },
      { key: "contact.hotline", value: site["contact.hotline"], group: "contact" },
      { key: "social.tiktok", value: site["social.tiktok"], group: "social" },
      { key: "social.youtube", value: site["social.youtube"], group: "social" },
    ];
    try {
      await api.post("/settings", { items });
      toast.success("Đã lưu cấu hình.");
    } catch (e) {
      toast.error((e as Error).message || "Lưu cấu hình thất bại.");
    } finally {
      setSavingSite(false);
    }
  }
  async function flip(key: ToggleKey) {
    const prev = toggles[key];
    const next = !prev;
    setToggles((t) => ({ ...t, [key]: next })); // optimistic
    try {
      await api.post("/settings", { items: [{ key, value: String(next), group: "payment", type: "boolean" }] });
    } catch (e) {
      setToggles((t) => ({ ...t, [key]: prev })); // revert khi lỗi
      toast.error((e as Error).message || "Cập nhật thất bại.");
    }
  }

  const Toggle = ({ k, name, desc }: { k: ToggleKey; name: string; desc: string }) => (
    <div className="se-tog">
      <div><div className="a-nm" style={{ fontSize: 14 }}>{name}</div><div className="a-sub">{desc}</div></div>
      <button className="toggle" type="button" data-on={toggles[k] ? "1" : "0"} onClick={() => flip(k)}><i /></button>
    </div>
  );

  return (
    <AdminShell title="Cài đặt" subtitle="Quản lý cấu hình hệ thống và tài khoản quản trị.">
      <div className="se-grid">
        <div>
          <div className="panel" style={{ marginBottom: 16 }}>
            <div className="panel-h"><h3>Hồ sơ quản trị</h3></div>
            <div className="se-field"><label>Tên hiển thị</label><input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} /></div>
            <div className="se-field"><label>Email</label><input type="email" value={email} disabled /></div>
            <button className="btn-sm" onClick={saveProfile} disabled={!profileValid || savingProfile}>
              {savingProfile ? <><Spinner size={14} /> Đang lưu...</> : "Lưu thay đổi"}
            </button>
          </div>

          <div className="panel">
            <div className="panel-h"><h3>Đổi mật khẩu</h3></div>
            {pwMsg && <div className="ct-meta" style={{ marginBottom: 8, color: "var(--accent)" }}>{pwMsg}</div>}
            <PwRow label="Mật khẩu hiện tại" value={curPw} onChange={setCurPw} />
            <PwRow label="Mật khẩu mới" value={newPw} onChange={setNewPw} />
            <PwRow label="Nhập lại mật khẩu mới" value={confirmPw} onChange={setConfirmPw} />
            <button className="btn-sm" onClick={changePassword} disabled={!pwValid || savingPw}>
              {savingPw ? <><Spinner size={14} /> Đang lưu...</> : "Cập nhật mật khẩu"}
            </button>
          </div>
        </div>

        <div>
          <div className="panel" style={{ marginBottom: 16 }}>
            <div className="panel-h"><h3>Thông tin website</h3></div>
            <div className="se-field">
              <label>Tên website</label>
              <input value={site["site.name"]} onChange={(e) => setSite({ ...site, "site.name": e.target.value })} />
              {!site["site.name"].trim() && <span className="fld-err">Tên website không được để trống.</span>}
            </div>
            <div className="se-field">
              <label>Email liên hệ</label>
              <input value={site["contact.email"]} onChange={(e) => setSite({ ...site, "contact.email": e.target.value })} />
              {site["contact.email"].trim() && !isEmail(site["contact.email"]) && <span className="fld-err">Email không hợp lệ.</span>}
            </div>
            <div className="se-field"><label>Hotline</label><input value={site["contact.hotline"]} onChange={(e) => setSite({ ...site, "contact.hotline": e.target.value })} /></div>
            <div className="se-field">
              <label>Link TikTok</label>
              <input value={site["social.tiktok"]} onChange={(e) => setSite({ ...site, "social.tiktok": e.target.value })} />
              {site["social.tiktok"].trim() && !isUrl(site["social.tiktok"]) && <span className="fld-err">Link phải bắt đầu bằng http(s)://</span>}
            </div>
            <div className="se-field">
              <label>Link YouTube</label>
              <input value={site["social.youtube"]} onChange={(e) => setSite({ ...site, "social.youtube": e.target.value })} />
              {site["social.youtube"].trim() && !isUrl(site["social.youtube"]) && <span className="fld-err">Link phải bắt đầu bằng http(s)://</span>}
            </div>
            <button className="btn-sm" onClick={saveSite} disabled={!siteValid || savingSite}>
              {savingSite ? <><Spinner size={14} /> Đang lưu...</> : "Lưu cấu hình"}
            </button>
          </div>

          <div className="panel" style={{ marginBottom: 16 }}>
            <div className="panel-h"><h3>Cổng thanh toán</h3></div>
            <Toggle k="payment.sepay" name="SePay" desc="Cho phép thanh toán qua SePay (QR)" />
            <Toggle k="payment.bank" name="Chuyển khoản ngân hàng" desc="Hiển thị thông tin chuyển khoản thủ công" />
          </div>

          <div className="panel">
            <div className="panel-h"><h3>Thông báo</h3></div>
            <Toggle k="notify.new_order" name="Email khi có đơn mới" desc="Gửi email cho admin khi có giao dịch" />
            <Toggle k="notify.refund" name="Cảnh báo hoàn tiền" desc="Thông báo khi có yêu cầu hoàn tiền" />
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
