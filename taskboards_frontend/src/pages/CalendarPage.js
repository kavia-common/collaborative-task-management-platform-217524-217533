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
  const [loading, setLoading] = useState(true);

  // Initialize from URL
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

  // Persist to URL
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

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const data = await withDemoFallback(
          apiGet("/tasks"),
          { fallback: () => mockTasks }
        );
        if (!cancelled) setTasks(data);
      } catch {
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

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <FiltersDrawer onChange={setFilters} initial={filters} />
        <CSVExportButton tasks={filtered} />
      </div>
      {loading ? (
        <div aria-busy="true" aria-label="Loading calendar" style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(7, 1fr)" }}>
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={`h-${i}`} style={{ height: 18, background: "#E5E7EB", borderRadius: 4 }} />
          ))}
          {Array.from({ length: 42 }).map((_, i) => (
            <div key={`d-${i}`} style={{ height: 100, background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 8 }} />
          ))}
        </div>
      ) : (
        <CalendarView tasks={filtered} />
      )}
    </div>
  );
}
