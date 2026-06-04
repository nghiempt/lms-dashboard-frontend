# Kịch bản Demo — LMS (FE đã ráp API thật)

## 0. Khởi động (local)

**Backend** (cửa sổ terminal 1):
```bash
cd lms-dashboard-backend
npm run start:dev          # chạy tại http://localhost:4000/api/v1
```
**Frontend** (terminal 2):
```bash
cd lms-dashboard-frontend
npm run dev                # chạy tại http://localhost:3000
```
> FE đọc `NEXT_PUBLIC_API_URL` trong `.env.local` (đang trỏ `http://localhost:4000/api/v1`).
> Khi deploy: chỉ cần đổi `NEXT_PUBLIC_API_URL` sang domain BE thật.

Tài khoản seed sẵn:
- **Admin:** `admin@admin.com` / `admin123`
- **Học viên:** `student@lms.com` / `student123`

---

## A. Luồng HỌC VIÊN

### 1. Đăng ký tài khoản mới
1. Mở `http://localhost:3000` → tự chuyển `/login`.
2. Tab **Đăng ký** → nhập Họ tên / Email / Mật khẩu (≥8 ký tự) / Nhập lại → **Tạo tài khoản**.
3. Vào thẳng Dashboard học viên (token JWT đã lưu). *(Email xác thực được gửi nếu SMTP cấu hình đúng.)*

> Hoặc đăng nhập nhanh bằng `student@lms.com / student123`.

### 2. Mua khóa học
1. Sidebar **Khóa học của tôi** → nút **+ Khám phá khóa học** (hoặc vào `/courses/catalog`).
2. Chọn 1 khóa chưa sở hữu → **Mua ngay**.
3. Hiện modal **QR SePay** + thông tin chuyển khoản (số TK, nội dung = mã đơn `INV-xxxxxx`).
4. Hai cách xác nhận thanh toán:
   - **Thật:** chuyển khoản đúng nội dung → SePay gọi webhook → đơn tự chuyển PAID.
   - **Demo nhanh:** sang tab Admin → **Đơn hàng** → bấm **Xác nhận** đơn vừa tạo. Quay lại bấm **"Tôi đã thanh toán"** → khóa được mở.

### 3. Học & ghi nhận tiến độ
1. **Khóa học của tôi** → **Tiếp tục học** (hoặc card khóa).
2. Trang học: bên phải là danh sách chương/bài (bài khóa có ổ khóa, bài Free/đã mở mới bấm được).
3. Chọn 1 bài → video phát (Bunny iframe có watermark email / YouTube). Hệ thống **ghi VideoAccessLog**.
4. Bấm **Đánh dấu hoàn thành** → cập nhật tiến độ + ghi **study session** (giờ học).
5. Về **Tổng quan** / **Tiến độ học**: thấy % hoàn thành, video đã xem, biểu đồ giờ học, chuỗi ngày học cập nhật theo dữ liệu thật.

### 4. Các tab khác
- **Thanh toán:** tổng đã chi, số khóa sở hữu, lịch sử hóa đơn (đơn PENDING có nút Thanh toán).
- **Thông báo:** xem thông báo admin gửi, bấm để đánh dấu đã đọc; chuông ở topbar hiện số chưa đọc.
- **Cộng đồng:** nhóm + bài viết nổi bật.
- **Cài đặt:** sửa hồ sơ (tên/sđt/giới thiệu), **đổi ảnh đại diện** (upload MinIO), **đổi mật khẩu**, bật/tắt thông báo.

---

## B. Luồng ADMIN  (đăng xuất, đăng nhập `admin@admin.com / admin123` → vào `/admin`)

### 1. Tổng quan
Doanh thu tháng, tổng học viên, đơn tháng, số khóa; biểu đồ doanh thu 6 tháng; khóa bán chạy; đơn hàng gần đây — tất cả số liệu thật từ DB.

### 2. Quản lý khóa học
1. **Quản lý khóa học** → **+ Thêm khóa học** (tên, giá, trạng thái) → tạo.
2. Bấm icon **sửa** ở 1 khóa → trang **Chỉnh sửa**: đổi tên/giá/mô tả, **Thêm chương**, **Thêm bài học**; mỗi bài chọn nguồn video (YouTube/Bunny), nhập Video ID, đặt Miễn phí/Có phí, Cơ bản/Nâng cao, Mở/Khóa → **Lưu khóa học**.
3. (Học viên vào lại khóa sẽ thấy chương/bài mới + trạng thái khóa tương ứng.)

### 3. Quản lý học viên
1. **Quản lý học viên**: danh sách kèm số khóa, % tiến độ TB, tổng chi tiêu, trạng thái.
2. Bấm **sửa** → drawer: xem khóa đã mua + tiến độ, đổi tên, **Tạm khóa / Kích hoạt**, Lưu.
3. Icon **thùng rác** → xóa học viên.
   - *Thử khóa học viên rồi đăng nhập tài khoản đó → bị chặn đăng nhập.*

### 4. Đơn hàng & doanh thu
4 thẻ thống kê; bảng đơn; **Xác nhận** đơn PENDING (chuyển khoản thủ công) hoặc **Hoàn tiền** đơn PAID (gỡ quyền học).

### 5. Đẩy thông báo cho học viên
1. **Quản lý thông báo** → nhập tiêu đề/nội dung → **Gửi tới**: *Tất cả học viên* hoặc *theo khóa* → **Gửi thông báo** (hoặc **Lưu nháp** rồi bấm gửi sau).
2. Đăng nhập lại học viên → tab **Thông báo** / chuông topbar thấy thông báo mới.

### 6. Kho tài liệu
**Kho tài liệu** → **Tải lên** (chọn file → upload MinIO), gắn vào khóa, đặt loại → xuất hiện trong bảng (kèm lượt tải).

### 7. Nhật ký hoạt động
**Nhật ký hoạt động**: log thật (đăng nhập, mua khóa, xem bài...) kèm IP & thiết bị. **Thông báo** (admin): feed hoạt động hệ thống.

### 8. Cài đặt hệ thống
Hồ sơ admin, đổi mật khẩu, thông tin website (tên/email/hotline/social), bật tắt cổng thanh toán & thông báo — lưu vào `SystemSetting`.

---

## Gợi ý chuỗi demo liền mạch (5 phút)
1. Admin **tạo khóa** + thêm 1 chương/1 bài (video YouTube id bất kỳ, để **Miễn phí** để xem ngay).
2. Đăng ký **học viên mới** → **Catalog** → mua khóa vừa tạo → (Admin **Xác nhận đơn**) → **Học** bài → **Đánh dấu hoàn thành**.
3. Admin xem **Đơn hàng** (doanh thu tăng), **Học viên** (tiến độ học viên), **Nhật ký hoạt động** (login/mua/xem bài), rồi **đẩy thông báo** "Chúc mừng hoàn thành bài học".
4. Học viên thấy **thông báo** + **tiến độ** cập nhật.
