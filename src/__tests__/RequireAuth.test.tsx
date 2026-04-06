import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ReadyLoopClient } from '@readyloop/sdk';

import { RequireAuth } from '../components/RequireAuth';

function makeClient() {
  return new ReadyLoopClient({ apiUrl: 'http://test', appKey: 'sbaa_test' });
}

function makeAuth(overrides: Record<string, unknown> = {}) {
  return {
    hasHydrated: true,
    isAuthenticated: true,
    planSelected: true as boolean | null,
    signInWithGoogle: vi.fn(),
    ...overrides,
  };
}

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('RequireAuth', () => {
  it('shows loading while hydrating', () => {
    renderWithRouter(
      <RequireAuth auth={makeAuth({ hasHydrated: false })} client={makeClient()}>
        <div>content</div>
      </RequireAuth>,
    );
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByText('content')).not.toBeInTheDocument();
  });

  it('shows login screen when not authenticated', () => {
    renderWithRouter(
      <RequireAuth auth={makeAuth({ isAuthenticated: false })} client={makeClient()}>
        <div>content</div>
      </RequireAuth>,
    );
    expect(screen.getByText('Sign in with Google')).toBeInTheDocument();
    expect(screen.queryByText('content')).not.toBeInTheDocument();
  });

  it('redirects to /subscribe when plan not selected', () => {
    const { container } = renderWithRouter(
      <RequireAuth auth={makeAuth({ planSelected: null })} client={makeClient()}>
        <div>content</div>
      </RequireAuth>,
    );
    // Navigate component renders nothing visible
    expect(screen.queryByText('content')).not.toBeInTheDocument();
    expect(container.innerHTML).not.toContain('content');
  });

  it('renders children when authenticated with plan', () => {
    renderWithRouter(
      <RequireAuth auth={makeAuth()} client={makeClient()}>
        <div>content</div>
      </RequireAuth>,
    );
    expect(screen.getByText('content')).toBeInTheDocument();
  });

  it('skips plan check with skipPlanCheck', () => {
    renderWithRouter(
      <RequireAuth auth={makeAuth({ planSelected: null })} client={makeClient()} skipPlanCheck>
        <div>content</div>
      </RequireAuth>,
    );
    expect(screen.getByText('content')).toBeInTheDocument();
  });
});
