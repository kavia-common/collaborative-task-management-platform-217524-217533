import React, { useEffect, useMemo, useState } from "react";
import CalendarView from "../components/CalendarView";
import FiltersDrawer from "../components/FiltersDrawer";
import CSVExportButton from "../components/CSVExportButton";
import { useDemo } from "../contexts/DemoContext";
import { apiGet } from "../services/api";

/**
 * Calendar page with filters and CSV export of the currently filtered tasks.
 * Uses DemoContext to fall back to mock tasks if backend is not ready or 503.
 */
export default function CalendarPage() {
  const { withDemoFallback, demoMode, mockTasks } = useDemo();
  const [filters, setFilters] = useState({});
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await withDemoFallback(
          apiGet("/tasks"),
          { fallback: () => mockTasks }
        );
        if (!cancelled) setTasks(data);
      } catch {
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

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <FiltersDrawer onChange={setFilters} />
        <CSVExportButton tasks={filtered} />
      </div>
      <CalendarView tasks={filtered} />
    </div>
  );
}
