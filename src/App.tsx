import { BrowserRouter, Routes, Route } from 'react-router-dom';
import type { ReadyLoopClient } from '@readyloop/sdk';
import { useReadyLoopAuth } from '@readyloop/sdk/react';

import { RequireAuth } from './components/RequireAuth';
import { ChatPage } from './pages/ChatPage';
import { AuthCallbackPage } from './pages/AuthCallbackPage';
import { SubscribePage } from './pages/SubscribePage';

export function App({ client }: { client: ReadyLoopClient }) {
  const auth = useReadyLoopAuth(client);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth/callback" element={<AuthCallbackPage client={client} auth={auth} />} />
        <Route
          path="/subscribe"
          element={
            <RequireAuth auth={auth} client={client} skipPlanCheck>
              <SubscribePage client={client} auth={auth} />
            </RequireAuth>
          }
        />
        <Route
          path="*"
          element={
            <RequireAuth auth={auth} client={client}>
              <ChatPage client={client} auth={auth} />
            </RequireAuth>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
