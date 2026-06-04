import type { Metadata } from "next";
import { Icon } from "../components/dashboardIcons";
import DashboardShell from "../components/DashboardShell";

export const metadata: Metadata = { title: "Cộng đồng — VIDEO EDITOR" };

const GROUPS = [
  { name: "Việc làm Editor Freelance", meta: "Cộng đồng · Việc làm · 12.4k thành viên" },
  { name: "Editor Upwork & IG Việt Nam", meta: "Cộng đồng · Quốc tế · 8.7k thành viên" },
];

const POSTS = [
  { av: "C", title: "Cách build portfolio nhận job $1000+", meta: "Minh chia sẻ · 2 giờ trước", likes: "48" },
  { av: "W", title: "Workflow color grading nhanh trong Premiere", meta: "Dân · Hôm qua", likes: "126" },
  { av: "T", title: "Tuyển editor short-form, lương theo job", meta: "Tin tuyển dụng · 2 ngày trước", likes: "73" },
];

export default function CommunityPage() {
  return (
    <DashboardShell title="Cộng đồng" subtitle="Kết nối với cộng đồng editor và cập nhật mới nhất.">
      <div className="cm-grid">
        {GROUPS.map((g) => (
          <div key={g.name} className="panel cm-card">
            <span className="comm-ico2">{Icon.users2}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="cc-nm" style={{ fontSize: 16 }}>
                {g.name}
              </div>
              <div className="ct-meta">{g.meta}</div>
            </div>
            <a className="btn" href="#">
              Tham gia
            </a>
          </div>
        ))}
      </div>

      <div className="panel">
        <div className="panel-h">
          <h3>Bài viết nổi bật</h3>
          <a className="ct-act">Xem tất cả</a>
        </div>
        {POSTS.map((p) => (
          <div key={p.title} className="po-row">
            <div className="po-av">{p.av}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="ct-nm">{p.title}</div>
              <div className="ct-meta">{p.meta}</div>
            </div>
            <div className="po-likes">♥ {p.likes}</div>
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}
