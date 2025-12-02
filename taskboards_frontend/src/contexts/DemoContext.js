import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { theme } from "../theme";

// PUBLIC_INTERFACE
export function useDemo() {
  /** Access demo mode context */
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error("useDemo must be used within DemoProvider");
  return ctx;
}

const DemoContext = createContext(null);

// Some lightweight in-memory mock data to explore the UI
const initialMockTasks = [
  { id: "m1", title: "Draft onboarding flow", status: "Backlog", priority: "High", tags: ["feature"], assignee: { name: "Alice" }, dueDate: "2025-12-03" },
  { id: "m2", title: "Implement column reorder", status: "In Progress", priority: "Medium", tags: ["frontend"], assignee: { name: "Bob" }, dueDate: "2025-12-08" },
  { id: "m3", title: "Set up CI workflow", status: "Review", priority: "Low", tags: ["ops"], assignee: { name: "Charlie" }, dueDate: "2025-12-10" },
  { id: "m4", title: "Polish calendar styling", status: "Done", priority: "Medium", tags: ["frontend", "feature"], assignee: { name: "Dana" }, dueDate: "2025-12-06" },
  { id: "m5", title: "Bug bash", status: "Backlog", priority: "Urgent", tags: ["bug"], assignee: { name: "Alice" }, dueDate: "2025-12-15" }
];

function getEnvDemoMode() {
  try {
    return String(process.env.REACT_APP_DEMO_MODE || "").toLowerCase() === "true";
  } catch {
    return false;
  }
}

// PUBLIC_INTERFACE
export function DemoProvider({ children }) {
  /**
   * Provides:
   * - demoMode: boolean (REACT_APP_DEMO_MODE=true or backend returns 503)
   * - backendReady: boolean (status endpoint ok)
   * - wsStatus: 'connecting' | 'open' | 'closed'
   * - mockTasks: in-memory tasks for demo mode
   * - setMockTasks: setter
   * - withDemoFallback: wraps a promise; on 503 switches to demo mode and returns mock
   * - disableMutations: true in demo
   */
  const [demoMode, setDemoMode] = useState(getEnvDemoMode());
  const [backendReady, setBackendReady] = useState(!demoMode);
  const [wsStatus, setWsStatus] = useState("connecting");
  const [mockTasks, setMockTasks] = useState(initialMockTasks);
  const [dbConfigured, setDbConfigured] = useState(null);
  const [statusDetails, setStatusDetails] = useState(null);

  // Check backend status when not forced demo
  useEffect(() => {
    let cancelled = false;
    async function check() {
      if (demoMode) {
        setBackendReady(false);
        setDbConfigured(false);
        return;
      }
      const base = process.env.REACT_APP_API_BASE_URL || "";
      try {
        const res = await fetch(`${base}/status`, { credentials: "include" });
        if (!cancelled) {
          if (res.status === 503) {
            setBackendReady(false);
            setDbConfigured(false);
            setDemoMode(true);
          } else {
            const ok = res.ok;
            setBackendReady(ok);
            try {
              const json = await res.json();
              setStatusDetails(json || null);
              if (typeof json?.dbConfigured === "boolean") {
                setDbConfigured(json.dbConfigured);
              }
            } catch {
              // ignore parse
            }
          }
        }
      } catch {
        if (!cancelled) {
          setBackendReady(false);
          // leave demoMode as-is unless forced by env; do not force demo here
        }
      }
    }
    check();
    const id = setInterval(check, 15000);
    return () => { cancelled = true; clearInterval(id); };
  }, [demoMode]);

  const disableMutations = demoMode;

  // PUBLIC_INTERFACE
  const withDemoFallback = async (promise, { fallback } = {}) => {
    /**
     * Wrap API calls; if it throws with a 503-like message, switch to demoMode and return fallback.
     * If demoMode is already on, return fallback immediately.
     */
    if (demoMode) {
      return typeof fallback === "function" ? fallback(mockTasks) : fallback;
    }
    try {
      return await promise;
    } catch (e) {
      const message = (e && e.message) || "";
      if (message.includes("503")) {
        setDemoMode(true);
        setBackendReady(false);
        return typeof fallback === "function" ? fallback(mockTasks) : fallback;
      }
      throw e;
    }
  };

  const value = useMemo(() => ({
    demoMode,
    backendReady,
    wsStatus,
    setWsStatus,
    mockTasks,
    setMockTasks,
    withDemoFallback,
    disableMutations
  }), [demoMode, backendReady, wsStatus, mockTasks, withDemoFallback, disableMutations]);

  return (
    <DemoContext.Provider value={value}>
      {demoMode && (
        <div
          role="status"
          aria-live="polite"
          style={{
            background: theme.colors.secondary,
            color: "#111",
            padding: "8px 16px",
            textAlign: "center",
            fontWeight: 600,
            borderBottom: `1px solid ${theme.colors.border}`
          }}
        >
          Demo mode (no DB configured)
        </div>
      )}
      {!backendReady && !demoMode && (
        <div
          role="status"
          aria-live="polite"
          style={{
            background: "#FFF7ED",
            color: "#7C2D12",
            padding: "8px 16px",
            textAlign: "center",
            fontWeight: 500,
            borderBottom: "1px solid #FED7AA"
          }}
        >
          Backend not ready. Some features may be unavailable.
        </div>
      )}
      {children}
    </DemoContext.Provider>
  );
}
