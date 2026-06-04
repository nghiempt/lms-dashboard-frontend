"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { clearSession, getCurrentUser, type AuthUser } from "@/lib/auth";

const LOGO = "/assets/16f53e33ca.png";
const AVATAR = "/assets/avatar.jpg";

/* ============================================================
   Icons (inline, ported 1:1 từ HTML)
   ============================================================ */
const I = {
  home: (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
    </svg>
  ),
  book: (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  ),
  chart: (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" />
      <path d="M7 14l3-3 3 3 5-6" />
    </svg>
  ),
  card: (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
    </svg>
  ),
  users: (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    </svg>
  ),
  gear: (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  logout: (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  ),
  search: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  ),
  bell: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.7 21a2 2 0 0 1-3.4 0" />
    </svg>
  ),
  chevron: (
    <svg className="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9l6 6 6-6" />
    </svg>
  ),
  user: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21v-1a6 6 0 0 1 12 0v1" transform="translate(2,0)" />
    </svg>
  ),
  bookSm: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5z" />
    </svg>
  ),
  gearSm: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.5-2.3 1a7 7 0 0 0-1.7-1l-.3-2.5h-4l-.3 2.5a7 7 0 0 0-1.7 1l-2.3-1-2 3.5 2 1.5a7 7 0 0 0 0 2l-2 1.5 2 3.5 2.3-1a7 7 0 0 0 1.7 1l.3 2.5h4l.3-2.5a7 7 0 0 0 1.7-1l2.3 1 2-3.5-2-1.5a7 7 0 0 0 .1-1z" />
    </svg>
  ),
  logoutSm: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  ),
  bag: (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  ),
  clock: (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  ),
  eye: (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  list: (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
    </svg>
  ),
  share: (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M19 5 5 19" />
      <circle cx="6.5" cy="6.5" r="2.5" />
      <circle cx="17.5" cy="17.5" r="2.5" />
    </svg>
  ),
};

/* notification icons (small) */
const NbBook = (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5z" />
  </svg>
);
const NbChat = (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z" />
  </svg>
);
const NbTag = (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L2 12V2h10l8.6 8.6a2 2 0 0 1 0 2.8z" />
    <circle cx="7" cy="7" r="1.5" />
  </svg>
);
const NbCheck = (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

/* ============================================================
   Data
   ============================================================ */
const NAV_MENU = [
  { label: "Tổng quan", icon: I.home, active: true },
  { label: "Khóa học của tôi", icon: I.book },
  { label: "Tiến độ học", icon: I.chart },
  { label: "Thanh toán", icon: I.card },
  { label: "Cộng đồng", icon: I.users },
];

const STATS = [
  { ic: I.bag, val: "2", lbl: "Khóa học đã mua" },
  { ic: I.clock, val: "48.5h", lbl: "Tổng giờ học" },
  { ic: I.eye, val: "86", lbl: "Video đã xem" },
  { ic: I.list, val: "42", lbl: "Video còn lại" },
  { ic: I.share, val: "67%", lbl: "Tỷ lệ hoàn thành" },
];

const BARS = [
  { v: "2.5h", h: 61, d: "T2" },
  { v: "1.8h", h: 44, d: "T3" },
  { v: "3.2h", h: 78, d: "T4" },
  { v: "0.9h", h: 22, d: "T5" },
  { v: "4.1h", h: 100, d: "T6", peak: true },
  { v: "2.7h", h: 66, d: "T7" },
  { v: "3.5h", h: 85, d: "CN" },
];

const COURSES = [
  { code: "KP", name: "Khóa Premium", meta: "6 chương · 27 bài", pct: 62, price: "5.890.000", status: "learning", statusLabel: "Đang học" },
  { code: "PE", name: "Khóa Premium Elite", meta: "9 chương · 37 bài", pct: 18, price: "10.890.000", status: "learning", statusLabel: "Đang học" },
];

const NOTIFS = [
  { ic: NbBook, color: "blue", body: (<>Bài giảng mới <b>Pacing &amp; nhịp cắt</b> trong Khóa Premium Elite</>), time: "10 phút trước", unread: true },
  { ic: NbChat, color: "blue", body: (<><b>Dân</b> đã trả lời feedback của bạn</>), time: "2 giờ trước", unread: true },
  { ic: NbTag, color: "orange", body: <>Ưu đãi: giảm 20% nâng cấp lên Elite</>, time: "1 ngày trước", unread: false },
  { ic: NbCheck, color: "green", body: (<>Hoàn thành chương <b>Apple Style</b> 🎉</>), time: "2 ngày trước", unread: false },
];

const DONUT_PCT = 67;

/* ============================================================
   Component
   ============================================================ */
export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser>({ name: "Tuấn Kiệt", email: "admin@admin.com", role: "Học viên" });
  const [mounted, setMounted] = useState(false);
  const [openMenu, setOpenMenu] = useState<"user" | "notif" | null>(null);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const badgeRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUser(getCurrentUser());
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // click ra ngoài để đóng dropdown
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (badgeRef.current?.contains(t) || notifRef.current?.contains(t)) return;
      setOpenMenu(null);
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  // ESC đóng modal
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

  const initials = user.name
    .split(" ")
    .slice(-1)[0]
    .charAt(0)
    .toUpperCase();

  const C = 2 * Math.PI * 70;

  return (
    <div className="dash">
      <aside className="side">
        <a className="logo" href="/">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO} alt="VIDEO EDITOR" />
        </a>
        <div className="nav-lbl">Menu</div>
        {NAV_MENU.map((n) => (
          <a key={n.label} className={"nav-i" + (n.active ? " active" : "")}>
            {n.icon}
            <span>{n.label}</span>
          </a>
        ))}
        <div className="nav-lbl">Khác</div>
        <a className="nav-i">
          {I.gear}
          <span>Cài đặt</span>
        </a>
        <a className="nav-i" onClick={askLogout}>
          {I.logout}
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
            <h1>Chào, {user.name} 👋</h1>
            <div className="hi">Hôm nay học gì nào? Tiếp tục lộ trình của bạn.</div>
          </div>
          <div className="top-act">
            <div className="search">
              {I.search}
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
                {I.bell}
                <span className="dot" />
              </button>
              <div className="notif-dd">
                <div className="nd-head">
                  <span className="nd-title">Thông báo</span>
                  <span className="nd-new">2 mới</span>
                </div>
                <div className="nd-list">
                  {NOTIFS.map((n, i) => (
                    <a key={i} className={"nd-item" + (n.unread ? " unread" : "")}>
                      <span className={"nd-ic " + n.color}>{n.ic}</span>
                      <div className="nd-tx">
                        <p>{n.body}</p>
                        <time>{n.time}</time>
                      </div>
                    </a>
                  ))}
                </div>
                <a className="nd-all">Xem tất cả thông báo</a>
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
                {I.chevron}
              </div>
              <div className="dropdown">
                <a>
                  {I.user}
                  <span>Hồ sơ cá nhân</span>
                </a>
                <a>
                  {I.bookSm}
                  <span>Khóa học của tôi</span>
                </a>
                <a>
                  {I.gearSm}
                  <span>Cài đặt</span>
                </a>
                <div className="sep" />
                <a className="danger" onClick={askLogout}>
                  {I.logoutSm}
                  <span>Đăng xuất</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="stats">
          {STATS.map((s) => (
            <div key={s.lbl} className="panel stat">
              <div className="ic">{s.ic}</div>
              <div className="val">{s.val}</div>
              <div className="lbl">{s.lbl}</div>
            </div>
          ))}
        </div>

        <div className="charts">
          <div className="panel">
            <div className="panel-h">
              <h3>Giờ học 7 ngày qua</h3>
              <span className="sub">Tổng 18.7 giờ</span>
            </div>
            <div className="bars">
              {BARS.map((b) => (
                <div key={b.d} className={"bar" + (b.peak ? " peak" : "")}>
                  <span className="v">{b.v}</span>
                  <div className="col" style={{ height: mounted ? `${b.h}%` : 0 }} />
                  <span className="d">{b.d}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="panel">
            <div className="panel-h">
              <h3>Tỷ lệ hoàn thành</h3>
            </div>
            <div className="donut-wrap">
              <div className="donut">
                <svg width="170" height="170" viewBox="0 0 170 170">
                  <circle className="ring-bg" cx="85" cy="85" r="70" />
                  <circle
                    className="ring"
                    cx="85"
                    cy="85"
                    r="70"
                    style={{ strokeDasharray: C, strokeDashoffset: mounted ? C * (1 - DONUT_PCT / 100) : C }}
                  />
                </svg>
                <div className="ctr">
                  <b>{DONUT_PCT}%</b>
                  <span>hoàn thành</span>
                </div>
              </div>
              <div className="donut-foot">86/128 video đã xem trên toàn bộ khóa</div>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-h">
            <h3>Khóa học của tôi</h3>
            <span className="sub">2 khóa</span>
          </div>
          <div className="ctable">
            <div className="ct-head">
              <div>Khóa học</div>
              <div>Tiến trình</div>
              <div>Học phí</div>
              <div>Trạng thái</div>
              <div />
            </div>
            {COURSES.map((c) => (
              <div key={c.code} className="ct-row">
                <div className="ct-course">
                  <div className="ct-thumb">{c.code}</div>
                  <div style={{ minWidth: 0 }}>
                    <div className="ct-nm">{c.name}</div>
                    <div className="ct-meta">{c.meta}</div>
                  </div>
                </div>
                <div className="prog">
                  <div className="track">
                    <div className="fill" style={{ width: `${c.pct}%` }} />
                  </div>
                  <span className="pct">{c.pct}%</span>
                </div>
                <div className="price">
                  {c.price}
                  <span style={{ fontSize: 11, color: "var(--muted-2)", fontWeight: 400 }}>đ</span>
                </div>
                <div>
                  <span className={"badge " + c.status}>{c.statusLabel}</span>
                </div>
                <button className="ct-act" type="button">
                  Tiếp tục
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* logout modal */}
      <div className={"modal-ov" + (logoutOpen ? " open" : "")} onClick={(e) => e.target === e.currentTarget && setLogoutOpen(false)}>
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
