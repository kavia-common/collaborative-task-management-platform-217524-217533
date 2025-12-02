/**
 * API client for TaskBoards frontend.
 * Uses REACT_APP_API_BASE_URL from environment.
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

// PUBLIC_INTERFACE
export async function apiGet(path, { token } = {}) {
  /** Fetch helper for GET requests */
  const res = await fetch(`${API_BASE}${path}`, {
    method: "GET",
    headers: buildHeaders(token),
    credentials: "include",
  });
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
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
  if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`);
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
  if (!res.ok) throw new Error(`PUT ${path} failed: ${res.status}`);
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
  if (!res.ok) throw new Error(`DELETE ${path} failed: ${res.status}`);
  return res.json();
}
