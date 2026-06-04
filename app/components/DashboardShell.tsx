"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearSession, getCurrentUser, type AuthUser } from "@/lib/auth";
import { Icon, NbBook, NbChat, NbTag, NbCheck } from "./dashboardIcons";

const LOGO = "/assets/16f53e33ca.png";
const AVATAR = "/assets/avatar.jpg";

const NAV_MENU = [
  { label: "Tổng quan", href: "/", icon: Icon.home },
  { label: "Khóa học của tôi", href: "/courses", icon: Icon.book },
  { label: "Tiến độ học", href: "/progress", icon: Icon.chart },
  { label: "Thanh toán", href: "/payment", icon: Icon.card },
  { label: "Cộng đồng", href: "/community", icon: Icon.users },
];

const BELL = [
  { ic: NbBook, color: "blue", body: (<>Bài giảng mới <b>Pacing &amp; nhịp cắt</b> trong Khóa Premium Elite</>), time: "10 phút trước", unread: true },
  { ic: NbChat, color: "blue", body: (<><b>Dân</b> đã trả lời feedback của bạn</>), time: "2 giờ trước", unread: true },
  { ic: NbTag, color: "orange", body: <>Ưu đãi: giảm 20% nâng cấp lên Elite</>, time: "1 ngày trước", unread: false },
  { ic: NbCheck, color: "green", body: (<>Hoàn thành chương <b>Apple Style</b> 🎉</>), time: "2 ngày trước", unread: false },
];

export default function DashboardShell({
  title,
  subtitle,
  children,
}: {
  title: ReactNode;
  subtitle: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser>({ name: "Tuấn Kiệt", email: "admin@admin.com", role: "Học viên" });
  const [openMenu, setOpenMenu] = useState<"user" | "notif" | null>(null);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const badgeRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (badgeRef.current?.contains(t) || notifRef.current?.contains(t)) return;
      setOpenMenu(null);
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLogoutOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  function askLogout() {
    setOpenMenu(null);
    setLogoutOpen(true);
  }
  function confirmLogout() {
    clearSession();
    router.replace("/login");
    router.refresh();
  }

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <div className="dash">
      <aside className="side">
        <Link className="logo" href="/">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO} alt="VIDEO EDITOR" />
        </Link>
        <div className="nav-lbl">Menu</div>
        {NAV_MENU.map((n) => (
          <Link key={n.href} className={"nav-i" + (isActive(n.href) ? " active" : "")} href={n.href}>
            {n.icon}
            <span>{n.label}</span>
          </Link>
        ))}
        <div className="nav-lbl">Khác</div>
        <Link className={"nav-i" + (isActive("/settings") ? " active" : "")} href="/settings">
          {Icon.gear}
          <span>Cài đặt</span>
        </Link>
        <a className="nav-i" onClick={askLogout}>
          {Icon.logout}
          <span>Đăng xuất</span>
        </a>
        <div className="spacer" />
        <div className="user">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="ava" src={AVATAR} alt={user.name} />
          <div style={{ minWidth: 0 }}>
            <div className="nm">{user.name}</div>
            <div className="em">{user.email}</div>
          </div>
        </div>
      </aside>

      <main className="main">
        <div className="topbar">
          <div>
            <h1>{title}</h1>
            <div className="hi">{subtitle}</div>
          </div>
          <div className="top-act">
            <div className="search">
              {Icon.search}
              <input type="text" placeholder="Tìm khóa học, bài giảng..." />
            </div>

            <div className={"notif" + (openMenu === "notif" ? " open" : "")} ref={notifRef}>
              <button
                className="icon-btn"
                aria-label="Thông báo"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenMenu((m) => (m === "notif" ? null : "notif"));
                }}
              >
                {Icon.bell}
                <span className="dot" />
              </button>
              <div className="notif-dd">
                <div className="nd-head">
                  <span className="nd-title">Thông báo</span>
                  <span className="nd-new">2 mới</span>
                </div>
                <div className="nd-list">
                  {BELL.map((n, i) => (
                    <Link key={i} className={"nd-item" + (n.unread ? " unread" : "")} href="/notifications">
                      <span className={"nd-ic " + n.color}>{n.ic}</span>
                      <div className="nd-tx">
                        <p>{n.body}</p>
                        <time>{n.time}</time>
                      </div>
                    </Link>
                  ))}
                </div>
                <Link className="nd-all" href="/notifications">
                  Xem tất cả thông báo
                </Link>
              </div>
            </div>

            <div className={"user-badge" + (openMenu === "user" ? " open" : "")} ref={badgeRef}>
              <div
                style={{ display: "flex", alignItems: "center", gap: 10 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenMenu((m) => (m === "user" ? null : "user"));
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="ava" src={AVATAR} alt={user.name} />
                <div className="ub-info">
                  <span className="nm">{user.name}</span>
                  <span className="rl">{user.role}</span>
                </div>
                {Icon.chevron}
              </div>
              <div className="dropdown">
                <Link href="/settings">
                  {Icon.user}
                  <span>Hồ sơ cá nhân</span>
                </Link>
                <Link href="/courses">
                  {Icon.bookSm}
                  <span>Khóa học của tôi</span>
                </Link>
                <Link href="/settings">
                  {Icon.gearSm}
                  <span>Cài đặt</span>
                </Link>
                <div className="sep" />
                <a className="danger" onClick={askLogout}>
                  {Icon.logoutSm}
                  <span>Đăng xuất</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {children}
      </main>

      <div
        className={"modal-ov" + (logoutOpen ? " open" : "")}
        onClick={(e) => e.target === e.currentTarget && setLogoutOpen(false)}
      >
        <div className="modal">
          <div className="modal-ic">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <path d="M16 17l5-5-5-5" />
              <path d="M21 12H9" />
            </svg>
          </div>
          <h3>Đăng xuất?</h3>
          <p>Bạn có chắc muốn đăng xuất khỏi tài khoản của mình?</p>
          <div className="modal-act">
            <button className="btn-sec" type="button" onClick={() => setLogoutOpen(false)}>
              Hủy
            </button>
            <button className="btn-danger" type="button" onClick={confirmLogout}>
              Đăng xuất
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
