"use client";

import { useEffect, useState } from "react";
import AdminShell from "../../components/AdminShell";
import { SkeletonRows } from "../../components/Loaders";
import { api } from "@/lib/api";
import { formatDateTime } from "@/lib/format";

const COLS = "1.5fr 1.4fr 2fr 1.2fr 1.3fr";

interface Log {
  id: string;
  action: string;
  ipAddress: string | null;
  deviceLabel: string | null;
  createdAt: string;
  user: { fullName: string } | null;
}

function initials(name: string) {
  const p = name.trim().split(/\s+/);
  return ((p[0]?.[0] ?? "") + (p.length > 1 ? p[p.length - 1][0] : "")).toUpperCase() || "?";
}

export default function AdminActivityPage() {
  const [rows, setRows] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getFull<Log[]>("/activity", { limit: 100 })
      .then((r) => setRows(r.data ?? []))
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminShell title="Nhật ký hoạt động" subtitle="Nhật ký truy cập của học viên.">
      <div className="panel">
        <div className="panel-h">
          <h3>Nhật ký truy cập học viên</h3>
          <span className="sub">{rows.length} hoạt động gần đây</span>
        </div>
        <div className="atbl-h" style={{ gridTemplateColumns: COLS }}>
          <div>Tài khoản</div><div>Thời gian truy cập</div><div>Hành động</div><div>IP</div><div>Thiết bị</div>
        </div>
        {loading && <SkeletonRows rows={6} />}
        {rows.map((r) => (
          <div key={r.id} className="atbl-r" style={{ gridTemplateColumns: COLS }}>
            <div className="a-name">
              <div className="a-av">{initials(r.user?.fullName ?? "?")}</div>
              <div className="a-nm">{r.user?.fullName ?? "—"}</div>
            </div>
            <div className="a-sub" style={{ fontSize: 13, color: "var(--muted)" }}>{formatDateTime(r.createdAt)}</div>
            <div className="a-nm" style={{ fontWeight: 500, fontSize: 13.5 }}>{r.action}</div>
            <div className="a-sub" style={{ fontSize: 13, color: "var(--muted)", fontVariantNumeric: "tabular-nums" }}>{r.ipAddress ?? "—"}</div>
            <div className="a-sub" style={{ fontSize: 13, color: "var(--muted)" }}>{r.deviceLabel ?? "—"}</div>
          </div>
        ))}
        {!loading && rows.length === 0 && <div className="ct-meta" style={{ padding: 12 }}>Chưa có hoạt động.</div>}
      </div>
    </AdminShell>
  );
}
