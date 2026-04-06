import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ReadyLoopClient } from '@readyloop/sdk';

interface AuthState {
  exchangeCode: (code: string) => Promise<unknown>;
}

interface AuthCallbackPageProps {
  client: ReadyLoopClient;
  auth: AuthState;
}

export function AuthCallbackPage({ auth }: AuthCallbackPageProps) {
  const navigate = useNavigate();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const code = new URLSearchParams(window.location.search).get('code');
    if (!code) {
      navigate('/?error=missing_code', { replace: true });
      return;
    }

    auth
      .exchangeCode(code)
      .then(() => navigate('/', { replace: true }))
      .catch(() => navigate('/?error=auth_failed', { replace: true }));
  }, [auth, navigate]);

  return (
    <div style={{ padding: 32, color: 'var(--rl-fg-muted)', textAlign: 'center' }}>
      Signing in...
    </div>
  );
}
