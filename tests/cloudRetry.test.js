import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { withRetry } = require("../main/cloud-retry.js");

describe("cloud-retry withRetry", () => {
  let delays;
  let refresh;
  let options;

  beforeEach(() => {
    delays = [];
    refresh = vi.fn().mockResolvedValue(undefined);
    options = { retries: 5, baseDelayMs: 1, maxDelayMs: 8, refresh };
    vi.spyOn(globalThis, "setTimeout").mockImplementation((fn, delay) => {
      delays.push(delay);
      fn();
      return 0;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each([429, 503, 504])("retries 429, 503 and 504 and returns the eventual value (%i)", async (status) => {
    const fn = vi.fn().mockRejectedValueOnce({ status }).mockResolvedValueOnce("ok");

    await expect(withRetry(fn, options)).resolves.toBe("ok");
    expect(fn).toHaveBeenCalledTimes(2);
    expect(delays).toEqual([1]);
    expect(refresh).not.toHaveBeenCalled();
  });

  it("reads the status from statusCode", async () => {
    const fn = vi.fn().mockRejectedValueOnce({ statusCode: 503 }).mockResolvedValueOnce("ok");

    await expect(withRetry(fn, options)).resolves.toBe("ok");
    expect(delays).toEqual([1]);
  });

  it("sleeps after the final attempt and throws the last error", async () => {
    const errors = [];
    const fn = vi.fn().mockImplementation(() => {
      const err = { status: 503, n: errors.length + 1 };
      errors.push(err);
      return Promise.reject(err);
    });

    const thrown = await withRetry(fn, options).catch((err) => err);
    expect(fn).toHaveBeenCalledTimes(5);
    expect(thrown).toBe(errors[4]);
    expect(thrown.n).toBe(5);
    expect(delays).toEqual([1, 2, 4, 8, 8]);
  });

  it("a first-attempt 401 refreshes once and retries without delay", async () => {
    const fn = vi.fn().mockRejectedValueOnce({ status: 401 }).mockResolvedValueOnce("ok");

    await expect(withRetry(fn, options)).resolves.toBe("ok");
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(delays).toEqual([]);
  });

  it("a later 401 refreshes and then rethrows", async () => {
    const unauthorized = { status: 401 };
    const fn = vi.fn().mockRejectedValueOnce({ status: 429 }).mockRejectedValueOnce(unauthorized);

    await expect(withRetry(fn, options)).rejects.toBe(unauthorized);
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(delays).toEqual([1]);
  });

  it("a refresh failure is swallowed", async () => {
    refresh.mockRejectedValue(new Error("refresh failed"));
    const fn = vi.fn().mockRejectedValueOnce({ status: 401 }).mockResolvedValueOnce("ok");

    await expect(withRetry(fn, options)).resolves.toBe("ok");
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it.each([[{ status: 400 }], [new Error("network")]])("non-retryable errors rethrow at once (%o)", async (error) => {
    const fn = vi.fn().mockRejectedValue(error);

    await expect(withRetry(fn, options)).rejects.toBe(error);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(refresh).not.toHaveBeenCalled();
    expect(delays).toEqual([]);
  });
});
