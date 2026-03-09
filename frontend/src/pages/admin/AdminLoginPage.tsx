import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, User, Lock } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/auth.store';
import logoIcon from '../../assets/logo.svg';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/admin/login', form);
      setAuth(res.data.user, res.data.access_token);
      navigate('/admin');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid admin credentials');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon" style={{ background: 'transparent' }}>
            <img src={logoIcon} alt="Logo" width={28} height={28} />
          </div>
          <div className="auth-logo-text">Claw<span>Desktop.VN</span> <span style={{ color: '#f87171', fontSize: 12, fontWeight: 400 }}>Admin</span></div>
        </div>

        <h1 className="auth-title">Admin Portal</h1>
        <p className="auth-subtitle">Manage conversations and respond as AI</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <div style={{ position: 'relative' }}>
              <User size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                className="form-input"
                style={{ paddingLeft: 36 }}
                type="text"
                placeholder="admin"
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                className="form-input"
                style={{ paddingLeft: 36 }}
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
              />
            </div>
          </div>

          {error && <p className="form-error" style={{ marginBottom: 12 }}>{error}</p>}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 4, background: 'linear-gradient(135deg, #ef4444, #dc2626)' }} disabled={loading}>
            {loading ? <Loader2 size={16} style={{ animation: 'spin 0.7s linear infinite' }} /> : null}
            {loading ? 'Signing in...' : 'Admin Sign In'}
          </button>
        </form>

        <div style={{ marginTop: 20, padding: '12px 16px', background: 'rgba(239, 68, 68, 0.06)', borderRadius: 8, border: '1px solid rgba(239, 68, 68, 0.15)' }}>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
            🔒 Restricted access — Admin only
          </p>
        </div>
      </div>
    </div>
  );
}
