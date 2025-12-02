import React from "react";
import { usePresence } from "../contexts/PresenceContext";
import { theme } from "../theme";

/**
 * PresenceIndicator shows number of online users from PresenceContext.
 */
export default function PresenceIndicator() {
  const { onlineUsers } = usePresence();
  const count = onlineUsers?.length || 0;

  const color = count > 0 ? theme.colors.success : theme.colors.subtleText;
  const label = count > 0 ? `${count} online` : "Offline";

  return (
    <div title={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div
        aria-hidden="true"
        style={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: color
        }}
      />
      <span style={{ fontSize: 12, color: theme.colors.subtleText }}>{label}</span>
    </div>
  );
}
