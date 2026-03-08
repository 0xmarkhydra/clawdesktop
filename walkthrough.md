# AI Chat App — Walkthrough

## ✅ Đã hoàn thành

### Backend (NestJS)
- **TypeScript compile:** ✅ No errors
- **3 entities mới:** [UserEntity](file:///Users/levanmong/Desktop/App/clawdesktop/backend/src/modules/database/entities/user.entity.ts#9-28), [ThreadEntity](file:///Users/levanmong/Desktop/App/clawdesktop/backend/src/modules/database/entities/thread.entity.ts#10-30), [MessageEntity](file:///Users/levanmong/Desktop/App/clawdesktop/backend/src/modules/database/entities/message.entity.ts#11-31)
- **3 repositories mới:** UserRepository, ThreadRepository, MessageRepository  
- **Auth system:** `POST /auth/register`, `POST /auth/login`, `POST /auth/admin/login`
- **JWT Guard (global):** tự động bảo vệ tất cả routes, dùng `@Public()` để bypass
- **Roles Guard:** dùng `@Roles(UserRole.ADMIN)` cho admin routes
- **Thread API:** CRUD threads và messages cho user
- **Admin API:** xem all threads, reply → trigger DeepSeek stream
- **DeepSeek Service:** stream transform admin message → giọng AI (deepseek-chat model)
- **WebSocket Gateway:** join/leave thread rooms, emit `thread:typing`, `thread:stream`, `thread:stream:done`

### Frontend (React + Vite 5)
- **TypeScript compile:** ✅ No errors
- **Routing:** React Router với Protected/Guest route wrappers
- **Login page** `/login` — email + password, show/hide password
- **Register page** `/register` — username + email + password
- **Chat page** `/chat` — sidebar threads, typing indicator, streaming text, WebSocket events
- **Admin Login** `/admin/login` — UI màu đỏ phân biệt
- **Admin Dashboard** `/admin` — xem all threads, reply với label DeepSeek transform

## 📸 UI Screenshot

![Login Page](login_page_1772949030137.png)

## 🚀 Cách chạy

### Backend (đã đang chạy)
```bash
cd backend && npm run dev
# Chạy tại: http://localhost:8000
# Swagger docs: http://localhost:8000/docs
```

### Frontend
```bash
cd frontend && npm run dev
# Chạy tại: http://localhost:5173
```

## ⚙️ Config cần thiết (backend [.env](file:///Users/levanmong/Desktop/App/clawdesktop/backend/.env))

```env
DEEPSEEK_API_KEY=your_deepseek_api_key_here   # Lấy tại platform.deepseek.com
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123456
JWT_SECRET_KEY=your_super_secret_jwt_key_here_change_me
```

## 🔄 Flow hoạt động

```
User /register hoặc /login → JWT token
      ↓
Tạo thread mới (POST /threads)
      ↓
Gửi tin nhắn (POST /threads/:id/messages)
      ↓
Admin xem tại /admin → chọn thread → gõ reply
      ↓
POST /admin/threads/:id/reply
      ↓
Backend emit "thread:typing" → User thấy "AI đang gõ..."
DeepSeek stream từng chunk → emit "thread:stream" → Text xuất hiện từng chữ
Stream done → lưu DB → emit "thread:stream:done"
```

## ⚠️ Lưu ý DB Sync
`DB_SYNC=1` đang bật → TypeORM sẽ **tự động tạo** 3 bảng mới (`users`, `threads`, `messages`) khi backend khởi động lần đầu tiên sau khi thêm entities.
