# WebSocket / Socket.IO khi deploy

## Test kết nối WebSocket từ terminal

Cần curl 8.11+ (hỗ trợ WebSocket). Chạy:

```bash
curl -N -i \
  --header "Connection: Upgrade" \
  --header "Upgrade: websocket" \
  --header "Sec-WebSocket-Key: SGVsbG8sIHdvcmxkIQ==" \
  --header "Sec-WebSocket-Version: 13" \
  --header "Origin: https://app.clawdesktop.vn" \
  "wss://api.clawdesktop.vn/socket.io/?EIO=4&transport=websocket"
```

- **Nếu WebSocket OK**: thấy HTTP **101 Switching Protocols** và sau đó là dữ liệu Socket.IO (dạng số + chuỗi).
- **Nếu lỗi**: thấy 400 / 403 / 502 hoặc không có 101 → thường do **reverse proxy chưa bật WebSocket**.

## Cấu hình Nginx cho WebSocket (Socket.IO)

Nếu bạn dùng Nginx trước backend NestJS, cần bật upgrade WebSocket. Trong `location` proxy tới API, thêm:

```nginx
location / {
    proxy_pass http://localhost:8000;   # hoặc upstream của backend
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
}
```

Quan trọng nhất: `proxy_http_version 1.1`, `Upgrade`, `Connection "upgrade"`, `proxy_cache_bypass $http_upgrade`.

Sau khi sửa, reload Nginx: `sudo nginx -t && sudo nginx -s reload`.

## Cấu hình Caddy cho WebSocket

Caddy thường tự xử lý WebSocket khi reverse proxy. Ví dụ:

```caddy
api.clawdesktop.vn {
    reverse_proxy localhost:8000
}
```

Nếu vẫn lỗi, có thể thử:

```caddy
api.clawdesktop.vn {
    reverse_proxy localhost:8000 {
        header_up X-Forwarded-Proto {scheme}
    }
}
```

## Kiểm tra trên trình duyệt (production)

1. Mở https://app.clawdesktop.vn → đăng nhập → vào một chat.
2. F12 → tab **Network** → filter **WS**.
3. Gửi một tin nhắn.
4. Xem có request tới `wss://api.clawdesktop.vn/socket.io/` không:
   - Status **101** và frame trả về → WebSocket OK, vấn đề có thể ở join room / logic stream.
   - Failed / canceled / 4xx–5xx → lỗi proxy hoặc backend, ưu tiên chỉnh Nginx/Caddy như trên.
