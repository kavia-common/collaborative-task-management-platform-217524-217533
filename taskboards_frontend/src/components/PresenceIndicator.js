import React from "react";
import { usePresence } from "../contexts/PresenceContext";
import { theme } from "../theme";

/**
 * PresenceIndicator shows number of online users from PresenceContext.
 */
export default function PresenceIndicator() {
  const { onlineUsers } = usePresence();
  const count = onlineUsers?.length || 0;

  return (
    <div title={`${count} online`} style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div
        aria-hidden="true"
        style={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: count > 0 ? theme.colors.success : theme.colors.error
        }}
      />
      <span style={{ fontSize: 12, color: theme.colors.subtleText }}>{count} online</span>
    </div>
  );
}
