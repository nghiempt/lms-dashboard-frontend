"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getCurrentUser, logout, type AuthUser } from "@/lib/auth";
import { api } from "@/lib/api";
import { timeAgo } from "@/lib/format";
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

interface BellItem {
  id: string;
  title: string;
  isRead: boolean;
  createdAt: string;
}

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
    id: "",
    name: "Quản trị viên",
    email: "",
    role: "Quản trị viên",
    roleKey: "admin",
    initials: "QT",
  });
  const [openMenu, setOpenMenu] = useState<"user" | "notif" | null>(null);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [bell, setBell] = useState<BellItem[]>([]);
  const [unread, setUnread] = useState(0);
  const [search, setSearch] = useState("");
  const badgeRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = search.trim();
    if (q) router.push(`/admin/courses?search=${encodeURIComponent(q)}`);
  }

  useEffect(() => {
    setUser(getCurrentUser());
    api
      .getFull<BellItem[]>("/notifications/me", { limit: 5 })
      .then((res) => {
        setBell(res.data ?? []);
        setUnread(Number(res.meta?.unreadCount ?? 0));
      })
      .catch(() => undefined);
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
      // ⌘K / Ctrl+K: focus ô tìm kiếm
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  function askLogout() {
    setOpenMenu(null);
    setLogoutOpen(true);
  }
  function confirmLogout() {
    void logout().finally(() => {
      router.replace("/login");
      router.refresh();
    });
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
        <button type="button" className="nav-i" onClick={askLogout}>
          {AdminIcon.logout}
          <span>Đăng xuất</span>
        </button>
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
            <form className="search" onSubmit={onSearch}>
              {AdminIcon.search}
              <input
                ref={searchRef}
                type="text"
                placeholder="Tìm khóa học..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Tìm khóa học"
              />
              <kbd className="search-kbd">⌘K</kbd>
            </form>

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
                {unread > 0 && <span className="dot" />}
              </button>
              <div className="notif-dd">
                <div className="nd-head">
                  <span className="nd-title">Thông báo</span>
                  <span className="nd-new">{unread} mới</span>
                </div>
                <div className="nd-list">
                  {bell.length === 0 && (
                    <div className="nd-item"><div className="nd-tx"><p>Chưa có thông báo</p></div></div>
                  )}
                  {bell.map((n) => (
                    <Link
                      key={n.id}
                      className={"nd-item" + (!n.isRead ? " unread" : "")}
                      href="/admin/notifications"
                    >
                      <span className="nd-ic blue">{NotifIcon.cart}</span>
                      <div className="nd-tx">
                        <p>{n.title}</p>
                        <time>{timeAgo(n.createdAt)}</time>
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
                <button type="button" className="danger" onClick={askLogout}>
                  Đăng xuất
                </button>
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
