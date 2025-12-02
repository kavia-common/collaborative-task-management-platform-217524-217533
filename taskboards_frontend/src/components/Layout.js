import React from "react";
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
  const { wsStatus } = useDemo();

  return (
    <div style={{ background: theme.colors.background, minHeight: "100vh", color: theme.colors.text }}>
      <header style={styles.header}>
        <Link to="/" style={styles.brand}>
          <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: theme.colors.secondary }} />
          <span>TaskBoards</span>
        </Link>
        <nav style={styles.nav}>
          <Link to="/boards">Boards</Link>
          <Link to="/calendar">Calendar</Link>
          {isAuthenticated ? (
            <>
              <PresenceIndicator />
              <span style={{ color: theme.colors.subtleText }}>{user?.name}</span>
              <button style={styles.btn} onClick={logout}>Logout</button>
            </>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </nav>
      </header>
      {wsStatus !== "open" && (
        <div style={{ background: "#EFF6FF", color: "#1E3A8A", borderBottom: `1px solid ${theme.colors.border}`, padding: "6px 16px", fontSize: 12 }}>
          {wsStatus === "connecting" ? "Connecting to realtime..." : "Realtime disconnected. Retrying..."}
        </div>
      )}
      <main style={styles.container}>{children}</main>
    </div>
  );
}
