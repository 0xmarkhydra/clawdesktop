import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

let socket: Socket | null = null;

// Track thread hiện tại để rejoin sau khi reconnect
let activeThreadId: string | null = null;

// Callback để notify ChatPage re-fetch messages sau reconnect
let onReconnectFetch: (() => void) | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket'],
      autoConnect: false,
      // Reconnect config
      reconnection: true,
      reconnectionAttempts: Infinity, // thử mãi cho đến khi kết nối được
      reconnectionDelay: 1000,        // 1s delay lần đầu
      reconnectionDelayMax: 10000,    // tối đa 10s
      randomizationFactor: 0.3,       // tránh tất cả client reconnect cùng lúc
    });

    // Sau khi reconnect thành công → tự động join lại thread
    socket.on('reconnect', () => {
      if (activeThreadId) {
        socket!.emit('join:thread', { threadId: activeThreadId });
      }
      // Notify ChatPage fetch lại messages để bù khoảng offline
      onReconnectFetch?.();
    });
  }
  return socket;
}

export function connectSocket() {
  const s = getSocket();
  if (!s.connected) s.connect();
  return s;
}

export function disconnectSocket() {
  activeThreadId = null;
  onReconnectFetch = null;
  if (socket?.connected) {
    socket.disconnect();
  }
}

export function joinThread(threadId: string) {
  activeThreadId = threadId;
  const s = getSocket();
  s.emit('join:thread', { threadId });
}

export function leaveThread(threadId: string) {
  if (activeThreadId === threadId) activeThreadId = null;
  const s = getSocket();
  s.emit('leave:thread', { threadId });
}

export function setReconnectCallback(cb: () => void) {
  onReconnectFetch = cb;
}
