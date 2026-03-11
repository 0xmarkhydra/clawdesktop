import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck, Bot, User, Send, LogOut, MessageSquare, Loader2, RefreshCw, Bell, Paperclip, X
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { api } from '../../lib/api';

import logoIcon from '../../assets/logo.svg';
import { useAuthStore } from '../../store/auth.store';
import { connectSocket, joinThread, leaveThread } from '../../lib/socket';

interface User_ { id: string; username: string; email: string; }
interface Thread { id: string; title: string; user_id: string; updated_at: string; user: User_; is_auto_reply: boolean; }
interface Message { id: string; content: string; role: 'user' | 'ai' | 'admin_draft'; created_at: string; thread_id: string; image_url?: string | null; }
interface PendingImage { file: File; previewUrl: string; }

const ADMIN_THREADS_PAGE_SIZE = 10;
function sortThreadsByUpdatedAt<T extends { updated_at: string }>(list: T[]): T[] {
  return [...list].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThread, setActiveThread] = useState<Thread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [replyInput, setReplyInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMoreThreads, setLoadingMoreThreads] = useState(false);
  const [pagination, setPagination] = useState<{ current_page: number; total_pages: number; take: number; total: number } | null>(null);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [togglingBot, setTogglingBot] = useState(false);
  // Unread badges: { threadId -> count }
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [pendingImage, setPendingImage] = useState<PendingImage | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const prevThreadId = useRef<string | null>(null);
  const activeThreadRef = useRef<Thread | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    return api.get('/admin/threads', { params: { page: 1, take: ADMIN_THREADS_PAGE_SIZE } }).then(res => {
      const data: Thread[] = res.data.data || [];
      const pag = res.data.pagination || null;
      setThreads(data);
      setPagination(pag);
      return data;
    }).finally(() => setLoadingThreads(false));
  }

  async function loadMoreThreads() {
    if (!pagination || loadingMoreThreads || pagination.current_page >= pagination.total_pages) return;
    setLoadingMoreThreads(true);
    try {
      const nextPage = pagination.current_page + 1;
      const res = await api.get('/admin/threads', { params: { page: nextPage, take: ADMIN_THREADS_PAGE_SIZE } });
      const newData: Thread[] = res.data.data || [];
      const ids = new Set(threads.map(t => t.id));
      const merged = [...threads, ...newData.filter(t => !ids.has(t.id))];
      setThreads(sortThreadsByUpdatedAt(merged));
      setPagination(res.data.pagination || null);
    } finally {
      setLoadingMoreThreads(false);
    }
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

      setThreads(prev => {
        const exists = prev.findIndex(t => t.id === data.threadId);
        const updatedThread = data.thread || (exists >= 0 ? prev[exists] : null);
        if (!updatedThread) return prev;
        const filtered = prev.filter(t => t.id !== data.threadId);
        return sortThreadsByUpdatedAt([{ ...updatedThread, updated_at: data.message.created_at }, ...filtered]);
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

  async function uploadImageFile(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.url as string;
  }

  function attachImageFile(file: File) {
    if (!file.type.startsWith('image/')) return;
    const previewUrl = URL.createObjectURL(file);
    setPendingImage(prev => {
      if (prev) URL.revokeObjectURL(prev.previewUrl);
      return { file, previewUrl };
    });
  }

  function removePendingImage() {
    if (pendingImage) URL.revokeObjectURL(pendingImage.previewUrl);
    setPendingImage(null);
  }

  async function sendReply() {
    if (!replyInput.trim() && !pendingImage) return;
    if (!activeThread || sending) return;

    const content = replyInput.trim();
    const imageToSend = pendingImage;

    setReplyInput('');
    setPendingImage(null);
    setSending(true);

    let imageUrl: string | undefined;

    try {
      if (imageToSend) {
        setUploadingImage(true);
        imageUrl = await uploadImageFile(imageToSend.file);
        URL.revokeObjectURL(imageToSend.previewUrl);
        setUploadingImage(false);
      }
      await api.post(`/admin/threads/${activeThread.id}/reply`, { message: content, image_url: imageUrl });
    } catch { }
    finally {
      setSending(false);
      setUploadingImage(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendReply();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of Array.from(items)) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) attachImageFile(file);
        break;
      }
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setIsDraggingOver(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) attachImageFile(file);
  }

  async function toggleAutoReply() {
    if (!activeThread || togglingBot) return;
    const newState = !activeThread.is_auto_reply;
    // Optimistic update: reflect UI immediately
    setActiveThread(prev => prev ? { ...prev, is_auto_reply: newState } : null);
    setThreads(prev => prev.map(t => t.id === activeThread.id ? { ...t, is_auto_reply: newState } : t));
    setTogglingBot(true);
    try {
      await api.post(`/admin/threads/${activeThread.id}/toggle-auto-reply`, { is_auto_reply: newState });
    } catch {
      // Revert on error
      setActiveThread(prev => prev ? { ...prev, is_auto_reply: !newState } : null);
      setThreads(prev => prev.map(t => t.id === activeThread.id ? { ...t, is_auto_reply: !newState } : t));
    } finally {
      setTogglingBot(false);
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
            <div className="flex items-center gap-2">
              <img src={logoIcon} alt="Logo" width={24} height={24} />
              <span className="font-semibold text-white">ClawDesktop Admin</span>
            </div>
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
                <div className="admin-thread-title" style={{ fontWeight: unread > 0 ? 600 : 400, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>{t.title}</span>
                  {t.is_auto_reply && (
                    <Bot size={12} style={{ color: 'var(--accent)', marginLeft: 8 }} />
                  )}
                </div>
              </div>
            );
          })}
          {!loadingThreads && threads.length > 0 && pagination && pagination.current_page < pagination.total_pages && (
            <div style={{ padding: '12px 8px', borderTop: '1px solid var(--border)' }}>
              <button
                type="button"
                className="btn btn-ghost"
                style={{ width: '100%', fontSize: 12, gap: 6 }}
                onClick={loadMoreThreads}
                disabled={loadingMoreThreads}
              >
                {loadingMoreThreads ? <Loader2 size={12} style={{ animation: 'spin 0.7s linear infinite' }} /> : null}
                {loadingMoreThreads ? ' Loading…' : 'Load more'}
              </button>
            </div>
          )}
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

      {/* Lightbox */}
      {lightboxUrl && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out' }}
          onClick={() => setLightboxUrl(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxUrl(null)}
            style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center' }}
          >
            <X size={20} />
          </button>
          <img
            src={lightboxUrl}
            alt="full size"
            style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 12, boxShadow: '0 0 60px rgba(0,0,0,0.6)', objectFit: 'contain' }}
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}

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
              <div className="chat-header-info" style={{ flex: 1 }}>
                <div className="chat-header-title">{activeThread.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {activeThread.user?.username} · {activeThread.user?.email}
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, color: activeThread.is_auto_reply ? 'var(--accent)' : 'var(--text-muted)', fontWeight: 600 }}>
                  Bot Auto-Reply
                </span>
                <button
                  className="btn-toggle-bot"
                  disabled={togglingBot}
                  onClick={toggleAutoReply}
                  style={{
                    width: 36, height: 20, borderRadius: 10, position: 'relative',
                    background: activeThread.is_auto_reply ? 'var(--accent)' : 'var(--panel-bg-hover)',
                    border: 'none', cursor: 'pointer', transition: 'background 0.2s'
                  }}
                  title={activeThread.is_auto_reply ? "Turn off Bot" : "Turn on Bot"}
                >
                  <div style={{
                    width: 14, height: 14, borderRadius: 7, background: '#fff',
                    position: 'absolute', top: 3, left: activeThread.is_auto_reply ? 19 : 3,
                    transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                  }} />
                </button>
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
                    {msg.image_url && (
                      <img
                        src={msg.image_url}
                        alt="attachment"
                        style={{ maxWidth: 200, maxHeight: 200, borderRadius: 8, display: 'block', cursor: 'zoom-in', marginBottom: msg.content ? 8 : 0 }}
                        onClick={() => setLightboxUrl(msg.image_url!)}
                      />
                    )}
                    {msg.role === 'user' || msg.role === 'admin_draft' ? (
                      msg.content
                    ) : (
                      msg.content && <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          code({ node, className, children, ...props }: any) {
                            const match = /language-(\w+)/.exec(className || '');
                            return match ? (
                              <SyntaxHighlighter
                                style={vscDarkPlus as any}
                                language={match[1]}
                                PreTag="div"
                                {...props}
                              >
                                {String(children).replace(/\n$/, '')}
                              </SyntaxHighlighter>
                            ) : (
                              <code className={className} {...props}>
                                {children}
                              </code>
                            );
                          }
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    )}
                    <span className="message-time">{formatTime(msg.created_at)}</span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* REPLY AREA */}
            <div className="admin-reply-area">
              <div className="admin-reply-label">
                Tin nhắn của bạn → <span>AI sẽ chuyển giọng (Ưu tiên Tiếng Việt)</span>
              </div>

              {/* Image preview bar */}
              {pendingImage && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, padding: '6px 10px', background: 'var(--panel-bg)', borderRadius: 8, border: '1px solid var(--border)' }}>
                  <img src={pendingImage.previewUrl} alt="preview" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6 }} />
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {pendingImage.file.name}
                  </span>
                  <button
                    type="button"
                    onClick={removePendingImage}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2, borderRadius: 4, display: 'flex', alignItems: 'center' }}
                    title="Remove image"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) attachImageFile(file);
                  e.target.value = '';
                }}
              />

              <div
                className="chat-input-wrapper"
                style={isDraggingOver ? { outline: '2px dashed var(--accent)', outlineOffset: 2 } : {}}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {/* Upload button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Attach image (or paste / drag & drop)"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: pendingImage ? 'var(--accent)' : 'var(--text-muted)', padding: '0 6px', display: 'flex', alignItems: 'center', flexShrink: 0 }}
                >
                  <Paperclip size={16} />
                </button>

                <textarea
                  className="chat-textarea"
                  placeholder="Gõ reply... hoặc paste / kéo thả ảnh vào đây"
                  rows={1}
                  value={replyInput}
                  onChange={e => {
                    setReplyInput(e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = Math.min(e.target.scrollHeight, 140) + 'px';
                  }}
                  onKeyDown={handleKeyDown}
                  onPaste={handlePaste}
                />
                <button
                  className="btn-send"
                  style={{ background: sending || uploadingImage ? 'var(--border)' : 'var(--accent)' }}
                  onClick={sendReply}
                  disabled={(!replyInput.trim() && !pendingImage) || sending || uploadingImage}
                >
                  {sending || uploadingImage ? <Loader2 size={16} style={{ animation: 'spin 0.7s linear infinite' }} /> : <Send size={16} />}
                </button>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 8 }}>
                Gemini AI transforms your reply • Enter to send • Paste or drag image to attach
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
