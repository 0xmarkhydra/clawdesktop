import { memo } from 'react';
import { Plus, MessageSquare, Loader2 } from 'lucide-react';

interface ChatEmptyStateProps {
  onCreateThread: () => void;
  isCreating: boolean;
}

function ChatEmptyState({ onCreateThread, isCreating }: ChatEmptyStateProps) {
  return (
    <div className="chat-empty" style={{ flex: 1, marginTop: '20vh' }}>
      <div className="chat-empty-icon">
        <MessageSquare size={24} color="var(--accent)" />
      </div>
      <h3>Select or start a conversation</h3>
      <p>Choose a chat from the sidebar or create a new one</p>
      <button
        type="button"
        className="btn btn-primary"
        style={{ marginTop: 8 }}
        onClick={onCreateThread}
        disabled={isCreating}
        aria-busy={isCreating}
      >
        {isCreating ? (
          <Loader2 size={16} style={{ animation: 'spin 0.7s linear infinite' }} />
        ) : (
          <Plus size={16} />
        )}
        {isCreating ? ' Creating…' : ' New Chat'}
      </button>
    </div>
  );
}

export default memo(ChatEmptyState);
