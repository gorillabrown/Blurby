// @vitest-environment jsdom

import { act, useState, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ErrorBoundary from "../src/components/ErrorBoundary";

function SafeChild() {
  return <div data-testid="safe-child">Safe child</div>;
}

function ThrowingChild({ message = "Boom" }: { message?: string }): ReactElement {
  throw new Error(message);
}

function ResettableHarness({
  onReset,
  errorMessage = "Boom",
}: {
  onReset?: () => void;
  errorMessage?: string;
}) {
  const [shouldThrow, setShouldThrow] = useState(true);

  return (
    <ErrorBoundary
      onReset={() => {
        setShouldThrow(false);
        onReset?.();
      }}
    >
      {shouldThrow ? <ThrowingChild message={errorMessage} /> : <SafeChild />}
    </ErrorBoundary>
  );
}

describe("ErrorBoundary", () => {
  let container: HTMLDivElement;
  let root: Root;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  const render = async (ui: ReactElement) => {
    await act(async () => {
      root.render(ui);
    });
  };

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    delete (window as any).electronAPI;
  });

  afterEach(async () => {
    await act(async () => {
      root.unmount();
    });
    container.remove();
    delete (window as any).electronAPI;
    consoleErrorSpy.mockRestore();
  });

  it("renders children when nothing throws", async () => {
    await render(
      <ErrorBoundary>
        <SafeChild />
      </ErrorBoundary>,
    );

    expect(container.querySelector("[data-testid='safe-child']")).not.toBeNull();
    expect(container.querySelector("[role='alert']")).toBeNull();
  });

  it("shows the fallback UI when a child throws", async () => {
    await render(
      <ErrorBoundary>
        <ThrowingChild />
      </ErrorBoundary>,
    );

    const alert = container.querySelector("[role='alert']");
    expect(alert).not.toBeNull();
    expect(alert?.textContent).toContain("Something went wrong");
    expect(alert?.textContent).toContain("Boom");
    expect(container.querySelector(".error-boundary__reload")).not.toBeNull();
  });

  it("uses the thrown error message in the fallback", async () => {
    await render(
      <ErrorBoundary>
        <ThrowingChild message="Reader exploded" />
      </ErrorBoundary>,
    );

    expect(container.textContent).toContain("Reader exploded");
  });

  it("calls componentDidCatch and logs to console.error", async () => {
    await render(
      <ErrorBoundary>
        <ThrowingChild message="Captured by boundary" />
      </ErrorBoundary>,
    );

    expect(consoleErrorSpy).toHaveBeenCalled();
    const boundaryCall = consoleErrorSpy.mock.calls.find(([firstArg]: unknown[]) => firstArg === "ErrorBoundary caught:");
    expect(boundaryCall).toBeDefined();
    expect(boundaryCall?.[1]).toBeInstanceOf(Error);
    expect((boundaryCall?.[1] as Error).message).toBe("Captured by boundary");
    expect(boundaryCall?.[2]).toEqual(expect.objectContaining({
      componentStack: expect.any(String),
    }));
  });

  it("logs to window.electronAPI.logError when available", async () => {
    const logError = vi.fn();
    (window as any).electronAPI = { logError };

    await render(
      <ErrorBoundary>
        <ThrowingChild message="IPC logging" />
      </ErrorBoundary>,
    );

    expect(logError).toHaveBeenCalledTimes(1);
    expect(logError).toHaveBeenCalledWith(expect.stringContaining("IPC logging"));
    expect(logError.mock.calls[0][0]).toContain("\n");
  });

  it("does not require window.electronAPI to exist", async () => {
    delete (window as any).electronAPI;

    await render(
      <ErrorBoundary>
        <ThrowingChild message="No electron bridge" />
      </ErrorBoundary>,
    );

    expect(container.querySelector("[role='alert']")).not.toBeNull();
  });

  it("resets after Reload and fires onReset", async () => {
    const onReset = vi.fn();

    await render(<ResettableHarness onReset={onReset} errorMessage="Reset me" />);

    expect(container.textContent).toContain("Reset me");
    const reloadButton = container.querySelector("button.error-boundary__reload") as HTMLButtonElement | null;
    expect(reloadButton).not.toBeNull();

    await act(async () => {
      reloadButton!.click();
    });

    expect(onReset).toHaveBeenCalledTimes(1);
    expect(container.querySelector("[data-testid='safe-child']")).not.toBeNull();
    expect(container.querySelector("[role='alert']")).toBeNull();
  });
});
