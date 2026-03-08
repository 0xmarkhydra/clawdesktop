import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './store/auth.store';
import { getDomainMode, getAdminOrigin } from './lib/domain';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ChatPage from './pages/ChatPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';

type DomainMode = 'admin-only' | 'user-only' | 'both';

function ProtectedRoute({
  children,
  adminOnly = false,
  domainMode,
}: {
  children: React.ReactNode;
  adminOnly?: boolean;
  domainMode: DomainMode;
}) {
  const { isLoggedIn, isAdmin } = useAuthStore();
  if (!isLoggedIn()) {
    const to = domainMode === 'admin-only' || adminOnly ? '/admin/login' : '/login';
    return <Navigate to={to} replace />;
  }
  if (adminOnly && !isAdmin()) {
    return <Navigate to={domainMode === 'admin-only' ? '/admin/login' : '/login'} replace />;
  }
  return <>{children}</>;
}

function GuestRoute({
  children,
  domainMode,
  adminContext = false,
}: {
  children: React.ReactNode;
  domainMode: DomainMode;
  adminContext?: boolean;
}) {
  const { isLoggedIn, isAdmin } = useAuthStore();
  if (isLoggedIn()) {
    if (domainMode === 'admin-only') return <Navigate to="/admin" replace />;
    if (domainMode === 'both' && adminContext) return <Navigate to="/admin" replace />;
    if (domainMode === 'both') return <Navigate to={isAdmin() ? '/admin' : '/chat'} replace />;
    return <Navigate to="/chat" replace />;
  }
  return <>{children}</>;
}

function AdminRedirect() {
  const location = useLocation();
  const url = getAdminOrigin() + location.pathname + location.search;
  window.location.href = url;
  return null;
}

function AppRoutes() {
  const location = useLocation();
  const mode = getDomainMode();

  if (mode === 'user-only' && (location.pathname === '/admin' || location.pathname.startsWith('/admin/'))) {
    return <AdminRedirect />;
  }

  if (mode === 'admin-only') {
    return (
      <Routes>
        <Route path="/" element={<GuestRoute domainMode="admin-only" adminContext><AdminLoginPage /></GuestRoute>} />
        <Route path="/admin/login" element={<GuestRoute domainMode="admin-only" adminContext><AdminLoginPage /></GuestRoute>} />
        <Route path="/admin" element={<ProtectedRoute domainMode="admin-only" adminOnly><AdminDashboard /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  if (mode === 'user-only') {
    return (
      <Routes>
        <Route path="/login" element={<GuestRoute domainMode="user-only"><LoginPage /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute domainMode="user-only"><RegisterPage /></GuestRoute>} />
        <Route path="/chat" element={<ProtectedRoute domainMode="user-only"><ChatPage /></ProtectedRoute>} />
        <Route path="/" element={<Navigate to="/chat" replace />} />
        <Route path="*" element={<Navigate to="/chat" replace />} />
      </Routes>
    );
  }

  // both (localhost)
  return (
    <Routes>
      <Route path="/login" element={<GuestRoute domainMode="both"><LoginPage /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute domainMode="both"><RegisterPage /></GuestRoute>} />
      <Route path="/chat" element={<ProtectedRoute domainMode="both"><ChatPage /></ProtectedRoute>} />
      <Route path="/admin/login" element={<GuestRoute domainMode="both" adminContext><AdminLoginPage /></GuestRoute>} />
      <Route path="/admin" element={<ProtectedRoute domainMode="both" adminOnly><AdminDashboard /></ProtectedRoute>} />
      <Route path="/" element={<Navigate to="/chat" replace />} />
      <Route path="*" element={<Navigate to="/chat" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
