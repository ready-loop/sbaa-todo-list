import type { ReactNode } from 'react';
import { APP_NAME } from '@/config';

interface AppShellProps {
  userEmail?: string | null;
  onLogout: () => void;
  onNewConversation: () => void;
  children: ReactNode;
}

export function AppShell({ userEmail, onLogout, onNewConversation, children }: AppShellProps) {
  return (
    <div className="sbaa-shell">
      <header className="sbaa-shell__header">
        <span className="sbaa-shell__logo">{APP_NAME}</span>
        <div className="sbaa-shell__actions">
          <button className="sbaa-shell__btn" onClick={onNewConversation}>
            New chat
          </button>
          {userEmail && (
            <span className="sbaa-shell__email">{userEmail}</span>
          )}
          <button className="sbaa-shell__btn sbaa-shell__btn--subtle" onClick={onLogout}>
            Sign out
          </button>
        </div>
      </header>
      <main className="sbaa-shell__content">
        {children}
      </main>
    </div>
  );
}
