"use client";

import { useEffect, useState } from "react";
import { Icon } from "../components/dashboardIcons";
import DashboardShell from "../components/DashboardShell";
import { SkeletonRows } from "../components/Loaders";
import { api } from "@/lib/api";
import { timeAgo } from "@/lib/format";

interface Group {
  id: string;
  name: string;
  category: string | null;
  memberCount: number;
  joinUrl: string | null;
}
interface Post {
  id: string;
  title: string;
  authorName: string | null;
  category: string | null;
  likeCount: number;
  createdAt: string;
}

export default function CommunityPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      api.get<Group[]>("/community/groups").then(setGroups),
      api.getFull<Post[]>("/community/posts", { limit: 10 }).then((r) => setPosts(r.data ?? [])),
    ]).finally(() => setLoading(false));
  }, []);

  return (
    <DashboardShell title="Cộng đồng" subtitle="Kết nối với cộng đồng editor và cập nhật mới nhất.">
      <div className="cm-grid">
        {groups.map((g) => (
          <div key={g.id} className="panel cm-card">
            <span className="comm-ico2">{Icon.users2}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="cc-nm" style={{ fontSize: 16 }}>{g.name}</div>
              <div className="ct-meta">
                Cộng đồng{g.category ? ` · ${g.category}` : ""} · {g.memberCount.toLocaleString("vi-VN")} thành viên
              </div>
            </div>
            <a className="btn" href={g.joinUrl ?? "#"} target={g.joinUrl ? "_blank" : undefined} rel="noreferrer">
              Tham gia
            </a>
          </div>
        ))}
        {loading && [0, 1].map((i) => <div key={i} className="panel" style={{ padding: 18 }}><div className="skeleton-row" style={{ margin: 0 }} /></div>)}
        {!loading && groups.length === 0 && <div className="panel" style={{ padding: 18 }}>Chưa có nhóm nào.</div>}
      </div>

      <div className="panel">
        <div className="panel-h">
          <h3>Bài viết nổi bật</h3>
        </div>
        {loading && <SkeletonRows rows={4} />}
        {posts.map((p) => (
          <div key={p.id} className="po-row">
            <div className="po-av">{(p.authorName ?? "?").charAt(0).toUpperCase()}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="ct-nm">{p.title}</div>
              <div className="ct-meta">
                {p.authorName ?? "Ẩn danh"} · {timeAgo(p.createdAt)}
              </div>
            </div>
            <div className="po-likes">♥ {p.likeCount}</div>
          </div>
        ))}
        {!loading && posts.length === 0 && <div className="ct-meta" style={{ padding: 12 }}>Chưa có bài viết.</div>}
      </div>
    </DashboardShell>
  );
}
