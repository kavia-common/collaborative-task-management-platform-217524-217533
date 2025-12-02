import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { theme } from "../theme";
import { useAuth } from "../contexts/AuthContext";
import PresenceIndicator from "./PresenceIndicator";
import { useDemo } from "../contexts/DemoContext";

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
    cursor: "pointer"
  },
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: theme.spacing(2)
  }
};

export default function Layout({ children }) {
  const { user, isAuthenticated, logout } = useAuth();
  const { wsStatus, backendReady } = useDemo();
  const [showChecklist, setShowChecklist] = useState(false);

  const wsAnnounce = useMemo(
    () => (wsStatus === "connecting" ? "Connecting to realtime..." : "Realtime disconnected. Retrying..."),
    [wsStatus]
  );

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
            Backend not fully configured. You can use Demo mode, or follow the database setup guide.
            {" "}
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
            <ol style={{ paddingLeft: 18, lineHeight: 1.6 }}>
              <li>Frontend: copy .env.example to .env and set REACT_APP_API_BASE_URL and REACT_APP_WS_URL.</li>
              <li>Use demo mode to explore without a DB: set REACT_APP_DEMO_MODE=true and run npm start.</li>
              <li>Backend: configure DB connection and SECRET_KEY. See <a href="../taskboards_backend/SETUP_DB.md" target="_blank" rel="noreferrer">SETUP_DB.md</a>.</li>
              <li>Verify backend /status shows dbConfigured=true and secretConfigured=true.</li>
              <li>Ensure CORS allows this frontend origin (comma-separated list in backend env).</li>
            </ol>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <a href="../taskboards_backend/SETUP_DB.md" target="_blank" rel="noreferrer"
                 style={{ background: theme.colors.secondary, color: "#111", padding: "8px 12px", borderRadius: theme.radius.sm, textDecoration: "none" }}>
                Open DB Guide
              </a>
              <button onClick={() => setShowChecklist(false)} style={{ background: theme.colors.primary, color: "#fff", border: "none", padding: "8px 12px", borderRadius: theme.radius.sm }}>
                Close
              </button>
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
