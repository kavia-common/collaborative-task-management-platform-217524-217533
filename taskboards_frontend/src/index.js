import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { __wireNotifier } from "./services/api";
import { theme } from "./theme";

// Setup a minimal notifier bridge using CustomEvent to call NotificationsContext (available after mount)
function bridgeNotifier(op, res, err) {
  const detail = { op, status: res?.status, error: err ? String(err.message || err) : undefined };
  window.dispatchEvent(new CustomEvent("tb:api-error", { detail }));
}
__wireNotifier(bridgeNotifier);

// Listen in App tree to push actual toasts from NotificationsContext
function setupListener() {
  function handler(e) {
    const detail = e.detail || {};
    const title = "API Error";
    let message = detail.op || "Request failed";
    if (detail.status) message += ` (HTTP ${detail.status})`;
    if (detail.error && !String(detail.error).includes(String(detail.status || ""))) {
      message += `: ${detail.error}`;
    }
    // Broadcast another event for NotificationsProvider consumer (avoid import cycles)
    window.dispatchEvent(new CustomEvent("tb:notify", { detail: { type: "error", title, message, timeoutMs: 5000 } }));
  }
  window.addEventListener("tb:api-error", handler);
  return () => window.removeEventListener("tb:api-error", handler);
}
setupListener();

// NotificationsProvider subscribes to tb:notify in its effect (wired in App)

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
