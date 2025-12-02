/**
 * API client for TaskBoards frontend.
 * Uses REACT_APP_API_BASE_URL from environment.
 * Adds graceful handling for 503 responses to enable demo mode fallbacks.
 * Emits notifications for API failures.
 */

import { useNotifications } from "../contexts/NotificationsContext";

const ENV_API = process.env.REACT_APP_API_BASE_URL;

/**
 * PUBLIC_INTERFACE
 * getApiBase
 * Determine the API base URL:
 *  - Prefer REACT_APP_API_BASE_URL if set
 *  - Otherwise, derive from window.location.origin by swapping :3000 -> :3001
 *  - If not on :3000, still try same origin (useful for deployments sharing host)
 */
export function getApiBase() {
  /** Resolve API base URL used by the app and diagnostics. */
  try {
    if (ENV_API) return ENV_API.replace(/\/+$/, "");
    const origin = window.location.origin;
    if (origin.includes(":3000")) {
      return origin.replace(":3000", ":3001");
    }
    return origin;
  } catch {
    return ENV_API || "";
  }
}

const API_BASE = getApiBase();

/** Build default headers including optional auth token */
function buildHeaders(token) {
  const headers = {
    "Content-Type": "application/json",
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

function handleError(path, method, res) {
  // Throw with explicit status code to allow demo fallback logic to detect 503
  throw new Error(`${method} ${path} failed: ${res.status}`);
}

// Internal hook to get notifier in hook-enabled contexts.
// For non-hook usage, errors still throw and can be caught by callers.
let notify;
export function __wireNotifier(fn) {
  notify = fn;
}

// PUBLIC_INTERFACE
export async function apiGet(path, { token } = {}) {
  /** Fetch helper for GET requests */
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "GET",
      headers: buildHeaders(token),
      credentials: "include",
    });
    if (!res.ok) {
      if (notify) notify(`GET ${path}`, res);
      return handleError(path, "GET", res);
    }
    return res.json();
  } catch (e) {
    if (notify) notify(`GET ${path}`, null, e);
    throw e;
  }
}

// PUBLIC_INTERFACE
export async function apiPost(path, body, { token } = {}) {
  /** Fetch helper for POST requests */
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: buildHeaders(token),
      body: JSON.stringify(body),
      credentials: "include",
    });
    if (!res.ok) {
      if (notify) notify(`POST ${path}`, res);
      return handleError(path, "POST", res);
    }
    return res.json();
  } catch (e) {
    if (notify) notify(`POST ${path}`, null, e);
    throw e;
  }
}

// PUBLIC_INTERFACE
export async function apiPut(path, body, { token } = {}) {
  /** Fetch helper for PUT requests */
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "PUT",
      headers: buildHeaders(token),
      body: JSON.stringify(body),
      credentials: "include",
    });
    if (!res.ok) {
      if (notify) notify(`PUT ${path}`, res);
      return handleError(path, "PUT", res);
    }
    return res.json();
  } catch (e) {
    if (notify) notify(`PUT ${path}`, null, e);
    throw e;
  }
}

// PUBLIC_INTERFACE
export async function apiDelete(path, { token } = {}) {
  /** Fetch helper for DELETE requests */
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "DELETE",
      headers: buildHeaders(token),
      credentials: "include",
    });
    if (!res.ok) {
      if (notify) notify(`DELETE ${path}`, res);
      return handleError(path, "DELETE", res);
    }
    try {
      return await res.json();
    } catch {
      return {};
    }
  } catch (e) {
    if (notify) notify(`DELETE ${path}`, null, e);
    throw e;
  }
}
