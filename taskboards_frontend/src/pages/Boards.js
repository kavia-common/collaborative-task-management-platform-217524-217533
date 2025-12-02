import React, { useEffect, useMemo, useState } from "react";
import KanbanBoard from "../components/KanbanBoard";
import FiltersDrawer from "../components/FiltersDrawer";
import CSVExportButton from "../components/CSVExportButton";
import { useDemo } from "../contexts/DemoContext";
import { apiGet } from "../services/api";

/**
 * Boards page assembling filters, CSV export, and Kanban.
 * Uses DemoContext for graceful fallback when backend returns 503 or demo is forced.
 */
export default function Boards() {
  const { withDemoFallback, demoMode, mockTasks, setMockTasks, disableMutations } = useDemo();
  const [filters, setFilters] = useState({});
  const [tasks, setTasks] = useState([]);

  // Load tasks: try API, on 503 fallback to mock
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await withDemoFallback(
          apiGet("/tasks"),
          {
            fallback: () => mockTasks
          }
        );
        if (!cancelled) setTasks(data);
      } catch {
        // Network or other errors - show mock tasks if demoMode active, else keep empty
        if (!cancelled) setTasks(demoMode ? mockTasks : []);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [withDemoFallback, demoMode, mockTasks]);

  const filtered = useMemo(() => {
    return tasks.filter(t => {
      if (filters.query && !t.title.toLowerCase().includes(filters.query.toLowerCase())) return false;
      if (filters.assignee && t.assignee?.name !== filters.assignee) return false;
      if (filters.priority && t.priority !== filters.priority) return false;
      if (filters.tag && !(t.tags || []).includes(filters.tag)) return false;
      return true;
    });
  }, [tasks, filters]);

  // Optimistic local updates when in demo mode (no server side mutation)
  const onTasksChange = (updated) => {
    setTasks(updated);
    if (demoMode) {
      // persist to in-memory demo store so other pages see it
      setMockTasks(updated);
    } else if (disableMutations) {
      // explicitly do nothing if disabled (safety net)
      // Could show a toast in a future iteration
    }
  };

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <FiltersDrawer onChange={setFilters} />
        <CSVExportButton tasks={filtered} />
      </div>
      <KanbanBoard initialTasks={filtered} onTasksChange={onTasksChange} />
    </div>
  );
}
