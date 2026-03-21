import { createContext, useContext, useCallback, useState, useMemo } from "react";

interface ToastContextType {
  toast: string | null;
  showToast: (message: string, duration?: number) => void;
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
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((message: string, duration = 3000) => {
    setToast(message);
    setTimeout(() => setToast(null), duration);
  }, []);

  const value = useMemo(() => ({
    toast,
    showToast,
  }), [toast, showToast]);

  return value;
}
