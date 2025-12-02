import React, { useMemo, useState } from "react";
import KanbanBoard from "../components/KanbanBoard";
import FiltersDrawer from "../components/FiltersDrawer";
import CSVExportButton from "../components/CSVExportButton";

/**
 * Boards page assembling filters, CSV export, and Kanban.
 * Replace the demo data/loading with API integration as backend becomes available.
 */
export default function Boards() {
  const [filters, setFilters] = useState({});
  const [tasks, setTasks] = useState([
    { id: "t1", title: "Design login screen", status: "Backlog", priority: "High", tags: ["frontend"], assignee: { name: "Alice" }, dueDate: "2025-12-03" },
    { id: "t2", title: "API auth endpoint", status: "In Progress", priority: "Urgent", tags: ["backend","feature"], assignee: { name: "Bob" }, dueDate: "2025-12-04" },
    { id: "t3", title: "Fix Kanban drag bug", status: "Review", priority: "Medium", tags: ["bug"], assignee: { name: "Charlie" }, dueDate: "2025-12-12" },
    { id: "t4", title: "Release 0.1.0", status: "Done", priority: "High", tags: ["ops"], assignee: { name: "Dana" }, dueDate: "2025-12-15" },
    { id: "t5", title: "Add calendar legends", status: "Backlog", priority: "Low", tags: ["frontend","feature"], assignee: { name: "Alice" }, dueDate: "2025-12-07" }
  ]);

  const filtered = useMemo(() => {
    return tasks.filter(t => {
      if (filters.query && !t.title.toLowerCase().includes(filters.query.toLowerCase())) return false;
      if (filters.assignee && t.assignee?.name !== filters.assignee) return false;
      if (filters.priority && t.priority !== filters.priority) return false;
      if (filters.tag && !(t.tags || []).includes(filters.tag)) return false;
      return true;
    });
  }, [tasks, filters]);

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <FiltersDrawer onChange={setFilters} />
        <CSVExportButton tasks={filtered} />
      </div>
      <KanbanBoard initialTasks={filtered} onTasksChange={setTasks} />
    </div>
  );
}
