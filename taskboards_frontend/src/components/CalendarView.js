import React, { useMemo, useState } from "react";
import { addMonths, endOfMonth, format, getDate, isSameDay, isSameMonth, startOfMonth, startOfWeek } from "date-fns";
import { theme } from "../theme";

/**
 * CalendarView shows tasks on a monthly calendar.
 * Expects tasks with a dueDate (YYYY-MM-DD or ISO) and title.
 */

// PUBLIC_INTERFACE
export default function CalendarView({ tasks = [] }) {
  const [current, setCurrent] = useState(new Date());

  const { grid, label } = useMemo(() => {
    const start = startOfWeek(startOfMonth(current), { weekStartsOn: 1 });
    const end = endOfMonth(current);
    const days = Array.from({ length: 42 }).map((_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      return d;
    });
    return {
      grid: days,
      label: format(current, "MMMM yyyy")
    };
  }, [current]);

  const tasksByDay = useMemo(() => {
    const map = {};
    tasks.forEach(t => {
      if (!t.dueDate) return;
      const d = new Date(t.dueDate);
      const key = format(d, "yyyy-MM-dd");
      if (!map[key]) map[key] = [];
      map[key].push(t);
    });
    return map;
  }, [tasks]);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <button
          onClick={() => setCurrent(d => addMonths(d, -1))}
          style={{ background: "#fff", border: `1px solid ${theme.colors.border}`, borderRadius: theme.radius.sm, padding: "8px 10px" }}
        >
          ◀
        </button>
        <h3 style={{ margin: 0, color: theme.colors.primary }}>{label}</h3>
        <button
          onClick={() => setCurrent(d => addMonths(d, 1))}
          style={{ background: "#fff", border: `1px solid ${theme.colors.border}`, borderRadius: theme.radius.sm, padding: "8px 10px" }}
        >
          ▶
        </button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8 }}>
        {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(h => (
          <div key={h} style={{ textAlign: "center", fontWeight: 600, color: theme.colors.subtleText }}>{h}</div>
        ))}
        {grid.map((d, idx) => {
          const key = format(d, "yyyy-MM-dd");
          const dayTasks = tasksByDay[key] || [];
          const inMonth = isSameMonth(d, current);
          const today = isSameDay(d, new Date());
          return (
            <div
              key={idx}
              style={{
                minHeight: 100,
                background: theme.colors.surface,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: theme.radius.sm,
                padding: 8,
                opacity: inMonth ? 1 : 0.5,
                boxShadow: `0 1px 2px ${theme.colors.shadow}`,
                position: "relative"
              }}
            >
              <div style={{ position: "absolute", top: 6, right: 8, fontSize: 12, color: theme.colors.subtleText }}>
                {getDate(d)}
              </div>
              <div style={{ display: "grid", gap: 6 }}>
                {dayTasks.slice(0, 4).map(t => (
                  <div key={t.id} style={{
                    background: today ? theme.colors.secondary : theme.colors.background,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: theme.radius.sm,
                    padding: "4px 6px",
                    fontSize: 12
                  }}>
                    {t.title}
                  </div>
                ))}
                {dayTasks.length > 4 && (
                  <div style={{ fontSize: 11, color: theme.colors.subtleText }}>
                    +{dayTasks.length - 4} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
