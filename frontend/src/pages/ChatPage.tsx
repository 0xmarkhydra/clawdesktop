import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Send, LogOut, User, MessageSquare, Loader2, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { api } from '../lib/api';
import { useAuthStore } from '../store/auth.store';
import { connectSocket, disconnectSocket, joinThread, leaveThread } from '../lib/socket';

interface Thread { id: string; title: string; updated_at: string; }
interface Message { id: string; content: string; role: 'user' | 'ai' | 'admin_draft'; created_at: string; thread_id?: string; }

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
  const prevThreadId = useRef<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, isTyping, streamingText]);

  // Load threads
  useEffect(() => {
    api.get('/threads').then(res => {
      setThreads(res.data.data || []);
    }).finally(() => setLoadingThreads(false));
  }, []);

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
      // Update thread updated_at
      setThreads(prev => prev.map(t =>
        t.id === data.message.thread_id ? { ...t, updated_at: new Date().toISOString() } : t
      ).sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()));
    });

    socket.on('thread:stream:error', () => {
      setIsTyping(false);
      setIsStreaming(false);
      setStreamingText('');
    });

    return () => {
      socket.off('thread:typing');
      socket.off('thread:stream');
      socket.off('thread:stream:done');
      socket.off('thread:stream:error');
      disconnectSocket();
    };
  }, []);

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

  function createThread() {
    const tempThread: Thread = {
      id: 'temp-' + Date.now(),
      title: `New conversation ${threads.length + 1}`,
      updated_at: new Date().toISOString(),
    };
    setThreads(prev => [tempThread, ...prev]);
    setActiveThread(tempThread);
    api.post('/threads', { title: tempThread.title })
      .then(res => {
        const real = res.data;
        setThreads(prev => prev.map(t => t.id === tempThread.id ? real : t));
        setActiveThread(real);
      })
      .catch(() => {
        setThreads(prev => prev.filter(t => t.id !== tempThread.id));
        setActiveThread(prev => prev?.id === tempThread.id ? null : prev);
      });
  }

  async function sendMessage() {
    if (!input.trim() || !activeThread || sending) return;
    const content = input.trim();
    setInput('');
    setSending(true);
    // Optimistic update
    const tempMsg: Message = { id: Date.now().toString(), content, role: 'user', created_at: new Date().toISOString() };
    setMessages(prev => [...prev, tempMsg]);
    try {
      await api.post(`/threads/${activeThread.id}/messages`, { content });
    } catch { /* keep optimistic */ }
    finally { setSending(false); }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
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
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-brand">
          <div className="brand-icon">
            <img src="/logo.svg" alt="Logo" width={22} height={22} />
          </div>
          <span className="brand-name">Claw<span>Desktop.VN</span></span>
        </div>
          <button className="btn-new-thread" onClick={createThread}>
            <Plus size={16} /> New Chat
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

      {/* CHAT AREA */}
      <main className="chat-area">
        {!activeThread ? (
          <div className="chat-empty" style={{ flex: 1, marginTop: '20vh' }}>
            <div className="chat-empty-icon"><MessageSquare size={24} color="var(--accent)" /></div>
            <h3>Select or start a conversation</h3>
            <p>Choose a chat from the sidebar or create a new one</p>
            <button className="btn btn-primary" style={{ marginTop: 8 }} onClick={createThread}>
              <Plus size={16} /> New Chat
            </button>
          </div>
        ) : (
          <>
            <div className="chat-header">
              <div className="msg-avatar ai-avatar"><img src="/logo.svg" alt="Logo" width={22} height={22} /></div>
              <div className="chat-header-info">
                <div className="chat-header-title">{activeThread.title}</div>
                <div className="chat-header-status">
                  <span className="status-dot" /> Online
                </div>
              </div>
            </div>

            <div className="chat-messages">
              {messages.filter(m => m.role !== 'admin_draft').map(msg => (
                <div key={msg.id} className={`message-row ${msg.role === 'user' ? 'user-row' : ''}`}>
                  <div className={`msg-avatar ${msg.role === 'user' ? 'user-avatar-icon' : 'ai-avatar'}`}>
                    {msg.role === 'user' ? <User size={14} /> : <img src="/logo.svg" alt="Logo" width={22} height={22} />}
                  </div>
                  <div className={`message-bubble ${msg.role === 'user' ? 'user-bubble' : 'ai-bubble'}`}>
                    {msg.role === 'user' ? (
                      msg.content
                    ) : (
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
                        {msg.content}
                      </ReactMarkdown>
                    )}
                    <span className="message-time">{formatTime(msg.created_at)}</span>
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="typing-row">
                  <div className="msg-avatar ai-avatar"><img src="/logo.svg" alt="Logo" width={22} height={22} /></div>
                  <div className="typing-bubble">
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                  </div>
                </div>
              )}

              {/* Streaming text */}
              {isStreaming && streamingText && (
                <div className="message-row">
                  <div className="msg-avatar ai-avatar"><img src="/logo.svg" alt="Logo" width={22} height={22} /></div>
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
            </div>

            <div className="chat-input-area">
              <div className="chat-input-wrapper">
                <textarea
                  ref={textareaRef}
                  className="chat-textarea"
                  placeholder={activeThread?.id?.startsWith('temp-') ? 'Creating conversation...' : 'Type a message...'}
                  rows={1}
                  value={input}
                  onChange={e => {
                    setInput(e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = Math.min(e.target.scrollHeight, 140) + 'px';
                  }}
                  onKeyDown={handleKeyDown}
                />
                <button
                  className="btn-send"
                  onClick={sendMessage}
                  disabled={!input.trim() || sending || isTyping || isStreaming || (activeThread?.id?.startsWith('temp-') ?? false)}
                >
                  {sending ? <Loader2 size={16} style={{ animation: 'spin 0.7s linear infinite' }} /> : <Send size={16} />}
                </button>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 8 }}>
                Powered by Claw AI • Press Enter to send, Shift+Enter for new line
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
