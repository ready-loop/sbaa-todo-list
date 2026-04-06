import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import type { ReadyLoopClient } from '@readyloop/sdk';

import { LoginScreen } from './LoginScreen';

interface AuthState {
  hasHydrated: boolean;
  isAuthenticated: boolean;
  planSelected: boolean | null;
  signInWithGoogle: (origin?: string) => void;
}

interface RequireAuthProps {
  auth: AuthState;
  client: ReadyLoopClient;
  skipPlanCheck?: boolean;
  children: ReactNode;
}

export function RequireAuth({ auth, skipPlanCheck, children }: RequireAuthProps) {
  if (!auth.hasHydrated) {
    return (
      <div style={{ padding: 32, color: 'var(--rl-fg-muted)', textAlign: 'center' }}>
        Loading...
      </div>
    );
  }

  if (!auth.isAuthenticated) {
    return (
      <LoginScreen
        onLogin={() => auth.signInWithGoogle(window.location.origin)}
      />
    );
  }

  if (!skipPlanCheck && !auth.planSelected) {
    return <Navigate to="/subscribe" replace />;
  }

  return <>{children}</>;
}
