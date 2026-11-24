import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fetchJson, clearBookApiCache } from '../src/services/books/http';

describe('fetchJson transport and deduplication', () => {
  beforeEach(() => {
    clearBookApiCache();
    vi.restoreAllMocks();
  });

  it('deduplicates simultaneous in-flight requests for the same URL', async () => {
    let networkFetchCount = 0;

    // Mock global fetch
    vi.stubGlobal('fetch', async () => {
      networkFetchCount += 1;
      await new Promise(resolve => setTimeout(resolve, 50));
      return {
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ results: [{ id: 1, title: 'Test Book' }] }),
      };
    });

    // Fire 3 simultaneous calls to the exact same URL
    const [res1, res2, res3] = await Promise.all([
      fetchJson<{ results: Array<{ id: number }> }>('https://api.example.com/books'),
      fetchJson<{ results: Array<{ id: number }> }>('https://api.example.com/books'),
      fetchJson<{ results: Array<{ id: number }> }>('https://api.example.com/books'),
    ]);

    expect(networkFetchCount).toBe(1);
    expect(res1.results[0]?.id).toBe(1);
    expect(res2.results[0]?.id).toBe(1);
    expect(res3.results[0]?.id).toBe(1);
  });

  it('serves subsequent calls from TTL cache without re-fetching', async () => {
    let networkFetchCount = 0;

    vi.stubGlobal('fetch', async () => {
      networkFetchCount += 1;
      return {
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ cached: true }),
      };
    });

    const first = await fetchJson<{ cached: boolean }>('https://api.example.com/cache-test', { cacheMs: 10_000 });
    const second = await fetchJson<{ cached: boolean }>('https://api.example.com/cache-test', { cacheMs: 10_000 });

    expect(first.cached).toBe(true);
    expect(second.cached).toBe(true);
    expect(networkFetchCount).toBe(1);
  });

  it('handles invalid JSON gracefully without throwing uncaught syntax errors', async () => {
    vi.stubGlobal('fetch', async () => ({
      ok: true,
      status: 200,
      text: async () => '<!doctype html><html><body>Error 502</body></html>',
    }));

    await expect(fetchJson('https://api.example.com/bad-json')).rejects.toThrow(
      /invalid JSON/i,
    );
  });
});
