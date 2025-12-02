import React, { useMemo, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { theme } from "../theme";
import { usePresence } from "../contexts/PresenceContext";

/**
 * KanbanBoard renders lanes and tasks, supports drag and drop reordering/moving.
 * Expects tasks like: { id, title, status, priority, tags: [], assignee: {name}, dueDate }
 */

// PUBLIC_INTERFACE
export default function KanbanBoard({ initialTasks = [], onTasksChange }) {
  const [tasks, setTasks] = useState(initialTasks);
  const statuses = ["Backlog", "In Progress", "Review", "Done"];
  const lanes = useMemo(() => {
    const grouped = Object.fromEntries(statuses.map(s => [s, []]));
    tasks.forEach(t => grouped[t.status || "Backlog"].push(t));
    return grouped;
  }, [tasks]);

  const onDragEnd = (result) => {
    const { destination, source } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const sourceLane = source.droppableId;
    const destLane = destination.droppableId;

    const updated = [...tasks];
    const movingTask = updated.find(t => t.id === result.draggableId);
    if (!movingTask) return;
    movingTask.status = destLane;

    // Reorder within lane by removing and inserting based on destination index
    const without = updated.filter(t => t.id !== movingTask.id);
    const before = without.filter(t => t.status === destLane);
    const others = without.filter(t => t.status !== destLane);
    before.splice(destination.index, 0, movingTask);
    const merged = [...others, ...before];

    setTasks(merged);
    onTasksChange?.(merged);
  };

  const { cursors } = usePresence();

  return (
    <div style={{ position: "relative" }}>
      <DragDropContext onDragEnd={onDragEnd}>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${statuses.length}, 1fr)`, gap: 16 }}>
          {statuses.map((status) => (
            <Droppable droppableId={status} key={status}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  style={{
                    background: theme.colors.surface,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: theme.radius.md,
                    padding: 12,
                    minHeight: 400,
                    boxShadow: `0 1px 3px ${theme.colors.shadow}`
                  }}
                >
                  <h4 style={{ marginTop: 0, color: theme.colors.primary }}>{status}</h4>
                  {lanes[status].sort((a, b) => (a.order || 0) - (b.order || 0)).map((task, idx) => (
                    <Draggable draggableId={task.id} index={idx} key={task.id}>
                      {(prov) => (
                        <div
                          ref={prov.innerRef}
                          {...prov.draggableProps}
                          {...prov.dragHandleProps}
                          style={{
                            background: "#fff",
                            border: `1px solid ${theme.colors.border}`,
                            borderRadius: theme.radius.sm,
                            padding: 10,
                            marginBottom: 10,
                            boxShadow: `0 1px 2px ${theme.colors.shadow}`,
                            transition: "box-shadow 0.15s ease, transform 0.05s ease",
                            ...prov.draggableProps.style
                          }}
                        >
                          <div style={{ fontWeight: 600 }}>{task.title}</div>
                          <div style={{ fontSize: 12, color: theme.colors.subtleText }}>
                            {task.assignee?.name ? `@${task.assignee.name}` : "Unassigned"} • {task.priority || "Priority N/A"}
                          </div>
                          <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                            {(task.tags || []).map(tag => (
                              <span key={tag} style={{ fontSize: 11, background: theme.colors.background, border: `1px solid ${theme.colors.border}`, borderRadius: 999, padding: "2px 6px" }}>
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      {/* Presence cursors overlay (if server supports it) */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {Object.entries(cursors).map(([uid, c]) => (
          <div key={uid} style={{
            position: "absolute",
            left: (c.x || 0) + "px",
            top: (c.y || 0) + "px",
            transform: "translate(-50%, -50%)",
            background: theme.colors.secondary,
            color: "#111",
            fontSize: 10,
            padding: "2px 4px",
            borderRadius: theme.radius.sm
          }}>
            {uid}
          </div>
        ))}
      </div>
    </div>
  );
}
