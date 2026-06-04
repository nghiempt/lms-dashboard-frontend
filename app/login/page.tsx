import type { Metadata } from "next";
import Login from "../components/Login";

export const metadata: Metadata = {
  title: "Đăng nhập — VIDEO EDITOR",
  description: "Đăng nhập khu vực học viên VIDEO EDITOR.",
};

export default function LoginPage() {
  return <Login />;
}
