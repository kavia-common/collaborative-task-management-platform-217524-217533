import React, { createContext, useCallback, useContext, useMemo, useState, useEffect } from "react";
import { theme } from "../theme";

const NotificationsContext = createContext(null);

// PUBLIC_INTERFACE
export function useNotifications() {
  /** Access notifications API (push, remove, clear) and state (toasts). */
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationsProvider");
  return ctx;
}

// Simple ID generator
let __id = 0;
function genId() {
  __id += 1;
  return `n-${Date.now()}-${__id}`;
}

// PUBLIC_INTERFACE
export function NotificationsProvider({ children }) {
  /**
   * Provides toast-style notifications for API errors and WS disconnects.
   * API:
   *  - push({ type: 'info'|'error'|'success'|'warning', title, message, timeoutMs? })
   *  - remove(id)
   *  - clear()
   */
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clear = useCallback(() => setToasts([]), []);

  const push = useCallback((toast) => {
    const id = genId();
    const t = { id, type: toast.type || "info", title: toast.title || "", message: toast.message || "", timeoutMs: toast.timeoutMs ?? 5000 };
    setToasts((prev) => [...prev, t]);
    if (t.timeoutMs > 0) {
      setTimeout(() => remove(id), t.timeoutMs);
    }
    return id;
  }, [remove]);

  // Subscribe to global notification bus (index.js dispatches tb:notify)
  useEffect(() => {
    const handler = (e) => {
      const d = e.detail || {};
      push({ type: d.type || "info", title: d.title, message: d.message, timeoutMs: d.timeoutMs });
    };
    window.addEventListener("tb:notify", handler);
    return () => window.removeEventListener("tb:notify", handler);
  }, [push]);

  const value = useMemo(() => ({ toasts, push, remove, clear }), [toasts, push, remove, clear]);

  return (
    <NotificationsContext.Provider value={value}>
      {children}
      {/* Toast container */}
      <div
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: "fixed",
          right: 16,
          bottom: 16,
          display: "grid",
          gap: 8,
          zIndex: 1000,
        }}
      >
        {toasts.map((t) => {
          const bg = t.type === "error" ? "#FEE2E2" : t.type === "success" ? "#D1FAE5" : t.type === "warning" ? "#FEF3C7" : theme.colors.surface;
          const border = t.type === "error" ? "#FCA5A5" : t.type === "success" ? "#A7F3D0" : t.type === "warning" ? "#FDE68A" : theme.colors.border;
          const titleColor = t.type === "error" ? theme.colors.error : t.type === "success" ? theme.colors.success : t.type === "warning" ? "#92400E" : theme.colors.primary;
          return (
            <div key={t.id} role="status" style={{ background: bg, color: theme.colors.text, border: `1px solid ${border}`, borderRadius: theme.radius.md, boxShadow: `0 4px 12px ${theme.colors.shadow}`, padding: 12, minWidth: 280 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <strong style={{ color: titleColor }}>{t.title || (t.type === "error" ? "Error" : "Notice")}</strong>
                <button aria-label="Dismiss notification" onClick={() => remove(t.id)} style={{ background: "transparent", border: "none", color: theme.colors.subtleText, cursor: "pointer" }}>✕</button>
              </div>
              {t.message && <div style={{ marginTop: 6, fontSize: 13 }}>{t.message}</div>}
            </div>
          );
        })}
      </div>
    </NotificationsContext.Provider>
  );
}
