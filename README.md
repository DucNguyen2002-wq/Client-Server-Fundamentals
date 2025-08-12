# Lab 01 - Kiến thức cơ bản về Client-Server

## Mô tả dự án
Bài thực hành về kiến trúc Client-Server và HTTP protocol sử dụng Node.js và Express.js.

## Cấu trúc dự án
```
lab01-client-server-fundamentals/
├── README.md
├── package.json
├── server.js           # HTTP Server chính
├── client.js           # HTTP Client tự xây dựng
├── monitor.js          # Công cụ giám sát mạng
├── public/             # Static files
│   ├── index.html      # Trang chủ
│   ├── style.css       # CSS styling
│   └── script.js       # JavaScript phía client
├── screenshots/        # Screenshots demo
├── docs/              # Tài liệu kỹ thuật
│   └── technical-report.md
└── presentation/      # Slides thuyết trình
```

## Cài đặt

### Yêu cầu hệ thống
- Node.js phiên bản 16.0+
- npm hoặc yarn

### Cài đặt dependencies
```bash
npm install
```

## Chạy ứng dụng

### Khởi động server
```bash
npm start
# hoặc
node server.js
```
Server sẽ chạy tại: http://localhost:3000

### Chạy HTTP Client
```bash
npm run client
# hoặc
node client.js
```

### Chạy Network Monitor
```bash
npm run monitor
# hoặc
node monitor.js
```

## Tính năng chính

### Phần A: Static Web Server (35 điểm)
- [x] HTTP server sử dụng Express.js
- [x] Phục vụ static files (HTML, CSS, JavaScript)
- [x] API endpoint trả về thông tin server
- [x] Xử lý lỗi 404, 500
- [x] Custom HTTP headers
- [x] AJAX calls từ client

### Phần B: HTTP Client (35 điểm)
- [x] HTTP client tự xây dựng (không dùng axios/fetch)
- [x] Hỗ trợ GET và POST methods
- [x] Xử lý HTTP và HTTPS requests
- [x] Xử lý lỗi phù hợp
- [x] Test với external APIs

### Phần C: Network Traffic Analysis (20 điểm)
- [x] Sử dụng Browser Developer Tools
- [x] Monitoring script
- [x] Phân tích performance

## API Endpoints

### GET /api/server-info
Trả về thông tin server và timestamp
```json
{
  "timestamp": "2025-08-12T10:30:00.000Z",
  "server": "Express.js",
  "version": "1.0.0",
  "uptime": 3600,
  "platform": "win32",
  "nodeVersion": "v18.17.0"
}
```

### GET /api/health
Health check endpoint
```json
{
  "status": "OK",
  "timestamp": "2025-08-12T10:30:00.000Z"
}
```

## Testing

Các test cases đã triển khai:
1. GET request tới server cục bộ
2. GET request tới external API (GitHub API)
3. POST request tới test endpoint (JSONPlaceholder)
4. Xử lý lỗi khi server không khả dụng

## Tác giả
- Nhóm Lab 01
- Môn: Phát triển Ứng dụng Web Nâng cao
- Ngày: 12/08/2025
