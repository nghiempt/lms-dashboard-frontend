import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { ToastProvider } from "./components/Toast";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Danmotion LMS",
  description: "Khóa học đầu tiên tại Việt Nam tập trung vào style edit kiểu Apple & Devin Jatho — dạng video đang được nhiều khách hàng quốc tế trả giá cao.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" className={inter.variable}>
      <body>
        <ToastProvider>{children}</ToastProvider>
        <Script
          src="https://feedback.tino.vn/feedback-widget.js"
          data-api-key="ede9009d-df6a-4d5b-af73-84478ff3c4cb"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
