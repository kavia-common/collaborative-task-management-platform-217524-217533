import React, { useMemo } from "react";
import { CSVLink } from "react-csv";
import { theme } from "../theme";
import { useDemo } from "../contexts/DemoContext";

/**
 * CSV Export Button
 * Accepts an array of tasks and converts them into a CSV with useful columns.
 */
export default function CSVExportButton({ tasks = [] }) {
  const { backendReady, demoMode } = useDemo();

  const headers = [
    { label: "ID", key: "id" },
    { label: "Title", key: "title" },
    { label: "Status", key: "status" },
    { label: "Assignee", key: "assignee" },
    { label: "Priority", key: "priority" },
    { label: "Due Date", key: "dueDate" },
    { label: "Tags", key: "tags" },
  ];

  const data = useMemo(() => {
    return tasks.map(t => ({
      id: t.id,
      title: t.title,
      status: t.status,
      assignee: t.assignee?.name || "",
      priority: t.priority || "",
      dueDate: t.dueDate || "",
      tags: (t.tags || []).join("|")
    }));
  }, [tasks]);

  const disabled = !backendReady && !demoMode;
  const tooltip = disabled ? "Backend not ready. CSV export disabled." : "Export current view to CSV";

  if (disabled) {
    return (
      <span
        title={tooltip}
        aria-disabled="true"
        style={{
          background: "#F3F4F6",
          color: theme.colors.subtleText,
          textDecoration: "none",
          padding: "10px 14px",
          borderRadius: theme.radius.sm,
          boxShadow: `0 1px 2px ${theme.colors.shadow}`,
          fontWeight: 600,
          cursor: "not-allowed",
          border: `1px dashed ${theme.colors.borderStrong}`
        }}
      >
        Export CSV
      </span>
    );
  }

  return (
    <CSVLink
      data={data}
      headers={headers}
      filename="taskboards_export.csv"
      title={tooltip}
      style={{
        background: theme.colors.secondary,
        color: "#111",
        textDecoration: "none",
        padding: "10px 14px",
        borderRadius: theme.radius.sm,
        boxShadow: `0 1px 2px ${theme.colors.shadow}`,
        fontWeight: 600
      }}
    >
      Export CSV
    </CSVLink>
  );
}
