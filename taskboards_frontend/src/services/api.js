/**
 * API client for TaskBoards frontend.
 * Uses REACT_APP_API_BASE_URL from environment.
 * Adds graceful handling for 503 responses to enable demo mode fallbacks.
 */

const API_BASE = process.env.REACT_APP_API_BASE_URL;

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

// PUBLIC_INTERFACE
export async function apiGet(path, { token } = {}) {
  /** Fetch helper for GET requests */
  const res = await fetch(`${API_BASE}${path}`, {
    method: "GET",
    headers: buildHeaders(token),
    credentials: "include",
  });
  if (!res.ok) return handleError(path, "GET", res);
  return res.json();
}

// PUBLIC_INTERFACE
export async function apiPost(path, body, { token } = {}) {
  /** Fetch helper for POST requests */
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: buildHeaders(token),
    body: JSON.stringify(body),
    credentials: "include",
  });
  if (!res.ok) return handleError(path, "POST", res);
  return res.json();
}

// PUBLIC_INTERFACE
export async function apiPut(path, body, { token } = {}) {
  /** Fetch helper for PUT requests */
  const res = await fetch(`${API_BASE}${path}`, {
    method: "PUT",
    headers: buildHeaders(token),
    body: JSON.stringify(body),
    credentials: "include",
  });
  if (!res.ok) return handleError(path, "PUT", res);
  return res.json();
}

// PUBLIC_INTERFACE
export async function apiDelete(path, { token } = {}) {
  /** Fetch helper for DELETE requests */
  const res = await fetch(`${API_BASE}${path}`, {
    method: "DELETE",
    headers: buildHeaders(token),
    credentials: "include",
  });
  if (!res.ok) return handleError(path, "DELETE", res);
  // Some DELETEs may have no content
  try {
    return await res.json();
  } catch {
    return {};
  }
}
