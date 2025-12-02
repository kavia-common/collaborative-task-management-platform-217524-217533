import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { theme } from "../theme";
import { useNotifications } from "../contexts/NotificationsContext";
import { useDemo } from "../contexts/DemoContext";
import { getApiBase } from "../services/api";

/**
 * DiagnosticsPanel
 * - Renders an accessible modal and runs sequential smoke checks against the backend.
 * - Checks:
 *    1) GET `${API_BASE}/` expecting 200 OK
 *    2) GET `${API_BASE}/status` expecting 200 JSON with required fields
 *    3) GET `${API_BASE}/api/projects` expecting 503 JSON when DB not configured
 * - Displays structured results, timestamps, and pass/fail indicators.
 * - Emits a toast summary via NotificationsContext.
 */
export default function DiagnosticsPanel({ open, onClose }) {
  const { push } = useNotifications();
  const { backendReady } = useDemo();
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState([]);
  const [startedAt, setStartedAt] = useState(null);
  const initialFocusRef = useRef(null);
  const panelRef = useRef(null);
  const lastActiveRef = useRef(null);

  const API_BASE = useMemo(() => getApiBase(), []);

  // Focus trap: capture last active, focus first element on open, restore on close
  useEffect(() => {
    if (open) {
      lastActiveRef.current = document.activeElement;
      // small timeout to ensure DOM present
      setTimeout(() => {
        try {
          initialFocusRef.current?.focus();
        } catch {}
      }, 0);
    } else {
      try {
        lastActiveRef.current?.focus();
      } catch {}
    }
  }, [open]);

  // Basic focus trap
  useEffect(() => {
    if (!open) return;
    function handleKey(e) {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose?.();
        return;
      }
      if (e.key !== "Tab") return;
      const focusable = panelRef.current
        ? Array.from(panelRef.current.querySelectorAll("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"))
        : [];
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  const addResult = (r) => {
    setResults((prev) => [...prev, r]);
  };

  const run = useCallback(async () => {
    if (!API_BASE) {
      push({
        type: "warning",
        title: "Diagnostics",
        message: "API base URL not configured. Set REACT_APP_API_BASE_URL or run backend on :3001.",
        timeoutMs: 5000,
      });
      return;
    }
    setRunning(true);
    setResults([]);
    setStartedAt(new Date());
    const now = () => new Date().toISOString();
    const requiredStatusFields = ["app_version", "db_configured", "secret_key_configured", "cors_origins", "websocket_origins", "uptime_seconds"];

    // Helper fetch util that never throws; always returns { ok, status, body/text, error }
    async function safeFetch(url, opts) {
      const start = Date.now();
      try {
        const res = await fetch(url, { credentials: "include", ...opts });
        const contentType = res.headers.get("content-type") || "";
        let body = null;
        let text = null;
        if (contentType.includes("application/json")) {
          try {
            body = await res.json();
          } catch {
            body = null;
          }
        } else {
          try {
            text = await res.text();
          } catch {
            text = null;
          }
        }
        return { ok: res.ok, status: res.status, body, text, durationMs: Date.now() - start };
      } catch (e) {
        return { ok: false, status: 0, error: String(e?.message || e), durationMs: Date.now() - start };
      }
    }

    // 1) GET / expecting 200
    {
      const url = `${API_BASE}/`;
      const res = await safeFetch(url, { method: "GET" });
      const pass = res.status === 200;
      addResult({
        check: "GET /",
        url,
        timestamp: now(),
        status: res.status,
        durationMs: res.durationMs,
        expected: "200 OK",
        pass,
        body: res.body ?? res.text ?? res.error ?? null,
      });
    }

    // 2) GET /status expecting 200 and fields
    let statusJson = null;
    {
      const url = `${API_BASE}/status`;
      const res = await safeFetch(url, { method: "GET" });
      let missing = [];
      if (res.body && typeof res.body === "object") {
        statusJson = res.body;
        missing = requiredStatusFields.filter((k) => !(k in res.body));
      }
      const pass = res.status === 200 && missing.length === 0;
      addResult({
        check: "GET /status",
        url,
        timestamp: now(),
        status: res.status,
        durationMs: res.durationMs,
        expected: `200 JSON with fields: ${requiredStatusFields.join(", ")}`,
        pass,
        body: res.body ?? res.text ?? res.error ?? null,
        notes: missing.length ? `Missing fields: ${missing.join(", ")}` : undefined,
      });
    }

    // 3) GET /api/projects expecting 503 when DB not configured; otherwise may be 401/200 depending on auth
    {
      const url = `${API_BASE}/api/projects`;
      const res = await safeFetch(url, { method: "GET" });
      // If backendReady is false or statusJson?.db_configured === false, we expect 503.
      const dbConfigured = statusJson ? !!statusJson.db_configured : backendReady;
      const expected = dbConfigured ? "200 or 401 (DB configured)" : "503 JSON (DB not configured)";
      let pass = false;
      if (!dbConfigured) {
        pass = res.status === 503;
      } else {
        pass = res.status === 200 || res.status === 401 || res.status === 403;
      }
      addResult({
        check: "GET /api/projects",
        url,
        timestamp: now(),
        status: res.status,
        durationMs: res.durationMs,
        expected,
        pass,
        body: res.body ?? res.text ?? res.error ?? null,
        notes: !dbConfigured ? "DB not configured: 503 expected behavior." : "DB configured: guarded route may require auth.",
      });
    }

    // Toast summary
    const passed = resultsAfterRun().filter((r) => r.pass).length;
    const total = resultsAfterRun().length;
    push({
      type: passed === total ? "success" : "warning",
      title: "Diagnostics complete",
      message: `Diagnostics passed (${passed}/${total} OK${total - passed > 0 ? `, ${total - passed} needs attention` : ""}).`,
      timeoutMs: 6000,
    });

    setRunning(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [API_BASE, backendReady, push]);

  // Helper to read latest results including freshly added in this tick
  const resultsAfterRun = () => {
    // Using functional setResults prevents immediate access, so we rely on closure updates + current state.
    // Consumers should use this getter right after run completes to compute summary.
    return results;
  };

  useEffect(() => {
    if (open) {
      // Auto-run on open
      run();
    }
  }, [open, run]);

  if (!open) return null;

  const startedLabel = startedAt ? startedAt.toLocaleString() : "";

  const passBadge = (ok) => (
    <span
      aria-label={ok ? "Passed" : "Failed"}
      style={{
        display: "inline-block",
        padding: "2px 8px",
        borderRadius: 999,
        background: ok ? "#D1FAE5" : "#FEE2E2",
        border: `1px solid ${ok ? "#A7F3D0" : "#FCA5A5"}`,
        fontSize: 12,
        fontWeight: 600,
        color: ok ? "#065F46" : "#991B1B",
      }}
    >
      {ok ? "PASS" : "FAIL"}
    </span>
  );

  return (
    <>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="diag-title"
        aria-describedby="diag-desc"
        ref={panelRef}
        style={{
          position: "fixed",
          top: "10%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "min(720px, 96vw)",
          background: theme.colors.surface,
          color: theme.colors.text,
          border: `1px solid ${theme.colors.border}`,
          borderRadius: theme.radius.md,
          boxShadow: `0 12px 28px ${theme.colors.shadow}`,
          padding: 16,
          zIndex: 1000,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <h3 id="diag-title" style={{ margin: 0, color: theme.colors.primary }}>Diagnostics</h3>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              ref={initialFocusRef}
              onClick={run}
              disabled={running}
              aria-label="Run diagnostics"
              style={{ background: theme.colors.primary, color: "#fff", border: "none", padding: "6px 10px", borderRadius: theme.radius.sm }}
            >
              {running ? "Running…" : "Run Diagnostics"}
            </button>
            <button
              onClick={onClose}
              aria-label="Close diagnostics"
              style={{ background: "transparent", border: `1px solid ${theme.colors.border}`, padding: "6px 10px", borderRadius: theme.radius.sm }}
            >
              Close
            </button>
          </div>
        </div>
        <p id="diag-desc" style={{ marginTop: 0, color: theme.colors.subtleText, fontSize: 13 }}>
          Run quick smoke checks against backend endpoints to verify base reachability, status, CORS, and guarded 503 behavior.
        </p>
        <div style={{ fontSize: 12, color: theme.colors.subtleText, marginBottom: 12 }}>
          API Base: <code>{API_BASE}</code> • Started: {startedLabel || "—"}
        </div>
        <div style={{ display: "grid", gap: 10 }}>
          {results.map((r, idx) => (
            <div key={`${r.check}-${idx}`} style={{ border: `1px solid ${theme.colors.border}`, borderRadius: theme.radius.sm, overflow: "hidden" }}>
              <div style={{ padding: 10, background: theme.colors.background, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "grid", gap: 4 }}>
                  <div style={{ fontWeight: 700, color: theme.colors.primary }}>{r.check}</div>
                  <div style={{ fontSize: 12, color: theme.colors.subtleText }}>
                    {r.url} • expected {r.expected} • status {r.status || 0} • {r.durationMs}ms • {r.timestamp}
                  </div>
                  {typeof r.notes === "string" && (
                    <div style={{ fontSize: 12, color: theme.colors.subtleText }}>Note: {r.notes}</div>
                  )}
                </div>
                {passBadge(r.pass)}
              </div>
              <pre
                aria-label="Response body"
                style={{
                  margin: 0,
                  padding: 10,
                  background: "#F9FAFB",
                  borderTop: `1px solid ${theme.colors.border}`,
                  maxHeight: 180,
                  overflow: "auto",
                  fontSize: 12,
                }}
              >
{pretty(r.body)}
              </pre>
            </div>
          ))}
          {results.length === 0 && (
            <div style={{ border: `1px dashed ${theme.colors.border}`, borderRadius: theme.radius.sm, padding: 16, color: theme.colors.subtleText }}>
              Results will appear here after running diagnostics.
            </div>
          )}
        </div>
      </div>
      <div
        aria-hidden="true"
        onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 900 }}
      />
    </>
  );
}

function pretty(val) {
  if (val == null) return "null";
  if (typeof val === "string") {
    // show only first ~4KB
    const s = val.length > 4096 ? val.slice(0, 4096) + "\n…(truncated)" : val;
    return s;
  }
  try {
    const json = JSON.stringify(val, null, 2);
    return json.length > 4096 ? json.slice(0, 4096) + "\n…(truncated)" : json;
  } catch {
    return String(val);
  }
}
