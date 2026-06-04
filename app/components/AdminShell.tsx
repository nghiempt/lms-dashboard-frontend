"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearSession, getCurrentUser, type AuthUser } from "@/lib/auth";
import { AdminIcon, NotifIcon } from "./adminIcons";

const LOGO = "/assets/16f53e33ca.png";

const NAV_MENU = [
  { label: "Tổng quan", href: "/admin", icon: AdminIcon.home },
  { label: "Quản lý khóa học", href: "/admin/courses", icon: AdminIcon.book },
  { label: "Quản lý học viên", href: "/admin/students", icon: AdminIcon.users },
  { label: "Đơn hàng", href: "/admin/orders", icon: AdminIcon.cart },
  { label: "Kho tài liệu", href: "/admin/resources", icon: AdminIcon.folder },
  { label: "Quản lý thông báo", href: "/admin/announcements", icon: AdminIcon.megaphone },
  { label: "Nhật ký hoạt động", href: "/admin/activity", icon: AdminIcon.activity },
];

const BELL = [
  {
    ic: NotifIcon.cart,
    color: "blue",
    body: (
      <>
        Đơn hàng mới <b>#INV-2042</b> từ Tuấn Kiệt
      </>
    ),
    time: "5 phút trước",
    unread: true,
  },
  {
    ic: NotifIcon.userCheck,
    color: "blue",
    body: (
      <>
        Học viên mới <b>Minh Trang</b> vừa đăng ký
      </>
    ),
    time: "1 giờ trước",
    unread: true,
  },
  {
    ic: NotifIcon.refund,
    color: "orange",
    body: (
      <>
        Yêu cầu <b>hoàn tiền</b> từ Đức Anh
      </>
    ),
    time: "3 giờ trước",
    unread: true,
  },
  {
    ic: NotifIcon.chart,
    color: "green",
    body: (
      <>
        Doanh thu tháng 6 đạt <b>84.6M</b> 🎉
      </>
    ),
    time: "1 ngày trước",
    unread: false,
  },
];

export default function AdminShell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: ReactNode;
  subtitle: string;
  /** Nút hành động hiển thị bên phải topbar (sau ô tìm kiếm). */
  actions?: ReactNode;
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser>({
    name: "Danmotion",
    email: "admin@admin.com",
    role: "Quản trị viên",
    roleKey: "admin",
    initials: "DM",
  });
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

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <div className="dash">
      <aside className="side">
        <Link className="logo" href="/admin">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO} alt="VIDEO EDITOR" />
          <span className="admin-tag">ADMIN</span>
        </Link>
        <div className="nav-lbl">Quản trị</div>
        {NAV_MENU.map((n) => (
          <Link
            key={n.href}
            className={"nav-i" + (isActive(n.href) ? " active" : "")}
            href={n.href}
          >
            {n.icon}
            <span>{n.label}</span>
          </Link>
        ))}
        <div className="nav-lbl">Khác</div>
        <Link
          className={"nav-i" + (isActive("/admin/settings") ? " active" : "")}
          href="/admin/settings"
        >
          {AdminIcon.gear}
          <span>Cài đặt</span>
        </Link>
        <a className="nav-i" onClick={askLogout}>
          {AdminIcon.logout}
          <span>Đăng xuất</span>
        </a>
        <div className="spacer" />
        <div className="user">
          <div className="ava">{user.initials}</div>
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
              {AdminIcon.search}
              <input type="text" placeholder="Tìm kiếm..." />
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
                {AdminIcon.bell}
                <span className="dot" />
              </button>
              <div className="notif-dd">
                <div className="nd-head">
                  <span className="nd-title">Thông báo</span>
                  <span className="nd-new">3 mới</span>
                </div>
                <div className="nd-list">
                  {BELL.map((n, i) => (
                    <Link
                      key={i}
                      className={"nd-item" + (n.unread ? " unread" : "")}
                      href="/admin/notifications"
                    >
                      <span className={"nd-ic " + n.color}>{n.ic}</span>
                      <div className="nd-tx">
                        <p>{n.body}</p>
                        <time>{n.time}</time>
                      </div>
                    </Link>
                  ))}
                </div>
                <Link className="nd-all" href="/admin/notifications">
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
                <div className="ava">{user.initials}</div>
                <div className="ub-info">
                  <span className="nm">{user.name}</span>
                  <span className="rl">{user.role}</span>
                </div>
                {AdminIcon.chevron}
              </div>
              <div className="dropdown">
                <Link href="/admin/settings">Hồ sơ</Link>
                <Link href="/admin/settings">Cài đặt</Link>
                <div className="sep" />
                <a className="danger" onClick={askLogout}>
                  Đăng xuất
                </a>
              </div>
            </div>

            {actions}
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
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
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
