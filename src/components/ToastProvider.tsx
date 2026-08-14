"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";

type Tone = "success" | "error";
type Toast = { id: number; message: string; tone: Tone };

const ToastContext = createContext<(message: string, tone?: Tone) => void>(() => {});

export function useToast() {
  return useContext(ToastContext);
}

const TONES: Record<Tone, string> = {
  success: "border-green-500/30 bg-green-50 text-green-800 dark:bg-green-500/15 dark:text-green-200",
  error: "border-red-500/30 bg-red-50 text-red-800 dark:bg-red-500/15 dark:text-red-200",
};

// Lives in the root layout, so its state survives router.push() — that is what
// lets a "Item created" toast appear on the page you navigate TO.
export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const push = useCallback((message: string, tone: Tone = "success") => {
    const id = nextId.current++;
    setToasts((current) => [...current, { id, message, tone }]);
    setTimeout(() => {
      setToasts((current) => current.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={push}>
      {/* children are passed in from a Server Component, so they stay server
          components — this wrapper does not drag them across the boundary. */}
      {children}

      {/* aria-live announces new toasts without moving focus. */}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col items-end gap-2 sm:left-auto sm:right-6"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto w-full max-w-sm rounded-lg border px-4 py-3 text-sm font-medium shadow-lg ${TONES[toast.tone]}`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
