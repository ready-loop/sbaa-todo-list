import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ReadyLoopClient, fetchSbaaConfig } from '@readyloop/sdk';

vi.mock('@readyloop/sdk', async () => {
  const actual = await vi.importActual('@readyloop/sdk');
  return {
    ...actual,
    fetchSbaaConfig: vi.fn(),
  };
});

describe('boot sequence', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('uses VITE_APP_KEY when set, skipping fetchSbaaConfig', () => {
    // When APP_KEY is provided, client is constructed directly
    const client = new ReadyLoopClient({
      apiUrl: 'http://test',
      appKey: 'sbaa_direct',
    });
    expect(client.appKey).toBe('sbaa_direct');
    expect(fetchSbaaConfig).not.toHaveBeenCalled();
  });

  it('resolves app_key from fetchSbaaConfig when no APP_KEY', async () => {
    const mock = vi.mocked(fetchSbaaConfig);
    mock.mockResolvedValue({
      app_key: 'sbaa_resolved',
      google_oauth_client_id: 'gid',
      stripe_publishable_key: 'spk',
    });

    const config = await fetchSbaaConfig('http://test', 'myapp.readyloop.ai');
    const client = new ReadyLoopClient({
      apiUrl: 'http://test',
      appKey: config.app_key,
    });

    expect(client.appKey).toBe('sbaa_resolved');
    expect(mock).toHaveBeenCalledWith('http://test', 'myapp.readyloop.ai');
  });

  it('client includes app_key in createConversation when set', async () => {
    const client = new ReadyLoopClient({
      apiUrl: 'http://test',
      appKey: 'sbaa_test123',
    });
    client.setAuth({
      sessionToken: 'tok',
      aurigaUid: 'uid1',
    });

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ conversation_id: 'conv1' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await client.createConversation();

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [, init] = fetchSpy.mock.calls[0];
    const body = JSON.parse(init!.body as string);
    expect(body.app_key).toBe('sbaa_test123');
  });
});
