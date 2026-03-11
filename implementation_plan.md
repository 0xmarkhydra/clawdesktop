# Auto-Update cho ClawDesktop

Hiện tại người dùng phải tải lại và cài thủ công mỗi khi có bản mới. Tính năng này giúp app **tự động kiểm tra và cài update** khi khởi động, sử dụng `electron-updater` kết hợp với backend server tại `api.clawdesktop.vn`.

## Cơ chế hoạt động

```
App khởi động
  → check GET api.clawdesktop.vn/updates/latest.yml
  → có version mới → hiện dialog hỏi user
  → user đồng ý → tải file cài đặt từ server
  → tự động cài và restart
```

## Proposed Changes

### Frontend — Electron

#### [MODIFY] [package.json](file:///Users/levanmong/Desktop/App/clawdesktop/frontend/package.json)
- Thêm `electron-updater` vào `dependencies`
- Thêm `publish` config vào `"build"`:
```json
"publish": {
  "provider": "generic",
  "url": "https://api.clawdesktop.vn/updates"
}
```

#### [MODIFY] [main.cjs](file:///Users/levanmong/Desktop/App/clawdesktop/frontend/electron/main.cjs)
- Import `autoUpdater` từ `electron-updater`
- Sau khi window ready: gọi `autoUpdater.checkForUpdatesAndNotify()`
- Xử lý các events: `update-available`, `update-downloaded`, `error`
- Hiện dialog thông báo cho user khi có update

---

### Backend — NestJS

#### [NEW] `updates` module — serve file cài đặt

Tạo endpoint để serve các file update:

| Endpoint | Mô tả |
|---|---|
| `GET /updates/latest.yml` | Metadata bản mới nhất (macOS Intel) |
| `GET /updates/latest-mac.yml` | Metadata bản mới nhất (macOS ARM) |
| `GET /updates/latest-linux.yml` | Metadata bản mới nhất (Linux) |
| `GET /updates/:filename` | Download file cài đặt ([.exe](file:///Users/levanmong/Desktop/App/clawdesktop/frontend/dist/ClawDesktop-win-arm64.exe), [.dmg](file:///Users/levanmong/Desktop/App/clawdesktop/frontend/dist/ClawDesktop-mac-x64.dmg), `.AppImage`) |

Các file update được lưu trong thư mục `uploads/updates/` trên server (upload thủ công sau mỗi lần build).

---

### Build Script

#### [MODIFY] [build-desktop.sh](file:///Users/levanmong/Desktop/App/clawdesktop/frontend/build-desktop.sh)
- Sau khi build xong, hiển thị hướng dẫn upload file lên server

## Verification Plan

### Kiểm tra thủ công
1. Build app: `npm run electron:build:mac:arm`
2. Upload các file từ `release/` lên server tại `/updates/`
3. Tăng version trong [package.json](file:///Users/levanmong/Desktop/App/clawdesktop/frontend/package.json) → build lại bản mới
4. Cài bản cũ → mở app → app phải hiện dialog thông báo có update
5. Bấm cài update → app restart với bản mới
