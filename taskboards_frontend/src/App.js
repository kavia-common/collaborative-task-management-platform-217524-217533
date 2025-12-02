import React, { Suspense, useMemo, useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Layout from "./components/Layout";
import Boards from "./pages/Boards";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import { PresenceProvider } from "./contexts/PresenceContext";
import { DemoProvider } from "./contexts/DemoContext";
import { NotificationsProvider } from "./contexts/NotificationsContext";
import { theme } from "./theme";

// Lazy imports must still be declared at top-level (not after other statements)
const CalendarPage = React.lazy(() => import("./pages/CalendarPage"));

// Simple developer diagnostics modal component (inline to keep footprint small)
function DevDiagnostics({ open, onClose }) {
  const [status, setStatus] = useState(null);
  const [wsUrl, setWsUrl] = useState(process.env.REACT_APP_WS_URL || "");
  const [apiBase, setApiBase] = useState(process.env.REACT_APP_API_BASE_URL || "");
  const [envs, setEnvs] = useState({});

  useEffect(() => {
    setEnvs({
      REACT_APP_API_BASE_URL: process.env.REACT_APP_API_BASE_URL || "",
      REACT_APP_WS_URL: process.env.REACT_APP_WS_URL || "",
      REACT_APP_NODE_ENV: process.env.REACT_APP_NODE_ENV || "",
      REACT_APP_FEATURE_FLAGS: process.env.REACT_APP_FEATURE_FLAGS || "",
      REACT_APP_EXPERIMENTS_ENABLED: process.env.REACT_APP_EXPERIMENTS_ENABLED || "",
      REACT_APP_DATABASE_URL: process.env.REACT_APP_DATABASE_URL || "",
    });
  }, []);

  useEffect(() => {
    let abort = false;
    async function load() {
      if (!apiBase) return;
      try {
        const res = await fetch(`${apiBase}/status`, { credentials: "include" });
        const json = await res.json().catch(() => ({}));
        if (!abort) setStatus(json);
      } catch {
        if (!abort) setStatus(null);
      }
    }
    load();
    return () => { abort = true; };
  }, [apiBase]);

  if (!open) return null;
  return (
    <>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Developer diagnostics"
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          width: "min(520px, 92vw)",
          background: theme.colors.surface,
          border: `1px solid ${theme.colors.border}`,
          borderRadius: theme.radius.md,
          boxShadow: `0 10px 24px ${theme.colors.shadow}`,
          padding: 16,
          zIndex: 100,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <h3 style={{ margin: 0, color: theme.colors.primary }}>Diagnostics</h3>
          <button onClick={onClose} aria-label="Close diagnostics" style={{ background: theme.colors.primary, color: "#fff", border: "none", borderRadius: theme.radius.sm, padding: "6px 10px" }}>
            Close
          </button>
        </div>
        <div style={{ display: "grid", gap: 10, fontSize: 13 }}>
          <div><strong>Backend Status</strong></div>
          <pre style={{ margin: 0, background: "#F9FAFB", border: `1px solid ${theme.colors.border}`, borderRadius: theme.radius.sm, padding: 8, maxHeight: 180, overflow: "auto" }}>
{JSON.stringify(status || { note: apiBase ? "No response from /status" : "API base not set" }, null, 2)}
          </pre>
          <div style={{ display: "grid", gap: 6 }}>
            <strong>Envs in use</strong>
            <pre style={{ margin: 0, background: "#F9FAFB", border: `1px solid ${theme.colors.border}`, borderRadius: theme.radius.sm, padding: 8, maxHeight: 160, overflow: "auto" }}>
{JSON.stringify(envs, null, 2)}
            </pre>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <div>
              <label style={{ display: "block", fontWeight: 600 }}>API Base</label>
              <input value={apiBase} readOnly style={{ width: "100%", padding: 8, border: `1px solid ${theme.colors.border}`, borderRadius: theme.radius.sm }} />
            </div>
            <div>
              <label style={{ display: "block", fontWeight: 600 }}>WS URL</label>
              <input value={wsUrl} readOnly style={{ width: "100%", padding: 8, border: `1px solid ${theme.colors.border}`, borderRadius: theme.radius.sm }} />
            </div>
          </div>
        </div>
      </div>
      <div aria-hidden="true" onClick={onClose} style={{ position: "fixed", inset: 0, background: "transparent", zIndex: 90 }} />
    </>
  );
}

// PUBLIC_INTERFACE
function App() {
  /**
   * App root with providers and router.
   * Adds:
   *  - NotificationsProvider (centralized toasts)
   *  - Lazy-loaded Calendar page
   *  - Developer diagnostics toggle in Layout footer via a custom event
   */
  const [devOpen, setDevOpen] = useState(false);

  // Simple event channel so Layout footer can open diagnostics
  useEffect(() => {
    const handler = (e) => {
      if (e?.detail === "toggle") setDevOpen((v) => !v);
      else setDevOpen(true);
    };
    window.addEventListener("tb:toggle-diagnostics", handler);
    return () => window.removeEventListener("tb:toggle-diagnostics", handler);
  }, []);

  return (
    <AuthProvider>
      <NotificationsProvider>
        <DemoProvider>
          <PresenceProvider>
            <BrowserRouter>
              <Layout>
                <Routes>
                  <Route path="/" element={<div role="region" aria-label="Welcome" style={{ padding: 12 }}>Welcome to TaskBoards. Use the navigation to access Boards and Calendar.</div>} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/boards" element={<ProtectedRoute><Boards /></ProtectedRoute>} />
                  <Route path="/calendar" element={
                    <ProtectedRoute>
                      <Suspense fallback={<div style={{ padding: 16 }}>Loading calendar…</div>}>
                        <CalendarPage />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                </Routes>
              </Layout>
              <DevDiagnostics open={devOpen} onClose={() => setDevOpen(false)} />
            </BrowserRouter>
          </PresenceProvider>
        </DemoProvider>
      </NotificationsProvider>
    </AuthProvider>
  );
}

export default App;
