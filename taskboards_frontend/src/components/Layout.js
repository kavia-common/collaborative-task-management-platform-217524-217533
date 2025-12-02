import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { theme } from "../theme";
import { useAuth } from "../contexts/AuthContext";
import PresenceIndicator from "./PresenceIndicator";
import { useDemo } from "../contexts/DemoContext";
import { useNotifications } from "../contexts/NotificationsContext";

const styles = {
  header: {
    background: theme.colors.surface,
    borderBottom: `1px solid ${theme.colors.border}`,
    padding: `${theme.spacing(1)} ${theme.spacing(2)}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    color: theme.colors.primary,
    textDecoration: "none",
    fontWeight: 700,
    letterSpacing: "0.2px"
  },
  nav: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2),
  },
  btn: {
    background: theme.colors.primary,
    color: "#fff",
    border: "none",
    padding: "10px 14px",
    borderRadius: theme.radius.sm,
    boxShadow: `0 1px 2px ${theme.colors.shadow}`,
    cursor: "pointer",
    outlineOffset: 2,
  },
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: theme.spacing(2)
  },
  footer: {
    marginTop: 32,
    borderTop: `1px solid ${theme.colors.border}`,
    color: theme.colors.subtleText,
    background: theme.colors.surface,
  }
};

export default function Layout({ children }) {
  const { user, isAuthenticated, logout } = useAuth();
  const { wsStatus, backendReady } = useDemo();
  const [showChecklist, setShowChecklist] = useState(false);
  const [checklistStatus, setChecklistStatus] = useState(null);
  const [devHover, setDevHover] = useState(false);
  const { push } = useNotifications();

  const wsAnnounce = useMemo(
    () => (wsStatus === "connecting" ? "Connecting to realtime..." : "Realtime disconnected. Retrying..."),
    [wsStatus]
  );

  // Pull backend /status to feed the checklist
  useEffect(() => {
    let abort = false;
    async function fetchStatus() {
      try {
        const base = process.env.REACT_APP_API_BASE_URL || "";
        if (!base) return;
        const res = await fetch(`${base}/status`, { credentials: "include" });
        const json = await res.json().catch(() => ({}));
        if (!abort) setChecklistStatus(json);
      } catch {
        if (!abort) setChecklistStatus(null);
      }
    }
    fetchStatus();
  }, []);

  // Notify on WS disconnects
  useEffect(() => {
    if (wsStatus === "closed") {
      push({
        type: "warning",
        title: "Realtime disconnected",
        message: "WebSocket connection lost. We will retry automatically.",
        timeoutMs: 4000
      });
    } else if (wsStatus === "connecting") {
      push({
        type: "info",
        title: "Connecting…",
        message: "Attempting to connect to realtime service.",
        timeoutMs: 2500
      });
    }
  }, [wsStatus, push]);

  // Keyboard focus styles
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      :focus-visible {
        outline: 2px solid ${theme.colors.secondary};
        outline-offset: 2px;
      }
    `;
    document.head.appendChild(style);
    return () => { try { document.head.removeChild(style); } catch {} };
  }, []);

  // Derived checklist items from backend status
  const checklistItems = useMemo(() => {
    const s = checklistStatus || {};
    const corsArr = Array.isArray(s.cors_origins) ? s.cors_origins : [];
    const corsOk = (() => {
      try {
        const current = window.location.origin;
        if (!corsArr.length) return false;
        return corsArr.includes("*") || corsArr.includes(current);
      } catch {
        return false;
      }
    })();
    return [
      { key: "db", label: "Database configured", ok: !!s.db_configured || !!s.dbConfigured },
      { key: "secret", label: "Secret key configured", ok: !!s.secret_key_configured || !!s.secretConfigured },
      { key: "cors", label: "CORS allows this frontend origin", ok: corsOk }
    ];
  }, [checklistStatus]);

  return (
    <div style={{ background: theme.colors.background, minHeight: "100vh", color: theme.colors.text }}>
      <header style={styles.header} role="banner" aria-label="Application header">
        <Link to="/" style={styles.brand} aria-label="TaskBoards home">
          <span aria-hidden="true" style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: theme.colors.secondary }} />
          <span>TaskBoards</span>
        </Link>
        <nav style={styles.nav} aria-label="Primary">
          <Link to="/boards" aria-label="Boards page">Boards</Link>
          <Link to="/calendar" aria-label="Calendar page">Calendar</Link>
          {isAuthenticated ? (
            <>
              <PresenceIndicator />
              <span style={{ color: theme.colors.subtleText }} aria-live="polite">{user?.name}</span>
              <button style={styles.btn} onClick={logout} aria-label="Logout">Logout</button>
            </>
          ) : (
            <Link to="/login" aria-label="Login page">Login</Link>
          )}
        </nav>
      </header>

      {!backendReady && (
        <div
          role="region"
          aria-label="Onboarding notice"
          style={{ background: "#FFF7ED", color: "#7C2D12", borderBottom: `1px solid ${theme.colors.border}`, padding: "8px 16px", display: "flex", gap: 12, alignItems: "center", justifyContent: "space-between" }}
        >
          <div>
            Backend not fully configured. You can use Demo mode, or follow the database setup guide.{" "}
            <a href="../taskboards_backend/SETUP_DB.md" target="_blank" rel="noreferrer">Open SETUP_DB.md</a>
          </div>
          <button
            onClick={() => setShowChecklist(true)}
            style={{ background: theme.colors.primary, color: "#fff", border: "none", padding: "6px 10px", borderRadius: theme.radius.sm }}
            aria-label="Open setup checklist"
          >
            Setup Checklist
          </button>
        </div>
      )}

      {wsStatus !== "open" && (
        <div
          role="status"
          aria-live="polite"
          style={{ background: "#EFF6FF", color: "#1E3A8A", borderBottom: `1px solid ${theme.colors.border}`, padding: "6px 16px", fontSize: 12 }}
        >
          {wsAnnounce}
        </div>
      )}

      <main role="main" style={styles.container}>{children}</main>

      <footer role="contentinfo" style={styles.footer}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span>TaskBoards • Ocean Professional</span>
          <button
            onMouseEnter={() => setDevHover(true)}
            onMouseLeave={() => setDevHover(false)}
            onClick={() => window.dispatchEvent(new CustomEvent("tb:toggle-diagnostics", { detail: "toggle" }))}
            aria-label="Toggle developer diagnostics"
            style={{ background: "transparent", border: `1px solid ${theme.colors.border}`, borderRadius: theme.radius.sm, padding: "6px 10px", cursor: "pointer", color: theme.colors.subtleText }}
          >
            Developer
            {devHover && <span style={{ marginLeft: 6, fontSize: 12 }}>(status, WS, env)</span>}
          </button>
        </div>
      </footer>

      {showChecklist && (
        <>
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Environment setup checklist"
            style={{
              position: "fixed",
              top: "10%",
              left: "50%",
              transform: "translateX(-50%)",
              width: "min(560px, 92vw)",
              background: theme.colors.surface,
              color: theme.colors.text,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: theme.radius.md,
              boxShadow: `0 10px 24px ${theme.colors.shadow}`,
              padding: 16,
              zIndex: 50
            }}
          >
            <h3 style={{ marginTop: 0, color: theme.colors.primary }}>Setup Checklist</h3>
            <ul style={{ paddingLeft: 18, lineHeight: 1.6 }}>
              {checklistItems.map((it) => (
                <li key={it.key} aria-checked={it.ok} role="checkbox" style={{ listStyle: "none", display: "flex", alignItems: "center", gap: 8 }}>
                  <span aria-hidden="true" style={{ width: 16, height: 16, borderRadius: 999, background: it.ok ? "#D1FAE5" : "#FEE2E2", border: `1px solid ${it.ok ? "#A7F3D0" : "#FCA5A5"}` }} />
                  <span>{it.label}</span>
                </li>
              ))}
            </ul>
            <div style={{ fontSize: 12, color: theme.colors.subtleText, marginBottom: 8 }}>
              Tip: Ensure backend CORS includes this origin: {typeof window !== "undefined" ? window.location.origin : ""}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
              <a href="../taskboards_backend/SETUP_DB.md" target="_blank" rel="noreferrer"
                 style={{ background: theme.colors.secondary, color: "#111", padding: "8px 12px", borderRadius: theme.radius.sm, textDecoration: "none" }}>
                Open DB Guide
              </a>
              <div style={{ display: "flex", gap: 8 }}>
                <a href={(process.env.REACT_APP_API_BASE_URL || "") + "/status"} target="_blank" rel="noreferrer"
                   style={{ background: theme.colors.surface, border: `1px solid ${theme.colors.border}`, padding: "8px 12px", borderRadius: theme.radius.sm, textDecoration: "none", color: theme.colors.primary }}>
                  View /status
                </a>
                <button onClick={() => setShowChecklist(false)} style={{ background: theme.colors.primary, color: "#fff", border: "none", padding: "8px 12px", borderRadius: theme.radius.sm }}>
                  Close
                </button>
              </div>
            </div>
          </div>
          <div
            onClick={() => setShowChecklist(false)}
            aria-hidden="true"
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 40 }}
          />
        </>
      )}
    </div>
  );
}
