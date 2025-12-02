import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { createWSClient } from "../services/ws";
import { useAuth } from "./AuthContext";
import { useDemo } from "./../contexts/DemoContext";

const PresenceContext = createContext(null);

// PUBLIC_INTERFACE
export function usePresence() {
  /** Hook to access presence info */
  const ctx = useContext(PresenceContext);
  if (!ctx) throw new Error("usePresence must be used within PresenceProvider");
  return ctx;
}

// PUBLIC_INTERFACE
export function PresenceProvider({ children }) {
  /**
   * Maintains a set of online users and last activity via websocket messages.
   * Expected server messages:
   * { type: "presence", users: [{id, name}] }
   * { type: "cursor", userId, x, y }
   */
  const { token, user } = useAuth();
  const { setWsStatus } = useDemo();
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [cursors, setCursors] = useState({});
  const wsRef = useRef(null);

  useEffect(() => {
    if (!token) {
      setWsStatus("closed");
      return;
    }
    const ws = createWSClient({ endpoint: "/ws", token });
    wsRef.current = ws;

    ws.onopen = () => {
      setWsStatus("open");
      try {
        ws.send(JSON.stringify({ type: "join", user }));
      } catch {
        // ignore
      }
    };
    ws.onclose = () => {
      setWsStatus("closed");
    };
    ws.onerror = () => {
      setWsStatus("closed");
    };
    ws.onconnecting = () => {
      setWsStatus("connecting");
    };
    ws.onmessage = (evt) => {
      try {
        const msg = JSON.parse(evt.data);
        if (msg.type === "presence") {
          setOnlineUsers(msg.users || []);
        } else if (msg.type === "cursor") {
          setCursors((prev) => ({ ...prev, [msg.userId]: { x: msg.x, y: msg.y, t: Date.now() } }));
        }
      } catch {
        // ignore malformed
      }
    };
    return () => {
      try { ws.close(); } catch {}
    };
  }, [token, user, setWsStatus]);

  const value = useMemo(() => ({ onlineUsers, cursors }), [onlineUsers, cursors]);
  return <PresenceContext.Provider value={value}>{children}</PresenceContext.Provider>;
}
