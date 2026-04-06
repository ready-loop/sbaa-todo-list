import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ReadyLoopClient, fetchSbaaConfig } from '@readyloop/sdk';
import { ReadyLoopProvider } from '@readyloop/sdk/react';

import { API_URL, APP_KEY } from './config';
import { App } from './App';

// Import SDK styles
import '@readyloop/sdk/styles.css';

function Root() {
  const [client, setClient] = useState<ReadyLoopClient | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      try {
        let appKey = APP_KEY;
        if (!appKey) {
          const config = await fetchSbaaConfig(API_URL, window.location.hostname);
          appKey = config.app_key;
        }
        if (cancelled) return;
        setClient(new ReadyLoopClient({ apiUrl: API_URL, appKey }));
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load app config');
      }
    }

    boot();
    return () => { cancelled = true; };
  }, []);

  if (error) {
    return (
      <div style={{ padding: 32, color: 'var(--rl-danger)', textAlign: 'center' }}>
        {error}
      </div>
    );
  }

  if (!client) {
    return (
      <div style={{ padding: 32, color: 'var(--rl-fg-muted)', textAlign: 'center' }}>
        Loading...
      </div>
    );
  }

  return (
    <ReadyLoopProvider client={client}>
      <App client={client} />
    </ReadyLoopProvider>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
