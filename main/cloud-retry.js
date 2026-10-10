// main/cloud-retry.js — Shared retry with exponential backoff for cloud providers
// CommonJS only — Electron main process
//
// Requires nothing: each provider passes its own constants and token refresh,
// so test stubs of ./constants and ./auth stay on the provider's path.

async function withRetry(fn, { retries, baseDelayMs, maxDelayMs, refresh }) {
  let lastError;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const status = err.status || err.statusCode;
      if (status === 429 || status === 503 || status === 504) {
        const delay = Math.min(baseDelayMs * Math.pow(2, attempt), maxDelayMs);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      if (status === 401) {
        // Force a refresh immediately so the retry does not reuse a cached token (LL-095).
        try {
          await refresh();
        } catch {
          // If refresh fails, throw original error
        }
        if (attempt === 0) continue; // Retry once after refresh
      }
      throw err;
    }
  }
  throw lastError;
}

module.exports = { withRetry };
