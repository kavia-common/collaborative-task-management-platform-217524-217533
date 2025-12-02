import React, { useMemo, useState } from "react";
import { theme } from "../theme";

/**
 * Filters Drawer for Kanban/Calendar.
 * Controlled internally; calls onChange with the current filters.
 */
export default function FiltersDrawer({ onChange, initial = {} }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState({
    assignee: initial.assignee || "",
    priority: initial.priority || "",
    tag: initial.tag || "",
    query: initial.query || ""
  });

  const options = useMemo(() => ({
    priorities: ["Low", "Medium", "High", "Urgent"],
    tags: ["frontend", "backend", "bug", "feature", "ops"],
    assignees: ["Alice", "Bob", "Charlie", "Dana"]
  }), []);

  const apply = () => {
    onChange?.(selected);
    setOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Open filters"
        style={{
          background: theme.colors.surface,
          border: `1px solid ${theme.colors.border}`,
          padding: "8px 12px",
          borderRadius: theme.radius.sm,
          boxShadow: `0 1px 2px ${theme.colors.shadow}`
        }}
      >
        Filters
      </button>
      {open && (
        <div style={{
          position: "fixed",
          top: 0, right: 0, bottom: 0,
          width: "320px",
          background: theme.colors.surface,
          borderLeft: `1px solid ${theme.colors.border}`,
          boxShadow: `-4px 0 12px ${theme.colors.shadow}`,
          padding: 16,
          zIndex: 20
        }}>
          <h3 style={{ marginTop: 0, color: theme.colors.primary }}>Filters</h3>
          <div style={{ display: "grid", gap: 12 }}>
            <input
              placeholder="Search..."
              aria-label="Search tasks"
              value={selected.query}
              onChange={(e) => setSelected(s => ({ ...s, query: e.target.value }))}
              style={{ padding: 8, border: `1px solid ${theme.colors.border}`, borderRadius: theme.radius.sm }}
            />
            <select
              aria-label="Filter by assignee"
              value={selected.assignee}
              onChange={(e) => setSelected(s => ({ ...s, assignee: e.target.value }))}
              style={{ padding: 8, border: `1px solid ${theme.colors.border}`, borderRadius: theme.radius.sm }}
            >
              <option value="">Assignee</option>
              {options.assignees.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
            <select
              aria-label="Filter by priority"
              value={selected.priority}
              onChange={(e) => setSelected(s => ({ ...s, priority: e.target.value }))}
              style={{ padding: 8, border: `1px solid ${theme.colors.border}`, borderRadius: theme.radius.sm }}
            >
              <option value="">Priority</option>
              {options.priorities.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <select
              aria-label="Filter by tag"
              value={selected.tag}
              onChange={(e) => setSelected(s => ({ ...s, tag: e.target.value }))}
              style={{ padding: 8, border: `1px solid ${theme.colors.border}`, borderRadius: theme.radius.sm }}
            >
              <option value="">Tag</option>
              {options.tags.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                aria-label="Reset filters"
                onClick={() => setSelected({ assignee: "", priority: "", tag: "", query: "" })}
                style={{ flex: 1, background: "#fff", border: `1px solid ${theme.colors.border}`, borderRadius: theme.radius.sm, padding: 10 }}
              >
                Reset
              </button>
              <button
                aria-label="Apply filters"
                onClick={apply}
                style={{ flex: 1, background: theme.colors.primary, color: "#fff", border: "none", borderRadius: theme.radius.sm, padding: 10 }}
              >
                Apply
              </button>
            </div>
            <button aria-label="Close filters" onClick={() => setOpen(false)} style={{ background: "transparent", border: "none", color: theme.colors.subtleText }}>
              Close
            </button>
          </div>
        </div>
      )}
      {open && (
        <div onClick={() => setOpen(false)} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 15
        }} />
      )}
    </>
  );
}
