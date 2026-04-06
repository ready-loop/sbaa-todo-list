import { useCallback, useState } from 'react';
import type { ReadyLoopClient } from '@readyloop/sdk';
import { ReadyLoopChat } from '@readyloop/sdk/react';

import { AppShell } from '@/components/AppShell';
import { APP_NAME } from '@/config';

interface AuthState {
  userEmail: string | null;
  logout: () => void;
}

interface ChatPageProps {
  client: ReadyLoopClient;
  auth: AuthState;
}

function EmptyState() {
  return (
    <div className="rl-thread__empty">
      <div className="rl-thread__empty-title">{APP_NAME}</div>
      <div className="rl-thread__empty-subtitle">Add tasks, check them off, stay organized</div>
    </div>
  );
}

export function ChatPage({ client, auth }: ChatPageProps) {
  // Changing the key forces ReadyLoopChat to remount with a new conversation
  const [chatKey, setChatKey] = useState(0);

  const handleNewConversation = useCallback(() => {
    setChatKey((k) => k + 1);
  }, []);

  return (
    <AppShell
      userEmail={auth.userEmail}
      onLogout={auth.logout}
      onNewConversation={handleNewConversation}
    >
      <ReadyLoopChat
        key={chatKey}
        client={client}
        slots={{ EmptyState: <EmptyState /> }}
        composerPlaceholder="Add a task, check your list, mark items done..."
      />
    </AppShell>
  );
}
