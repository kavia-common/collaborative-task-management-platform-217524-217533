import ReconnectingWebSocket from "reconnecting-websocket";

/**
 * WebSocket client for realtime updates/presence.
 * Uses REACT_APP_WS_URL as base, optional token appended as query param.
 */

// PUBLIC_INTERFACE
export function createWSClient({ endpoint = "/realtime", token } = {}) {
  const base = process.env.REACT_APP_WS_URL || "";
  const url = new URL(base);
  // Ensure endpoint is applied if base is root or doesn't match
  if (endpoint && url.pathname !== endpoint) {
    url.pathname = endpoint;
  }
  if (token) url.searchParams.set("token", token);

  const rws = new ReconnectingWebSocket(url.toString(), [], {
    maxReconnectionDelay: 5000,
    minReconnectionDelay: 500,
    reconnectionDelayGrowFactor: 1.5,
  });

  return rws;
}
