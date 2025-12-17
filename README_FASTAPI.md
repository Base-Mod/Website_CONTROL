# Hệ thống Giám sát và Điều khiển Điện năng (FastAPI Version)

Website giám sát và điều khiển điện năng thời gian thực với FastAPI + WebSocket.

## ⚡ Tính năng

- **Dashboard**: Thống kê tổng quan, biểu đồ real-time
- **Quản lý thiết bị**: Điều khiển bật/tắt, xem thông số điện
- **Lịch sử**: Biểu đồ công suất, điện áp, dòng điện
- **Cảnh báo**: Quản lý cảnh báo với nhiều mức độ
- **WebSocket**: Cập nhật real-time không cần refresh
- **RESTful API**: Đầy đủ API documentation

## 🚀 Công nghệ

- **Backend**: FastAPI 0.109.0
- **Database**: MySQL/MariaDB với SQLAlchemy ORM
- **Authentication**: JWT Bearer Token
- **Real-time**: WebSocket
- **Frontend**: Vanilla JS + Chart.js
- **Production**: Gunicorn + Uvicorn Workers

## 📦 Cài đặt

### 1. Clone/Download project

### 2. Tạo môi trường ảo và cài dependencies

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate

# Cài packages
pip install -r requirements.txt
```

### 3. Cấu hình database

Copy `.env.example` thành `.env` và cập nhật:

```env
DATABASE_URL=mysql+pymysql://root:@localhost/energy_monitoring
SECRET_KEY=your-secret-key-here
```

### 4. Tạo database

```bash
# Import SQL file vào MySQL
mysql -u root -p < database.sql

# Hoặc chạy script init
python init_db.py
```

### 5. Chạy ứng dụng

```bash
# Development mode
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Hoặc
python main.py
```

Truy cập:
- **Web**: http://localhost:8000/static/login.html
- **API Docs**: http://localhost:8000/docs
- **WebSocket**: ws://localhost:8000/ws

## 🔑 Đăng nhập

- Username: `admin`
- Password: `password`

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký user mới
- `POST /api/auth/login` - Đăng nhập (trả về JWT token)

### Devices
- `GET /api/devices/stats` - Thống kê dashboard
- `GET /api/devices/` - Danh sách thiết bị
- `POST /api/devices/` - Tạo thiết bị mới
- `GET /api/devices/{id}` - Chi tiết thiết bị
- `PUT /api/devices/{id}` - Cập nhật thiết bị
- `POST /api/devices/{id}/toggle` - Bật/tắt thiết bị
- `POST /api/devices/{id}/simulate` - Tạo dữ liệu mô phỏng

### Power Data
- `GET /api/power/history` - Lịch sử dữ liệu (query: hours, device_id)
- `GET /api/power/latest` - Số liệu mới nhất

### Alerts
- `GET /api/alerts/` - Danh sách cảnh báo
- `POST /api/alerts/{id}/mark-read` - Đánh dấu đã đọc

## 🌐 Deploy trên aaPanel

### 1. Upload code lên server

```bash
# Zip project và upload, hoặc dùng git
git clone your-repo /var/www/datn
```

### 2. Cài Python và tạo venv

Trong aaPanel:
1. **Python Manager** → Cài Python 3.11
2. **Terminal**:
   ```bash
   cd /var/www/datn
   python3.11 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

### 3. Cấu hình database

```bash
# Tạo database trong aaPanel MySQL
# Import database.sql
# Cập nhật .env với thông tin database
```

### 4. Setup Supervisor

Copy `supervisor.conf` vào `/etc/supervisor/conf.d/energy_monitoring.conf`

```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start energy_monitoring
```

### 5. Setup Nginx

Trong aaPanel → Website → Tạo site mới:

```nginx
location / {
    proxy_pass http://127.0.0.1:8000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}

location /ws {
    proxy_pass http://127.0.0.1:8000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```

### 6. SSL (Optional)

aaPanel → SSL → Let's Encrypt → Apply

## 🧪 Test API

```bash
# Get token
curl -X POST "http://localhost:8000/api/auth/login" \
  -d "username=admin&password=password"

# Use token
curl -X GET "http://localhost:8000/api/devices/" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🔄 WebSocket Usage

```javascript
const ws = new WebSocket('ws://localhost:8000/ws');

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log('Received:', data);
};
```

## 📁 Cấu trúc project

```
datn/
├── app/
│   ├── __init__.py
│   ├── auth.py              # JWT authentication
│   ├── config.py            # Settings
│   ├── database.py          # Database connection
│   ├── models.py            # SQLAlchemy models
│   ├── schemas.py           # Pydantic schemas
│   └── routers/
│       ├── auth.py          # Auth endpoints
│       ├── devices.py       # Device endpoints
│       ├── power.py         # Power data endpoints
│       └── alerts.py        # Alert endpoints
├── static/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── api.js           # API client + WebSocket
│   │   └── dashboard.js     # Dashboard logic
│   ├── index.html           # Dashboard page
│   └── login.html           # Login page
├── main.py                  # FastAPI app + WebSocket
├── requirements.txt         # Python dependencies
├── database.sql             # Database schema
├── init_db.py               # Database initialization
├── supervisor.conf          # Supervisor config
├── .env.example             # Environment template
└── README_FASTAPI.md        # This file
```

## 🆚 So sánh với PHP version

| Feature | PHP | FastAPI |
|---------|-----|---------|
| Performance | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Real-time | Polling | WebSocket native |
| API Docs | Manual | Auto-generated |
| Type Safety | ❌ | ✅ (Pydantic) |
| Async | Limited | Full support |
| Testing | Manual | Built-in |
| Deployment | Apache/Nginx | Gunicorn/Uvicorn |

## 🐛 Troubleshooting

### Database connection error
```bash
# Check MySQL running
sudo systemctl status mysql

# Update DATABASE_URL in .env
```

### WebSocket not connecting
```bash
# Check firewall
sudo ufw allow 8000

# Check Nginx WebSocket config
```

### Import errors
```bash
# Reinstall packages
pip install -r requirements.txt --force-reinstall
```

## 📝 License

Free for educational purposes

## 👨‍💻 Support

FastAPI Documentation: https://fastapi.tiangolo.com/
