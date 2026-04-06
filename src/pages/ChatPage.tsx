import { useCallback, useMemo, useState } from 'react';
import type { ReadyLoopClient } from '@readyloop/sdk';
import { ReadyLoopChat } from '@readyloop/sdk/react';

import { AppShell } from '@/components/AppShell';

interface AuthState {
  userEmail: string | null;
  logout: () => void;
}

interface ChatPageProps {
  client: ReadyLoopClient;
  auth: AuthState;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

function formatDate(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

function EmptyState({ userEmail }: { userEmail: string | null }) {
  const firstName = userEmail?.split('@')[0] ?? '';
  return (
    <div className="rl-thread__empty">
      <div className="rl-thread__empty-title">
        {getGreeting()}{firstName ? `, ${firstName}` : ''}.
      </div>
      <div className="rl-thread__empty-subtitle">
        {formatDate()} — What would you like to get done?
      </div>
    </div>
  );
}

export function ChatPage({ client, auth }: ChatPageProps) {
  const [chatKey, setChatKey] = useState(0);

  const handleNewConversation = useCallback(() => {
    setChatKey((k) => k + 1);
  }, []);

  const emptyState = useMemo(
    () => <EmptyState userEmail={auth.userEmail} />,
    [auth.userEmail],
  );

  return (
    <AppShell
      userEmail={auth.userEmail}
      onLogout={auth.logout}
      onNewConversation={handleNewConversation}
    >
      <ReadyLoopChat
        key={chatKey}
        client={client}
        slots={{ EmptyState: emptyState }}
        composerPlaceholder="Message assistant... Try 'Add buy groceries to my list'"
      />
    </AppShell>
  );
}
