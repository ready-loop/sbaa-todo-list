import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ReadyLoopClient } from '@readyloop/sdk';

import { AuthCallbackPage } from '../pages/AuthCallbackPage';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

function makeClient() {
  return new ReadyLoopClient({ apiUrl: 'http://test', appKey: 'sbaa_test' });
}

describe('AuthCallbackPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('redirects with error when code is missing', async () => {
    // No ?code= in the URL
    render(
      <MemoryRouter initialEntries={['/auth/callback']}>
        <AuthCallbackPage
          client={makeClient()}
          auth={{ exchangeCode: vi.fn() }}
        />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/?error=missing_code', { replace: true });
    });
  });

  it('exchanges code and redirects on success', async () => {
    const exchangeCode = vi.fn().mockResolvedValue({
      sessionToken: 'tok',
      aurigaUid: 'uid1',
      userEmail: 'a@b.com',
    });

    // Simulate ?code=abc in the URL
    Object.defineProperty(window, 'location', {
      value: { ...window.location, search: '?code=abc' },
      writable: true,
    });

    render(
      <MemoryRouter initialEntries={['/auth/callback?code=abc']}>
        <AuthCallbackPage
          client={makeClient()}
          auth={{ exchangeCode }}
        />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(exchangeCode).toHaveBeenCalledWith('abc');
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    });
  });

  it('redirects with error on exchange failure', async () => {
    const exchangeCode = vi.fn().mockRejectedValue(new Error('fail'));

    Object.defineProperty(window, 'location', {
      value: { ...window.location, search: '?code=bad' },
      writable: true,
    });

    render(
      <MemoryRouter initialEntries={['/auth/callback?code=bad']}>
        <AuthCallbackPage
          client={makeClient()}
          auth={{ exchangeCode }}
        />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/?error=auth_failed', { replace: true });
    });
  });
});
