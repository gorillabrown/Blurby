import { createContext, useContext, useCallback, useState, useMemo } from "react";
import { TOAST_DEFAULT_DURATION_MS } from "../constants";
import type { ToastAction, ToastState } from "../types";

interface ToastContextType {
  toast: ToastState | null;
  showToast: (message: string, duration?: number, action?: ToastAction) => void;
}

export const ToastContext = createContext<ToastContextType>({
  toast: null,
  showToast: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

/**
 * Hook to create a stable ToastContext value.
 * Call this in the provider component, pass the result to ToastContext.Provider.
 */
export function useToastProvider() {
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback((message: string, duration = TOAST_DEFAULT_DURATION_MS, action?: ToastAction) => {
    setToast({ message, action });
    setTimeout(() => setToast(null), duration);
  }, []);

  const value = useMemo(() => ({
    toast,
    showToast,
  }), [toast, showToast]);

  return value;
}
