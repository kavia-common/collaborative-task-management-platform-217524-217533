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
  const [loading, setLoading] = useState(true);

  // Initialize filters from URL
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const initial = {
      query: sp.get("q") || "",
      assignee: sp.get("assignee") || "",
      priority: sp.get("priority") || "",
      tag: sp.get("tag") || ""
    };
    setFilters((prev) => ({ ...prev, ...initial }));
  }, []);

  // Persist filters to URL
  useEffect(() => {
    const sp = new URLSearchParams();
    if (filters.query) sp.set("q", filters.query);
    if (filters.assignee) sp.set("assignee", filters.assignee);
    if (filters.priority) sp.set("priority", filters.priority);
    if (filters.tag) sp.set("tag", filters.tag);
    const qs = sp.toString();
    const newUrl = `${window.location.pathname}${qs ? `?${qs}` : ""}${window.location.hash}`;
    window.history.replaceState(null, "", newUrl);
  }, [filters]);

  // Load tasks: try API, on 503 fallback to mock
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
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
      } finally {
        if (!cancelled) setLoading(false);
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
        <FiltersDrawer onChange={setFilters} initial={filters} />
        <CSVExportButton tasks={filtered} />
      </div>
      {loading ? (
        <div aria-busy="true" aria-label="Loading board" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {Array.from({ length: 4 }).map((_, col) => (
            <div key={col} style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 8, padding: 12, minHeight: 320 }}>
              <div style={{ height: 14, width: 120, background: "#F3F4F6", borderRadius: 4, marginBottom: 12 }} />
              {Array.from({ length: 4 }).map((__, i) => (
                <div key={i} style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", height: 52, borderRadius: 6, marginBottom: 10 }} />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <KanbanBoard initialTasks={filtered} onTasksChange={onTasksChange} />
      )}
    </div>
  );
}
