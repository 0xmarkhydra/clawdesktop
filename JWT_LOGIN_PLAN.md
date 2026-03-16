# 🔐 Plan: JWT Login & Token Expiry Handling

**Mục tiêu:** Thêm hệ thống login JWT và xử lý khi token hết hạn cho ClawDesktop

---

## 📋 TASKS CẦN LÀM

### 1. Backend - JWT Authentication Setup

#### 1.1 Cài đặt JWT Service
```typescript
// backend/src/modules/auth/jwt.service.ts
- Tạo access token (15 phút)
- Tạo refresh token (7 ngày)
- Verify token
- Refresh token logic
```

#### 1.2 Auth Controller Updates
```typescript
// backend/src/modules/auth/auth.controller.ts
POST /auth/login
POST /auth/refresh
POST /auth/logout
POST /auth/logout-all
```

#### 1.3 JWT Guard Enhancement
```typescript
// backend/src/modules/auth/guards/jwt.guard.ts
- Check access token
- Auto redirect khi token invalid
- Whitelist public endpoints
```

#### 1.4 Database Schema
```sql
-- Thêm bảng refresh_tokens
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  token_hash VARCHAR(255),
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 2. Frontend - JWT Handling

#### 2.1 Auth Store Updates
```typescript
// frontend/src/store/auth.store.ts
- Lưu access_token & refresh_token
- Auto refresh logic
- Logout khi refresh fail
- Clear tokens on logout
```

#### 2.2 API Interceptor
```typescript
// frontend/src/lib/api.ts
- Thêm Authorization header
- Auto refresh khi 401
- Retry request sau refresh
- Logout khi refresh token hết hạn
```

#### 2.3 Login/Register Pages
```typescript
// frontend/src/pages/LoginPage.tsx
// frontend/src/pages/RegisterPage.tsx
- Form validation
- Call login API
- Store tokens
- Redirect sau login
```

### 3. JWT Expiry Handling Flow

#### 3.1 Khi Access Token hết hạn (15 phút)
```
1. API call → 401 Unauthorized
2. Interceptor catch 401
3. Call /auth/refresh với refresh_token
4. Nhận access_token mới
5. Retry API call ban đầu
6. Continue normal flow
```

#### 3.2 Khi Refresh Token hết hạn (7 ngày)
```
1. Call /auth/refresh → 401/403
2. Clear all tokens
3. Redirect to login page
4. Show message: "Phiên đăng nhập hết hạn"
```

#### 3.3 Auto Logout Scenarios
```typescript
// Các trường hợp tự động logout:
- Refresh token expired
- Invalid refresh token
- User logout manually
- Multiple device login (optional)
```

---

## 🛠 IMPLEMENTATION DETAILS

### Backend Implementation

#### JWT Service
```typescript
@Injectable()
export class JwtService {
  generateTokens(userId: string) {
    const accessToken = jwt.sign(
      { userId, type: 'access' },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );
    
    const refreshToken = jwt.sign(
      { userId, type: 'refresh' },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );
    
    return { accessToken, refreshToken };
  }
  
  async refreshTokens(refreshToken: string) {
    // Verify refresh token
    // Generate new access token
    // Optionally rotate refresh token
  }
}
```

#### Auth Controller
```typescript
@Controller('auth')
export class AuthController {
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    // Validate user credentials
    // Generate JWT tokens
    // Save refresh token to DB
    // Return tokens
  }
  
  @Post('refresh')
  async refresh(@Body() { refreshToken }: RefreshDto) {
    // Validate refresh token
    // Generate new access token
    // Return new access token
  }
  
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@User() user, @Body() { refreshToken }: LogoutDto) {
    // Remove refresh token from DB
    // Return success
  }
}
```

### Frontend Implementation

#### Auth Store
```typescript
interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  isLoggedIn: () => boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: localStorage.getItem('access_token'),
  refreshToken: localStorage.getItem('refresh_token'),
  user: null,
  
  isLoggedIn: () => !!get().accessToken,
  
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    const { accessToken, refreshToken, user } = response.data;
    
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    
    set({ accessToken, refreshToken, user });
  },
  
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    set({ accessToken: null, refreshToken: null, user: null });
  },
  
  refreshAccessToken: async () => {
    try {
      const refreshToken = get().refreshToken;
      if (!refreshToken) return false;
      
      const response = await api.post('/auth/refresh', { refreshToken });
      const { accessToken } = response.data;
      
      localStorage.setItem('access_token', accessToken);
      set({ accessToken });
      
      return true;
    } catch (error) {
      get().logout();
      return false;
    }
  }
}));
```

#### API Interceptor
```typescript
// Request interceptor - thêm token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle token expiry
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshed = await useAuthStore.getState().refreshAccessToken();
      
      if (refreshed) {
        // Retry original request với token mới
        const newToken = useAuthStore.getState().accessToken;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } else {
        // Redirect to login
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);
```

---

## ⏱ TIMELINE

### Week 1: Backend Setup
- [x] Cài đặt JWT service
- [x] Tạo refresh token table
- [x] Implement auth endpoints
- [x] Test JWT flow

### Week 2: Frontend Integration  
- [ ] Update auth store
- [ ] Implement API interceptor
- [ ] Update login/register pages
- [ ] Test token refresh flow

### Week 3: Testing & Polish
- [ ] E2E testing
- [ ] Error handling
- [ ] UI feedback cho token expiry
- [ ] Documentation

---

## 🧪 TESTING SCENARIOS

### Manual Test Cases
1. **Login thành công**
   - Input valid credentials
   - Verify tokens được lưu
   - Verify redirect to chat page

2. **Access token hết hạn**
   - Wait 15 minutes after login
   - Make API call
   - Verify auto refresh works
   - Verify request succeeds

3. **Refresh token hết hạn**
   - Manually expire refresh token
   - Make API call
   - Verify auto logout
   - Verify redirect to login

4. **Manual logout**
   - Click logout button
   - Verify tokens cleared
   - Verify redirect to login

### Automated Tests
```typescript
// Jest tests
describe('JWT Authentication', () => {
  it('should login successfully', async () => {
    // Test login flow
  });
  
  it('should refresh token automatically', async () => {
    // Test auto refresh
  });
  
  it('should logout when refresh fails', async () => {
    // Test logout on refresh failure
  });
});
```

---

## 🔒 SECURITY CONSIDERATIONS

### Token Security
- Access token: Short-lived (15 minutes)
- Refresh token: Longer-lived (7 days) 
- Store refresh token securely (httpOnly cookie recommended)
- Implement token rotation for refresh tokens

### Additional Security
- Rate limiting cho login attempts
- Device fingerprinting (optional)
- Logout from all devices functionality
- Monitor suspicious login activities

---

## 📝 ENVIRONMENT VARIABLES

```bash
# Backend .env
JWT_SECRET=your-super-secret-key-for-access-tokens
JWT_REFRESH_SECRET=your-super-secret-key-for-refresh-tokens
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

---

## ✅ DEFINITION OF DONE

- [x] User có thể login với email/password
- [ ] JWT tokens được generate và lưu trữ
- [ ] Access token tự động refresh khi hết hạn
- [ ] User tự động logout khi refresh token hết hạn
- [ ] Protected routes hoạt động đúng
- [ ] Error handling cho tất cả edge cases
- [ ] Tests pass 100%
- [ ] Documentation hoàn thành

**Estimated effort: 2-3 weeks**