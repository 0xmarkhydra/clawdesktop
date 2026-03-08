import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/auth.store';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ChatPage from './pages/ChatPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';

function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { isLoggedIn, isAdmin } = useAuthStore();
  if (!isLoggedIn()) return <Navigate to={adminOnly ? '/admin/login' : '/login'} replace />;
  if (adminOnly && !isAdmin()) return <Navigate to='/login' replace />;
  return <>{children}</>;
}

function GuestRoute({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, isAdmin } = useAuthStore();
  if (isLoggedIn()) {
    return <Navigate to={isAdmin() ? '/admin' : '/chat'} replace />;
  }
  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path='/login' element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path='/register' element={<GuestRoute><RegisterPage /></GuestRoute>} />

        {/* User routes */}
        <Route path='/chat' element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />

        {/* Admin routes */}
        <Route path='/admin/login' element={<AdminLoginPage />} />
        <Route path='/admin' element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />

        {/* Redirects */}
        <Route path='/' element={<Navigate to='/chat' replace />} />
        <Route path='*' element={<Navigate to='/chat' replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
