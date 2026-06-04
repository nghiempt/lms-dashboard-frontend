# VIDEO EDITOR — Landing (Next.js)

Bản chuyển đổi (port) landing page từ file `index.html` gốc sang **Next.js App Router + TypeScript**.
Style được giữ **giống 100%** so với bản gốc.

## Tech stack

- **Next.js 16** (App Router) + **React 19**
- **TypeScript**
- **Tailwind CSS v4** (đã cài sẵn, sẵn sàng dùng — trang hiện được style bằng CSS gốc để đảm bảo pixel-perfect)
- **next/font** (Inter, self-hosted)

## Chạy dự án

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # build production
npm run start    # chạy bản production
```

## Cấu trúc

```
app/
  layout.tsx            # <html lang="vi">, font Inter, metadata
  page.tsx             # render <Landing/>
  globals.css          # toàn bộ CSS gốc (verbatim) + @import "tailwindcss"
  components/
    Landing.tsx        # 'use client' — toàn bộ section + hook reveal/header scroll
    data.ts            # nội dung (COURSE, PLANS, FEEDBACK, FAQ, COMMS, VREEL...)
    icons.tsx          # các SVG icon (Tick, ArrowR, Stars, ...)
public/
  assets/              # ảnh + video được tách ra từ base64 trong file HTML gốc
```

## Ghi chú về độ trung thực (fidelity)

- **CSS gốc được giữ nguyên 1:1** trong `globals.css` — đây là cách chắc chắn nhất để
  giống 100%. Tailwind vẫn được cấu hình đầy đủ nếu bạn muốn dùng cho phần mở rộng sau này.
- Các blob ảnh/video **base64** nhúng trong HTML gốc đã được tách ra thành file trong
  `public/assets/` và tham chiếu bằng đường dẫn (giúp source gọn nhẹ, không đổi giao diện).
- Giá trị token mặc định (accent `#008DE6`, nút `#ff943b`, glow `0.6`, nền `#00050d`...)
  được "bake" thẳng vào `:root` đúng như bản React render ra (panel "Tweaks" của công cụ
  thiết kế trong bản gốc chỉ là UI chỉnh sửa, không hiển thị khi xem thường → đã bỏ).
- Hook `useReveal` (animation khi cuộn) và trạng thái scroll của header được port nguyên bản.
- Đã so sánh ảnh chụp full-page giữa bản gốc và bản Next.js — khớp toàn bộ 10 section.
