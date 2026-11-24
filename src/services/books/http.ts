/** Shared, defensive JSON transport for third-party catalogue APIs with in-flight deduplication and bounded caching. */

type CacheEntry = { expiresAt: number; value: unknown };

const responseCache = new Map<string, CacheEntry>();
const inFlightRequests = new Map<string, Promise<unknown>>();

const DEFAULT_TIMEOUT_MS = 7_000;
const DEFAULT_CACHE_MS = 45_000;
const MAX_CACHE_ENTRIES = 100;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const abortError = (): DOMException => new DOMException('The request was cancelled.', 'AbortError');

const wait = (duration: number, signal?: AbortSignal): Promise<void> =>
  new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(abortError());
      return;
    }

    const timeout = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, duration);

    const onAbort = () => {
      clearTimeout(timeout);
      signal?.removeEventListener('abort', onAbort);
      reject(abortError());
    };

    signal?.addEventListener('abort', onAbort, { once: true });
  });

const requestOnce = async (url: string, signal: AbortSignal, timeoutMs: number): Promise<unknown> => {
  const controller = new AbortController();
  let timedOut = false;
  const timeout = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);
  const forwardAbort = () => controller.abort();
  signal.addEventListener('abort', forwardAbort, { once: true });

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
      credentials: 'omit',
    });
    const body = await response.text();

    if (!response.ok) {
      const error = new Error(`Catalogue API returned HTTP ${response.status}.`);
      Object.assign(error, { status: response.status });
      throw error;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(body) as unknown;
    } catch {
      throw new Error('The catalogue API returned invalid JSON. Please try again.');
    }

    if (!isRecord(parsed) && !Array.isArray(parsed)) {
      throw new Error('The catalogue API response had an unexpected format.');
    }

    return parsed;
  } catch (error) {
    if (signal.aborted) throw abortError();
    if (timedOut) throw new Error('The catalogue API request timed out.');
    throw error;
  } finally {
    clearTimeout(timeout);
    signal.removeEventListener('abort', forwardAbort);
  }
};

/**
 * Execute request with retry and in-flight deduplication.
 */
const executeWithRetry = async (url: string, timeoutMs: number): Promise<unknown> => {
  const controller = new AbortController();
  let result: unknown;
  let lastError: unknown;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      result = await requestOnce(url, controller.signal, timeoutMs);
      lastError = undefined;
      break;
    } catch (error) {
      lastError = error;
      const status =
        typeof error === 'object' && error !== null && 'status' in error
          ? Number((error as { status?: unknown }).status)
          : 0;
      const retryable = status === 0 || status === 429 || status >= 500;
      if (!retryable || attempt === 1) break;
      await wait(250);
    }
  }

  if (lastError) throw lastError;
  if (result === undefined) throw new Error('The catalogue API returned no data.');

  return result;
};

export const fetchJson = async <T>(
  url: string,
  options: { signal?: AbortSignal; timeoutMs?: number; cacheMs?: number } = {},
): Promise<T> => {
  const { signal, timeoutMs = DEFAULT_TIMEOUT_MS, cacheMs = DEFAULT_CACHE_MS } = options;
  if (signal?.aborted) throw abortError();

  // 1. Check in-memory cache
  const cached = responseCache.get(url);
  if (cached && cached.expiresAt > Date.now()) return cached.value as T;
  if (cached) responseCache.delete(url);

  // 2. Attach to or initiate in-flight request deduplication
  let requestPromise = inFlightRequests.get(url);

  if (!requestPromise) {
    requestPromise = executeWithRetry(url, timeoutMs)
      .then(data => {
        if (cacheMs > 0) {
          if (responseCache.size >= MAX_CACHE_ENTRIES) {
            const oldestKey = responseCache.keys().next().value;
            if (oldestKey) responseCache.delete(oldestKey);
          }
          responseCache.set(url, { expiresAt: Date.now() + cacheMs, value: data });
        }
        return data;
      })
      .finally(() => {
        inFlightRequests.delete(url);
      });

    inFlightRequests.set(url, requestPromise);
  }

  // 3. Await with caller's cancellation signal
  if (!signal) {
    return (await requestPromise) as T;
  }

  return new Promise<T>((resolve, reject) => {
    const onAbort = () => reject(abortError());
    signal.addEventListener('abort', onAbort, { once: true });

    requestPromise!
      .then(value => {
        signal.removeEventListener('abort', onAbort);
        resolve(value as T);
      })
      .catch(error => {
        signal.removeEventListener('abort', onAbort);
        if (signal.aborted) reject(abortError());
        else reject(error);
      });
  });
};

export const clearBookApiCache = (): void => {
  responseCache.clear();
  inFlightRequests.clear();
};
