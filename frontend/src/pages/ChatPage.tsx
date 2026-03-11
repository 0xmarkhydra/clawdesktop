import { useState, useEffect, useRef, useCallback, useTransition } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Send, LogOut, User, Loader2, Trash2, Paperclip, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { api } from '../lib/api';
import { useAuthStore } from '../store/auth.store';
import { connectSocket, disconnectSocket, joinThread, leaveThread, setReconnectCallback } from '../lib/socket';
import ChatEmptyState from '../components/ChatEmptyState';
import logoIcon from '../assets/logo.svg';

interface Thread { id: string; title: string; updated_at: string; }
interface Message { id: string; content: string; role: 'user' | 'ai' | 'admin_draft'; created_at: string; thread_id?: string; image_url?: string | null; }
interface PendingImage { file: File; previewUrl: string; }

const THREADS_PAGE_SIZE = 10;
function sortThreadsByUpdatedAt<T extends { updated_at: string }>(list: T[]): T[] {
  return [...list].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
}

export default function ChatPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThread, setActiveThread] = useState<Thread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [sending, setSending] = useState(false);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMoreThreads, setLoadingMoreThreads] = useState(false);
  const [pagination, setPagination] = useState<{ current_page: number; total_pages: number; take: number; total: number } | null>(null);
  const [isCreatingThread, setIsCreatingThread] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [pendingImage, setPendingImage] = useState<PendingImage | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [, startTransition] = useTransition();
  const activeThreadRef = useRef<Thread | null>(null);
  const prevThreadId = useRef<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, isTyping, streamingText]);

  // Load threads (first page)
  useEffect(() => {
    api.get('/threads', { params: { page: 1, take: THREADS_PAGE_SIZE } }).then(res => {
      const data: Thread[] = res.data.data || [];
      const pag = res.data.pagination || null;
      setThreads(data);
      setPagination(pag);
    }).finally(() => setLoadingThreads(false));
  }, []);

  async function loadMoreThreads() {
    if (!pagination || loadingMoreThreads || pagination.current_page >= pagination.total_pages) return;
    setLoadingMoreThreads(true);
    try {
      const nextPage = pagination.current_page + 1;
      const res = await api.get('/threads', { params: { page: nextPage, take: THREADS_PAGE_SIZE } });
      const newData: Thread[] = res.data.data || [];
      const ids = new Set(threads.map(t => t.id));
      const merged = [...threads, ...newData.filter(t => !ids.has(t.id))];
      setThreads(sortThreadsByUpdatedAt(merged));
      setPagination(res.data.pagination || null);
    } finally {
      setLoadingMoreThreads(false);
    }
  }

  // WebSocket setup
  useEffect(() => {
    const socket = connectSocket();

    socket.on('thread:typing', () => {
      setIsTyping(true);
      setStreamingText('');
      setIsStreaming(false);
    });

    socket.on('thread:stream', (data: { chunk: string }) => {
      setIsTyping(false);
      setIsStreaming(true);
      setStreamingText(prev => prev + data.chunk);
    });

    socket.on('thread:stream:done', (data: { message: Message }) => {
      setIsStreaming(false);
      setStreamingText('');
      setMessages(prev => [...prev, data.message]);
      setThreads(prev => sortThreadsByUpdatedAt(prev.map(t =>
        t.id === data.message.thread_id ? { ...t, updated_at: new Date().toISOString() } : t
      )));
    });

    socket.on('thread:stream:error', () => {
      setIsTyping(false);
      setIsStreaming(false);
      setStreamingText('');
    });

    // Offline / reconnecting indicator
    socket.on('disconnect', () => setIsOffline(true));
    socket.on('connect', () => setIsOffline(false));

    // Sau khi reconnect: re-fetch messages để bù khoảng offline
    setReconnectCallback(() => {
      const thread = activeThreadRef.current;
      if (thread && !thread.id.startsWith('temp-')) {
        setIsTyping(false);
        setIsStreaming(false);
        setStreamingText('');
        api.get(`/threads/${thread.id}/messages`).then(res => {
          setMessages(res.data.data || []);
        });
      }
    });

    return () => {
      socket.off('thread:typing');
      socket.off('thread:stream');
      socket.off('thread:stream:done');
      socket.off('thread:stream:error');
      socket.off('disconnect');
      socket.off('connect');
      disconnectSocket();
    };
  }, []);

  // Sync activeThread vào ref để dùng trong reconnect callback
  useEffect(() => {
    activeThreadRef.current = activeThread;
  }, [activeThread]);

  // Switch threads
  useEffect(() => {
    if (!activeThread) return;
    if (activeThread.id.startsWith('temp-')) {
      if (prevThreadId.current) leaveThread(prevThreadId.current);
      prevThreadId.current = activeThread.id;
      setMessages([]);
      setIsTyping(false);
      setIsStreaming(false);
      setStreamingText('');
      return;
    }
    if (prevThreadId.current) leaveThread(prevThreadId.current);
    prevThreadId.current = activeThread.id;
    joinThread(activeThread.id);
    setMessages([]);
    setIsTyping(false);
    setIsStreaming(false);
    setStreamingText('');
    api.get(`/threads/${activeThread.id}/messages`).then(res => {
      setMessages(res.data.data || []);
    });
  }, [activeThread?.id]);

  const createThread = useCallback(() => {
    if (isCreatingThread) return;
    setIsCreatingThread(true);
    const tempThread: Thread = {
      id: 'temp-' + Date.now(),
      title: `New conversation`,
      updated_at: new Date().toISOString(),
    };
    setThreads(prev => [tempThread, ...prev]);
    setActiveThread(tempThread);
    api.post('/threads', { title: tempThread.title })
      .then(res => {
        const real = res.data;
        startTransition(() => {
          setThreads(prev => sortThreadsByUpdatedAt(prev.map(t => t.id === tempThread.id ? real : t)));
          setActiveThread(real);
        });
      })
      .catch(() => {
        setThreads(prev => prev.filter(t => t.id !== tempThread.id));
        setActiveThread(prev => prev?.id === tempThread.id ? null : prev);
      })
      .finally(() => setIsCreatingThread(false));
  }, [isCreatingThread]);

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

  async function sendMessage() {
    if (!input.trim() && !pendingImage) return;
    if (!activeThread || sending) return;

    const content = input.trim();
    const imageToSend = pendingImage;

    setInput('');
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

      // Optimistic update
      const tempMsg: Message = {
        id: Date.now().toString(),
        content,
        role: 'user',
        created_at: new Date().toISOString(),
        image_url: imageUrl || null,
      };
      setMessages(prev => [...prev, tempMsg]);

      await api.post(`/threads/${activeThread.id}/messages`, {
        content,
        image_url: imageUrl,
      });
    } catch {
      /* keep optimistic */
    } finally {
      setSending(false);
      setUploadingImage(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
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

  function handleLogout() {
    logout();
    navigate('/login');
  }

  function formatTime(dateStr: string) {
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function formatThreadDate(dateStr: string) {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString();
  }

  async function deleteThread(e: React.MouseEvent, threadId: string) {
    e.stopPropagation();
    if (threadId.startsWith('temp-')) {
      setThreads(prev => prev.filter(t => t.id !== threadId));
      if (activeThread?.id === threadId) setActiveThread(null);
      return;
    }
    try {
      await api.delete(`/threads/${threadId}`);
      setThreads(prev => prev.filter(t => t.id !== threadId));
      if (activeThread?.id === threadId) setActiveThread(null);
    } catch {
      // Optional: show toast or alert
    }
  }

  return (
    <div className="chat-layout">
      {/* Offline/Reconnecting Banner */}
      {isOffline && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
          background: '#f59e0b', color: '#1c1917',
          textAlign: 'center', padding: '8px 16px', fontSize: 13, fontWeight: 600,
        }}>
          ⚡ Mất kết nối — đang tự động kết nối lại...
        </div>
      )}
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-brand">
          <div className="brand-icon">
            <img src={logoIcon} alt="Logo" width={22} height={22} />
          </div>
          <span className="brand-name">Claw<span>Desktop.VN</span></span>
        </div>
          <button
            type="button"
            className="btn-new-thread"
            onClick={createThread}
            disabled={isCreatingThread}
          >
            {isCreatingThread ? (
              <Loader2 size={16} style={{ animation: 'spin 0.7s linear infinite' }} />
            ) : (
              <Plus size={16} />
            )}
            New Chat
          </button>
        </div>

        <div className="sidebar-threads">
          {loadingThreads ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '24px' }}>
              <div className="spinner" />
            </div>
          ) : threads.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, padding: '24px 16px' }}>
              No conversations yet. Start a new chat!
            </div>
          ) : (
            <>
              <div className="sidebar-section-label">Recent</div>
              {threads.map(t => (
                <div
                  key={t.id}
                  className={`thread-item ${activeThread?.id === t.id ? 'active' : ''}`}
                  onClick={() => setActiveThread(t)}
                >
                  <div className="thread-item-content">
                    <div className="thread-title">{t.title}</div>
                    <div className="thread-meta">{formatThreadDate(t.updated_at)}</div>
                  </div>
                  <button
                    type="button"
                    className="thread-delete-btn"
                    onClick={e => deleteThread(e, t.id)}
                    title="Delete conversation"
                    aria-label="Delete conversation"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {pagination && pagination.current_page < pagination.total_pages && (
                <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    style={{ width: '100%', fontSize: 13 }}
                    onClick={loadMoreThreads}
                    disabled={loadingMoreThreads}
                  >
                    {loadingMoreThreads ? <Loader2 size={14} style={{ animation: 'spin 0.7s linear infinite' }} /> : null}
                    {loadingMoreThreads ? ' Loading…' : 'Load more'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <div className="sidebar-footer">
          <div className="user-avatar">{user?.username?.[0]?.toUpperCase()}</div>
          <div className="user-info">
            <div className="user-name">{user?.username}</div>
            <div className="user-role">{user?.email}</div>
          </div>
          <button className="btn-logout" onClick={handleLogout} title="Logout"><LogOut size={16} /></button>
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

      {/* CHAT AREA */}
      <main className="chat-area">
        {!activeThread ? (
          <ChatEmptyState onCreateThread={createThread} isCreating={isCreatingThread} />
        ) : (
          <>
            <div className="chat-header">
              <div className="msg-avatar ai-avatar"><img src={logoIcon} alt="Logo" width={22} height={22} /></div>
              <div className="chat-header-info">
                <div className="chat-header-title">{activeThread.title}</div>
                <div className="chat-header-status">
                  <span className="status-dot" /> Online
                </div>
              </div>
            </div>

            <div className="chat-messages">
              {(() => {
                const visibleMessages = messages.filter(m => m.role !== 'admin_draft');
                const hasContent = visibleMessages.length > 0 || isTyping || isStreaming;
                if (!hasContent) {
                  return <div ref={messagesEndRef} />;
                }
                return (
                  <>
                    {visibleMessages.map(msg => (
                      <div key={msg.id} className={`message-row ${msg.role === 'user' ? 'user-row' : ''}`}>
                        <div className={`msg-avatar ${msg.role === 'user' ? 'user-avatar-icon' : 'ai-avatar'}`}>
                          {msg.role === 'user' ? <User size={14} /> : <img src={logoIcon} alt="Logo" width={22} height={22} />}
                        </div>
                        <div className={`message-bubble ${msg.role === 'user' ? 'user-bubble' : 'ai-bubble'}`}>
                          {msg.image_url && (
                            <img
                              src={msg.image_url}
                              alt="attachment"
                              style={{ maxWidth: 220, maxHeight: 220, borderRadius: 8, display: 'block', cursor: 'zoom-in', marginBottom: msg.content ? 8 : 0 }}
                              onClick={() => setLightboxUrl(msg.image_url!)}
                            />
                          )}
                          {msg.role === 'user' ? (
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

                    {isTyping && (
                      <div className="typing-row">
                        <div className="msg-avatar ai-avatar"><img src={logoIcon} alt="Logo" width={22} height={22} /></div>
                        <div className="typing-bubble">
                          <div className="typing-dot" />
                          <div className="typing-dot" />
                          <div className="typing-dot" />
                        </div>
                      </div>
                    )}

                    {isStreaming && streamingText && (
                      <div className="message-row">
                        <div className="msg-avatar ai-avatar"><img src={logoIcon} alt="Logo" width={22} height={22} /></div>
                        <div className="message-bubble ai-bubble">
                          <ReactMarkdown
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
                            {streamingText}
                          </ReactMarkdown>
                          <span className="streaming-cursor" />
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </>
                );
              })()}
            </div>

            <div className="chat-input-area">
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
                  className="btn-attach"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={activeThread?.id?.startsWith('temp-') ?? false}
                  title="Attach image (or paste / drag & drop)"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: pendingImage ? 'var(--accent)' : 'var(--text-muted)', padding: '0 6px', display: 'flex', alignItems: 'center', flexShrink: 0 }}
                >
                  <Paperclip size={16} />
                </button>

                <textarea
                  ref={textareaRef}
                  className="chat-textarea"
                  placeholder={activeThread?.id?.startsWith('temp-') ? 'Creating conversation...' : 'Type a message... (paste or drag image here)'}
                  rows={1}
                  value={input}
                  onChange={e => {
                    setInput(e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = Math.min(e.target.scrollHeight, 140) + 'px';
                  }}
                  onKeyDown={handleKeyDown}
                  onPaste={handlePaste}
                />
                <button
                  className="btn-send"
                  onClick={sendMessage}
                  disabled={(!input.trim() && !pendingImage) || sending || uploadingImage || isTyping || isStreaming || (activeThread?.id?.startsWith('temp-') ?? false)}
                >
                  {sending || uploadingImage ? <Loader2 size={16} style={{ animation: 'spin 0.7s linear infinite' }} /> : <Send size={16} />}
                </button>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 8 }}>
                Powered by Claw AI • Enter to send • Paste or drag image to attach
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
