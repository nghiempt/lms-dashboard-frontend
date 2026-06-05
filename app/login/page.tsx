import type { Metadata } from "next";
import Login from "../components/Login";

export const metadata: Metadata = {
  title: "Danmotion",
  description: "Khóa học đầu tiên tại Việt Nam tập trung vào style edit kiểu Apple & Devin Jatho — dạng video đang được nhiều khách hàng quốc tế trả giá cao.",
};

export default function LoginPage() {
  return <Login />;
}
