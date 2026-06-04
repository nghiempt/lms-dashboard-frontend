"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  forgotPassword,
  googleLogin,
  HOME_BY_ROLE,
  login,
  register,
  type AuthUser,
} from "@/lib/auth";

const LOGO = "/assets/16f53e33ca.png";
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

/* ---------- inline icons (ported 1:1) ---------- */
const TickIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);
const EyeIcon = ({ off }: { off?: boolean }) =>
  off ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-10-7-10-7a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 7 10 7a18.5 18.5 0 0 1-2.16 3.19M1 1l22 22" />
      <path d="M9.5 9.5a3 3 0 0 0 4.2 4.2" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
const BackIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M11 18l-6-6 6-6" />
  </svg>
);
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.5 29.5 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.3-.4-3.5z" />
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.5 29.5 4.5 24 4.5 16.3 4.5 9.7 8.8 6.3 14.7z" />
    <path fill="#4CAF50" d="M24 43.5c5.2 0 10-2 13.6-5.2l-6.3-5.2C29.2 34.5 26.7 35.5 24 35.5c-5.3 0-9.7-3.1-11.3-7.5l-6.6 5.1C9.6 39.2 16.2 43.5 24 43.5z" />
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3a12.1 12.1 0 0 1-4 5.6l6.3 5.2C41.4 36 43.5 30.5 43.5 24c0-1.2-.1-2.3-.4-3.5z" />
  </svg>
);

/* ---------- password field ---------- */
function PasswordField({
  label,
  placeholder,
  autoComplete,
  name,
}: {
  label: string;
  placeholder: string;
  autoComplete: string;
  name?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="field">
      <label>{label}</label>
      <div className="ctrl">
        <input type={show ? "text" : "password"} name={name} placeholder={placeholder} autoComplete={autoComplete} />
        <button
          className="pw-toggle"
          type="button"
          aria-label={show ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          aria-pressed={show}
          onClick={() => setShow((s) => !s)}
          style={show ? { color: "var(--accent)" } : undefined}
        >
          <EyeIcon off={show} />
        </button>
      </div>
    </div>
  );
}

/* ---------- Google Identity Services loader ---------- */
type GoogleCredential = { credential: string };
function loadGoogle(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return reject();
    const w = window as unknown as { google?: unknown };
    if (w.google) return resolve();
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject();
    document.head.appendChild(s);
  });
}

export default function Login() {
  const router = useRouter();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  function finishLogin(user: AuthUser) {
    router.replace(HOME_BY_ROLE[user.roleKey]);
    router.refresh();
  }

  async function onLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setNotice("");
    const data = new FormData(e.currentTarget);
    const email = String(data.get("email") || "").trim();
    const password = String(data.get("password") || "");
    setLoading(true);
    try {
      const user = await login(email, password);
      finishLogin(user);
    } catch (err) {
      setError((err as Error).message || "Đăng nhập thất bại.");
    } finally {
      setLoading(false);
    }
  }

  async function onRegister(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const password = String(data.get("password") || "");
    const confirm = String(data.get("confirm") || "");
    if (name.length < 2) return setError("Vui lòng nhập họ tên.");
    if (password.length < 8) return setError("Mật khẩu tối thiểu 8 ký tự.");
    if (password !== confirm) return setError("Mật khẩu nhập lại không khớp.");
    setLoading(true);
    try {
      const user = await register(name, email, password);
      finishLogin(user);
    } catch (err) {
      setError((err as Error).message || "Đăng ký thất bại.");
    } finally {
      setLoading(false);
    }
  }

  async function onGoogle() {
    setError("");
    if (!GOOGLE_CLIENT_ID) {
      setError("Đăng nhập Google chưa được cấu hình (thiếu NEXT_PUBLIC_GOOGLE_CLIENT_ID).");
      return;
    }
    try {
      await loadGoogle();
      const g = (
        window as unknown as {
          google: {
            accounts: {
              id: { initialize: (o: unknown) => void; prompt: () => void };
            };
          };
        }
      ).google;
      g.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (resp: GoogleCredential) => {
          try {
            const user = await googleLogin(resp.credential);
            finishLogin(user);
          } catch (err) {
            setError((err as Error).message || "Đăng nhập Google thất bại.");
          }
        },
      });
      g.accounts.id.prompt();
    } catch {
      setError("Không tải được Google Sign-In.");
    }
  }

  async function onForgot() {
    setError("");
    setNotice("");
    const email = window.prompt("Nhập email để nhận liên kết đặt lại mật khẩu:");
    if (!email) return;
    try {
      const msg = await forgotPassword(email.trim());
      setNotice(msg);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div className="auth">
      <aside className="auth-side">
        <a className="logo" href="/">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO} alt="VIDEO EDITOR" />
        </a>
        <div className="side-body">
          <span className="kicker">Khu vực học viên</span>
          <h2 style={{ marginTop: 18 }}>
            Tiếp tục hành trình
            <br />
            nâng level editing của bạn.
          </h2>
          <p>Đăng nhập để truy cập khóa học, theo dõi tiến độ và nhận hỗ trợ 1:1 từ Danmotion.</p>
          <ul className="side-feats">
            <li>
              <span className="tick"><TickIcon /></span> Truy cập trọn đời các bài giảng
            </li>
            <li>
              <span className="tick"><TickIcon /></span> Theo dõi tiến độ từng chương
            </li>
            <li>
              <span className="tick"><TickIcon /></span> Kho tài nguyên + cộng đồng editor
            </li>
          </ul>
        </div>
        <div className="side-foot">© 2026 VIDEO EDITOR · Khóa học Video Editor quốc tế</div>
      </aside>

      <main className="auth-main">
        <div className="blob" />
        <a className="back" href="/">
          <BackIcon />
          Về trang chủ
        </a>
        <div className="auth-card">
          <div className="logo-m">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO} alt="VIDEO EDITOR" />
          </div>
          <div className="tabs" data-active={tab}>
            <div className="tab-thumb" />
            <button type="button" className={tab === "login" ? "active" : ""} onClick={() => { setTab("login"); setError(""); }}>
              Đăng nhập
            </button>
            <button type="button" className={tab === "register" ? "active" : ""} onClick={() => { setTab("register"); setError(""); }}>
              Đăng ký
            </button>
          </div>

          {/* LOGIN */}
          <form className={"pane" + (tab === "login" ? " show" : "")} onSubmit={onLogin}>
            <h1>Đăng nhập</h1>
            <p className="sub">Chào mừng trở lại! Nhập thông tin để tiếp tục học.</p>
            {error && tab === "login" && <p className="auth-error">{error}</p>}
            {notice && tab === "login" && (
              <p className="auth-error" style={{ background: "#e8f6ee", color: "#1a7f46" }}>{notice}</p>
            )}
            <div className="field">
              <label>Email</label>
              <div className="ctrl">
                <input type="email" name="email" placeholder="ban@email.com" autoComplete="email" defaultValue="student@lms.com" />
              </div>
            </div>
            <PasswordField label="Mật khẩu" name="password" placeholder="••••••••" autoComplete="current-password" />
            <div className="row">
              <label>
                <input type="checkbox" defaultChecked /> Ghi nhớ đăng nhập
              </label>
              <a onClick={onForgot} style={{ cursor: "pointer" }}>Quên mật khẩu?</a>
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? "Đang xử lý..." : "Đăng nhập"}
            </button>
            <div className="divider">hoặc</div>
            <button className="btn btn-google" type="button" onClick={onGoogle}>
              <GoogleIcon />
              Tiếp tục với Google
            </button>
            <p className="swap">
              Chưa có tài khoản? <a onClick={() => setTab("register")}>Đăng ký ngay</a>
            </p>
          </form>

          {/* REGISTER */}
          <form className={"pane" + (tab === "register" ? " show" : "")} onSubmit={onRegister}>
            <h1>Tạo tài khoản</h1>
            <p className="sub">Bắt đầu hành trình trở thành Video Editor quốc tế.</p>
            {error && tab === "register" && <p className="auth-error">{error}</p>}
            <div className="field">
              <label>Họ và tên</label>
              <div className="ctrl">
                <input type="text" name="name" placeholder="Nguyễn Văn A" autoComplete="name" />
              </div>
            </div>
            <div className="field">
              <label>Email</label>
              <div className="ctrl">
                <input type="email" name="email" placeholder="ban@email.com" autoComplete="email" />
              </div>
            </div>
            <PasswordField label="Mật khẩu" name="password" placeholder="Tối thiểu 8 ký tự" autoComplete="new-password" />
            <PasswordField label="Nhập lại mật khẩu" name="confirm" placeholder="••••••••" autoComplete="new-password" />
            <div className="row">
              <label>
                <input type="checkbox" defaultChecked /> Tôi đồng ý với{" "}
                <a href="#" style={{ marginLeft: 4 }}>điều khoản</a>
              </label>
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? "Đang xử lý..." : "Tạo tài khoản"}
            </button>
            <div className="divider">hoặc</div>
            <button className="btn btn-google" type="button" onClick={onGoogle}>
              <GoogleIcon />
              Tiếp tục với Google
            </button>
            <p className="swap">
              Đã có tài khoản? <a onClick={() => setTab("login")}>Đăng nhập</a>
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}
