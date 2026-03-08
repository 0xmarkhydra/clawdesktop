import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck, Bot, User, Send, LogOut, MessageSquare, Loader2, RefreshCw, Bell
} from 'lucide-react';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/auth.store';
import { connectSocket, joinThread, leaveThread } from '../../lib/socket';

interface User_ { id: string; username: string; email: string; }
interface Thread { id: string; title: string; user_id: string; updated_at: string; user: User_; }
interface Message { id: string; content: string; role: 'user' | 'ai' | 'admin_draft'; created_at: string; thread_id: string; }

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThread, setActiveThread] = useState<Thread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [replyInput, setReplyInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  // Unread badges: { threadId -> count }
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const prevThreadId = useRef<string | null>(null);
  const activeThreadRef = useRef<Thread | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Khởi tạo audio
  useEffect(() => {
    audioRef.current = new Audio('/ting.wav');
    audioRef.current.volume = 0.8;
  }, []);

  const playNotification = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {}); // Ignore autoplay policy errors
    }
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages]);
  useEffect(() => { activeThreadRef.current = activeThread; }, [activeThread]);

  function loadThreads(silent = false) {
    if (!silent) setLoadingThreads(true);
    return api.get('/admin/threads?take=50').then(res => {
      const data: Thread[] = res.data.data || [];
      setThreads(data);
      return data;
    }).finally(() => setLoadingThreads(false));
  }

  useEffect(() => { loadThreads(); }, []);

  // WebSocket setup
  useEffect(() => {
    const socket = connectSocket();

    // Join admin room để nhận notifications
    socket.emit('join:admin');

    // User gửi tin nhắn mới → phát chuông + badge + cập nhật thread list
    socket.on('admin:new_message', (data: { threadId: string; message: Message; thread: Thread }) => {
      const currentThread = activeThreadRef.current;

      // Cập nhật hoặc thêm thread vào danh sách, đưa lên đầu
      setThreads(prev => {
        const exists = prev.findIndex(t => t.id === data.threadId);
        const updatedThread = data.thread || (exists >= 0 ? prev[exists] : null);
        if (!updatedThread) return prev;

        const filtered = prev.filter(t => t.id !== data.threadId);
        return [{ ...updatedThread, updated_at: data.message.created_at }, ...filtered];
      });

      // Nếu đang xem thread này → thêm message vào luôn, không tăng badge
      if (currentThread?.id === data.threadId) {
        setMessages(prev => [...prev, data.message]);
        scrollToBottom();
      } else {
        // Thread khác → tăng badge + phát chuông
        setUnreadCounts(prev => ({
          ...prev,
          [data.threadId]: (prev[data.threadId] || 0) + 1,
        }));
        playNotification();
      }
    });

    // AI stream xong → cập nhật message nếu đang xem thread đó
    socket.on('thread:stream:done', (data: { message: Message }) => {
      if (data.message.thread_id === activeThreadRef.current?.id) {
        setMessages(prev => {
          // Tránh duplicate
          if (prev.find(m => m.id === data.message.id)) return prev;
          return [...prev, data.message];
        });
      }
    });

    return () => {
      socket.off('admin:new_message');
      socket.off('thread:stream:done');
    };
  }, [playNotification, scrollToBottom]);

  // Switch threads
  useEffect(() => {
    if (!activeThread) return;
    if (prevThreadId.current) leaveThread(prevThreadId.current);
    prevThreadId.current = activeThread.id;
    joinThread(activeThread.id);

    // Clear badge khi mở thread
    setUnreadCounts(prev => ({ ...prev, [activeThread.id]: 0 }));

    setMessages([]);
    setLoadingMessages(true);
    api.get(`/admin/threads/${activeThread.id}/messages`).then(res => {
      setMessages(res.data.data || []);
    }).finally(() => setLoadingMessages(false));
  }, [activeThread?.id]);

  async function sendReply() {
    if (!replyInput.trim() || !activeThread || sending) return;
    const content = replyInput.trim();
    setReplyInput('');
    setSending(true);
    try {
      await api.post(`/admin/threads/${activeThread.id}/reply`, { message: content });
    } catch { }
    finally { setSending(false); }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendReply();
    }
  }

  function handleLogout() { logout(); navigate('/admin/login'); }

  function formatTime(dateStr: string) {
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return 'Vừa xong';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    return d.toLocaleDateString('vi-VN');
  }

  const totalUnread = Object.values(unreadCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="admin-layout">
      {/* ADMIN SIDEBAR */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div className="admin-badge"><ShieldCheck size={10} /> Admin</div>
            {totalUnread > 0 && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 5,
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: 99, padding: '3px 10px', fontSize: 12, color: '#f87171'
              }}>
                <Bell size={11} />
                {totalUnread} new
              </div>
            )}
          </div>
          <div className="sidebar-brand">
            <div className="brand-icon" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
              <Bot size={16} color="#fff" />
            </div>
            <span className="brand-name">Claw<span>AI</span></span>
          </div>
          <button className="btn btn-ghost" style={{ width: '100%', fontSize: 12, gap: 6, marginTop: 8 }}
            onClick={() => loadThreads(true)}>
            <RefreshCw size={12} /> Refresh
          </button>
        </div>

        <div style={{ padding: '6px 8px 2px', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Conversations ({threads.length})
        </div>

        <div className="admin-thread-list">
          {loadingThreads ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
              <div className="spinner" />
            </div>
          ) : threads.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, padding: '24px 16px' }}>
              No conversations yet
            </div>
          ) : threads.map(t => {
            const unread = unreadCounts[t.id] || 0;
            return (
              <div
                key={t.id}
                className={`admin-thread-item ${activeThread?.id === t.id ? 'active' : ''}`}
                onClick={() => setActiveThread(t)}
                style={{ position: 'relative' }}
              >
                {/* Badge unread */}
                {unread > 0 && (
                  <div style={{
                    position: 'absolute', top: 8, right: 8,
                    background: '#ef4444',
                    color: '#fff',
                    borderRadius: 99,
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '1px 6px',
                    minWidth: 18,
                    textAlign: 'center',
                    lineHeight: '16px',
                    boxShadow: '0 0 8px rgba(239,68,68,0.5)',
                  }}>
                    {unread > 99 ? '99+' : unread}
                  </div>
                )}
                <div className="admin-thread-user">
                  <div className="mini-avatar">{t.user?.username?.[0]?.toUpperCase() || 'U'}</div>
                  <span className="admin-thread-username" style={unread > 0 ? { color: '#ef4444' } : {}}>
                    {t.user?.username || 'Unknown'}
                  </span>
                  <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--text-muted)', paddingRight: unread > 0 ? 28 : 0 }}>
                    {formatDate(t.updated_at)}
                  </span>
                </div>
                <div className="admin-thread-title" style={{ fontWeight: unread > 0 ? 600 : 400 }}>
                  {t.title}
                </div>
              </div>
            );
          })}
        </div>

        {/* Admin user footer */}
        <div className="sidebar-footer">
          <div className="user-avatar" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <div className="user-info">
            <div className="user-name">{user?.username}</div>
            <div className="user-role" style={{ color: '#f87171' }}>Administrator</div>
          </div>
          <button className="btn-logout" onClick={handleLogout}><LogOut size={16} /></button>
        </div>
      </aside>

      {/* MAIN AREA */}
      <main className="chat-area">
        {!activeThread ? (
          <div className="select-thread-prompt">
            <div className="chat-empty-icon"><MessageSquare size={24} color="var(--accent)" /></div>
            <h3 style={{ color: 'var(--text-secondary)', fontSize: 17, fontWeight: 600 }}>Select a conversation</h3>
            <p style={{ fontSize: 13 }}>
              {totalUnread > 0
                ? `You have ${totalUnread} unread message${totalUnread > 1 ? 's' : ''}`
                : 'Pick a thread from the sidebar to view and reply'}
            </p>
          </div>
        ) : (
          <>
            <div className="chat-header">
              <div className="mini-avatar" style={{ width: 36, height: 36, borderRadius: 10, fontSize: 15 }}>
                {activeThread.user?.username?.[0]?.toUpperCase()}
              </div>
              <div className="chat-header-info">
                <div className="chat-header-title">{activeThread.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {activeThread.user?.username} · {activeThread.user?.email}
                </div>
              </div>
            </div>

            <div className="chat-messages">
              {loadingMessages ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
                  <div className="spinner" />
                </div>
              ) : messages.map(msg => (
                <div key={msg.id} className={`message-row ${msg.role === 'user' ? 'user-row' : ''}`}>
                  <div className={`msg-avatar ${msg.role === 'user' ? 'user-avatar-icon' : 'ai-avatar'}`}>
                    {msg.role === 'user' ? <User size={14} /> : <Bot size={14} color="#fff" />}
                  </div>
                  <div
                    className={`message-bubble ${msg.role === 'user' ? 'user-bubble' : 'ai-bubble'}`}
                    style={msg.role === 'admin_draft' ? { opacity: 0.6, borderStyle: 'dashed', fontSize: 12 } : {}}
                  >
                    {msg.role === 'admin_draft' && (
                      <div style={{ fontSize: 10, color: 'var(--accent-light)', marginBottom: 4, fontWeight: 600 }}>
                        📝 Draft gốc của admin
                      </div>
                    )}
                    {msg.content}
                    <span className="message-time">{formatTime(msg.created_at)}</span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* REPLY AREA */}
            <div className="admin-reply-area">
              <div className="admin-reply-label">
                Tin nhắn của bạn → <span>AI sẽ chuyển giọng</span>
              </div>
              <div className="chat-input-wrapper">
                <textarea
                  className="chat-textarea"
                  placeholder="Gõ reply... AI sẽ transform thành giọng tự nhiên"
                  rows={1}
                  value={replyInput}
                  onChange={e => {
                    setReplyInput(e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = Math.min(e.target.scrollHeight, 140) + 'px';
                  }}
                  onKeyDown={handleKeyDown}
                />
                <button
                  className="btn-send"
                  style={{ background: sending ? 'var(--border)' : 'var(--accent)' }}
                  onClick={sendReply}
                  disabled={!replyInput.trim() || sending}
                >
                  {sending ? <Loader2 size={16} style={{ animation: 'spin 0.7s linear infinite' }} /> : <Send size={16} />}
                </button>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 8 }}>
                Gemini AI transforms your reply • Enter to send
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
