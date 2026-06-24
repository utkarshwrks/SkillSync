import React, { createContext, useCallback, useContext, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Icon from "./Icon";

const ToastContext = createContext(null);

const TONES = {
  success: { icon: "verify", cls: "border-emerald-400/25 text-emerald-300" },
  error: { icon: "bolt", cls: "border-red-400/25 text-red-300" },
  info: { icon: "insights", cls: "border-[#2563EB]/30 text-[#93C5FD]" },
};

let idSeq = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const toast = useCallback((message, tone = "info", ttl = 3500) => {
    const id = ++idSeq;
    setToasts((t) => [...t, { id, message, tone }]);
    if (ttl) setTimeout(() => dismiss(id), ttl);
    return id;
  }, [dismiss]);

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[80] flex w-full max-w-sm flex-col gap-2.5">
        <AnimatePresence>
          {toasts.map((t) => {
            const tone = TONES[t.tone] || TONES.info;
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, x: 40, scale: 0.96 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40, scale: 0.96 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className={`panel pointer-events-auto flex items-start gap-3 border p-3.5 pr-4 ${tone.cls}`}
              >
                <Icon name={tone.icon} className="mt-0.5 h-4 w-4 shrink-0" />
                <p className="flex-1 text-sm text-slate-200">{t.message}</p>
                <button onClick={() => dismiss(t.id)} className="text-slate-500 hover:text-white" aria-label="Dismiss">✕</button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  // No-op fallback so components never crash if used outside the provider.
  return ctx || { toast: () => {}, dismiss: () => {} };
}
