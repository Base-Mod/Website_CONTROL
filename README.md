# Hệ thống Giám sát và Điều khiển Điện năng

Website giám sát và điều khiển điện năng thời gian thực với giao diện hiện đại.

## Tính năng

### ⚡ Dashboard
- Hiển thị thống kê tổng quan: tổng thiết bị, thiết bị đang hoạt động, công suất hiện tại, năng lượng tiêu thụ
- Biểu đồ công suất và điện áp theo thời gian
- Xem nhanh danh sách thiết bị
- Cảnh báo gần đây

### 🔌 Quản lý Thiết bị
- Xem danh sách thiết bị chi tiết
- Bật/tắt thiết bị từ xa
- Hiển thị thông số thời gian thực: điện áp, dòng điện, công suất
- Tạo dữ liệu mô phỏng để kiểm tra

### 📈 Lịch sử Dữ liệu
- Biểu đồ lịch sử công suất, điện áp, dòng điện
- Biểu đồ năng lượng tích lũy
- Chọn khoảng thời gian: 6h, 12h, 24h, 48h, 7 ngày

### ⚠️ Cảnh báo
- Danh sách cảnh báo theo mức độ nghiêm trọng
- Cảnh báo điện áp cao/thấp, dòng điện cao
- Đánh dấu đã đọc/chưa đọc

## Công nghệ sử dụng

- **Backend**: PHP 8.x
- **Database**: MySQL/MariaDB
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Charts**: Chart.js 4.4.0
- **Server**: Apache (XAMPP/WAMP/LAMP)

## Cài đặt

### 1. Yêu cầu hệ thống
- XAMPP/WAMP/LAMP (Apache 2.4+, PHP 8.0+, MySQL 8.0+)
- Trình duyệt web hiện đại (Chrome, Firefox, Edge)

### 2. Cài đặt cơ sở dữ liệu

1. Khởi động XAMPP/WAMP
2. Mở phpMyAdmin (http://localhost/phpmyadmin)
3. Import file `database.sql` hoặc chạy các lệnh SQL trong file

```sql
# File database.sql sẽ tạo:
- Database: energy_monitoring
- Tables: users, devices, power_data, alerts, system_config, control_history
- Dữ liệu mẫu
```

### 3. Cấu hình kết nối

Mở file `config.php` và kiểm tra thông tin kết nối:

```php
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'energy_monitoring');
```

### 4. Chạy ứng dụng

1. Copy thư mục dự án vào `htdocs` (XAMPP) hoặc `www` (WAMP)
2. Truy cập: http://localhost/datn
3. Đăng nhập với tài khoản demo:
   - Username: `admin`
   - Password: `password`

## Cấu trúc thư mục

```
datn/
├── css/
│   └── style.css          # CSS chính
├── js/
│   ├── main.js           # JavaScript chung
│   ├── dashboard.js      # Dashboard
│   ├── devices.js        # Quản lý thiết bị
│   ├── history.js        # Lịch sử
│   └── alerts.js         # Cảnh báo
├── config.php            # Cấu hình database
├── api.php              # API endpoints
├── login.php            # Trang đăng nhập
├── logout.php           # Đăng xuất
├── index.php            # Dashboard
├── devices.php          # Trang thiết bị
├── history.php          # Trang lịch sử
├── alerts.php           # Trang cảnh báo
├── database.sql         # File SQL
└── README.md           # File này
```

## Sử dụng

### Đăng nhập
- Truy cập trang chủ, hệ thống tự động chuyển đến trang đăng nhập
- Nhập username và password
- Tài khoản demo: admin/password

### Dashboard
- Xem tổng quan hệ thống
- Bật/tắt thiết bị nhanh
- Theo dõi biểu đồ thời gian thực

### Quản lý thiết bị
- Xem chi tiết tất cả thiết bị
- Điều khiển bật/tắt từng thiết bị
- Xem thông số điện năng chi tiết
- Tạo dữ liệu mô phỏng (nút "Tạo dữ liệu mẫu")

### Xem lịch sử
- Chọn khoảng thời gian
- Xem biểu đồ chi tiết
- Phân tích xu hướng tiêu thụ điện

### Quản lý cảnh báo
- Xem tất cả cảnh báo
- Đánh dấu đã đọc
- Lọc theo mức độ nghiêm trọng

## API Endpoints

### GET /api.php?action=get_dashboard_stats
Lấy thống kê dashboard

### GET /api.php?action=get_devices
Lấy danh sách thiết bị

### POST /api.php?action=toggle_device
Bật/tắt thiết bị
- Params: `device_id`

### GET /api.php?action=get_power_data
Lấy dữ liệu điện năng
- Params: `device_id` (optional), `hours` (default: 24)

### GET /api.php?action=get_alerts
Lấy danh sách cảnh báo
- Params: `limit` (default: 50)

### POST /api.php?action=mark_alert_read
Đánh dấu cảnh báo đã đọc
- Params: `alert_id` (0 = tất cả)

### POST /api.php?action=add_simulated_data
Thêm dữ liệu mô phỏng (để test)
- Params: `device_id`

## Tính năng nổi bật

### Real-time Monitoring
- Tự động cập nhật dữ liệu mỗi 10 giây
- Biểu đồ cập nhật mỗi 30 giây
- Hiển thị thời gian cập nhật cuối cùng

### Responsive Design
- Tương thích mọi thiết bị
- Sidebar thu gọn trên mobile
- Layout linh hoạt

### Thông báo Toast
- Thông báo khi thực hiện hành động
- Tự động ẩn sau 3 giây
- Nhiều loại: success, error, info, warning

### Biểu đồ tương tác
- Sử dụng Chart.js
- Smooth animations
- Responsive

## Bảo mật

- Session-based authentication
- Password hashing (bcrypt)
- SQL injection prevention (prepared statements)
- XSS protection (htmlspecialchars)

## Mở rộng

### Thêm thiết bị mới
Thêm vào bảng `devices`:
```sql
INSERT INTO devices (device_name, device_type, location, power_rating)
VALUES ('Tên thiết bị', 'light', 'Vị trí', 100.00);
```

### Tích hợp phần cứng
- API hỗ trợ POST dữ liệu từ Arduino/ESP32
- Sử dụng endpoint `add_simulated_data` hoặc tạo endpoint mới

## Troubleshooting

### Lỗi kết nối database
- Kiểm tra MySQL đã chạy chưa
- Kiểm tra thông tin trong `config.php`
- Kiểm tra quyền user database

### Biểu đồ không hiển thị
- Kiểm tra console browser (F12)
- Đảm bảo có dữ liệu trong database
- Tạo dữ liệu mẫu bằng nút "Tạo dữ liệu mẫu"

### Trang trắng
- Bật display_errors trong php.ini
- Kiểm tra error log Apache

## Tác giả

Hệ thống giám sát và điều khiển điện năng
Phát triển với PHP & MySQL

## License

Free to use for educational purposes
