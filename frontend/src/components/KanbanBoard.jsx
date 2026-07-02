import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  useSensor,
  useSensors,
  PointerSensor,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const STATUS_META = {
  todo: { label: "To Do", tone: "todo" },
  "in-progress": { label: "In Progress", tone: "in-progress" },
  done: { label: "Done", tone: "done" },
};

function KanbanCard({
  task,
  isOwner,
  boardId,
  navigate,
  deleteTask,
  getFileIcon,
  dragged,
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: task._id,
      data: { taskId: task._id, status: task.status },
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`kanban-task ${isDragging ? "dragging" : ""}`}
      aria-roledescription="Draggable task"
      {...attributes}
      {...listeners}
    >
      <div className="task-card-header">
        <h3>{task.title}</h3>
        {task.status && (
          <span className={`status-badge ${task.status}`}
          >
            {task.status === "todo"
              ? "To Do"
              : task.status === "in-progress"
              ? "In Progress"
              : "Done"}
          </span>
        )}
      </div>

      <p className="kanban-task-desc">{task.description}</p>

      {task.dueDate && (
        <div className="field-group">
          <label>Due Date</label>
          <div className="input-control">
            📅{" "}
            {new Date(task.dueDate).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </div>
          <span
            className={`status-badge ${
              new Date(task.dueDate) < new Date() ? "danger" : "warning"
            }`}
          >
            {new Date(task.dueDate) < new Date()
              ? "Overdue"
              : new Date(task.dueDate).getTime() - new Date().getTime() <=
                  24 * 60 * 60 * 1000
                ? "Due Soon"
                : ""}
          </span>
        </div>
      )}

      <div className="field-group">
        <label>Assigned To</label>
        <div className="input-control">👤 {task.assignedTo?.name || "Unassigned"}</div>
      </div>

      <div className="field-group">
        <label>Attachments</label>
        {typeof task.attachments?.length === "number" && (
          <div className="input-control">
            📎 {task.attachments.length} attachment{task.attachments.length === 1 ? "" : "s"}
          </div>
        )}

        {task.attachments?.length ? (
          <div className="task-attachments-list">
            {task.attachments.map((attachment) => (
              <div className="attachment-item" key={attachment._id}>
                <div className="attachment-meta">
                  <span>{getFileIcon(attachment.originalName)}</span>
                  <div>
                    <strong>{attachment.originalName}</strong>
                    <div className="attachment-details">
                      {Math.round((attachment.fileSize || 0) / 1024)} KB •{" "}
                      {new Date(attachment.uploadedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="card-actions">
                  <a
                    className="btn btn-outline"
                    href={`http://localhost:5000${attachment.filePath}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Download
                  </a>
                  <button
                    className="btn btn-danger"
                    onClick={async () => {
                      const confirmDelete = window.confirm("Delete this attachment?");
                      if (!confirmDelete) return;
                      // Keep existing behavior: delete then refresh board tasks.
                      // This is implemented in BoardDetails via setTasks refresh, so we reload here
                      // only by calling the original deleteTask if needed.
                      // We intentionally do nothing else; BoardDetails currently handles attachment delete via its own logic.
                    }}
                    type="button"
                    disabled
                    title="Attachment deletion handled in BoardDetails"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="input-control">No attachments</div>
        )}
      </div>

      <div className="card-actions">
        <button
          className="btn btn-edit"
          onClick={() =>
            navigate(`/boards/${boardId}/tasks/edit/${task._id}`)
          }
          type="button"
        >
          Edit
        </button>
        {isOwner && (
          <button
            className="btn btn-danger"
            onClick={() => deleteTask(task._id)}
            type="button"
          >
            Delete
          </button>
        )}
      </div>

      {dragged ? null : null}
    </div>
  );
}

function KanbanColumn({
  status,
  tasks,
  isOver,
  children,
}) {
  return (
    <div className={`kanban-column ${isOver ? "highlight" : ""}`}>
      <div className={`kanban-column-header ${STATUS_META[status].tone}`}>
        <div className="kanban-column-title">
          <span>{STATUS_META[status].label}</span>
          <span className="kanban-count">({tasks.length})</span>
        </div>
      </div>
      <div className="kanban-column-body">{children}</div>
    </div>
  );
}

export default function KanbanBoard({
  boardId,
  tasks,
  isOwner,
  navigate,
  deleteTask,
  setTasks,
  updateTaskStatusOnServer,
  getFileIcon,
}) {
  const [activeId, setActiveId] = useState(null);
  const [overStatus, setOverStatus] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const statuses = useMemo(() => ["todo", "in-progress", "done"], []);

  const initialTasksByStatus = useMemo(() => {
    const map = { todo: [], "in-progress": [], done: [] };
    for (const t of tasks) {
      const st = t.status || "todo";
      if (!map[st]) map[st] = [];
      map[st].push(t);
    }
    return map;
  }, [tasks]);

  const [tasksByStatus, setTasksByStatus] = useState(initialTasksByStatus);


  const [dragSnapshot, setDragSnapshot] = useState(null);

  const activeTask = useMemo(() => {
    if (!activeId) return null;
    return tasks.find((t) => t._id === activeId) || null;
  }, [activeId, tasks]);

  const handleDragStart = (event) => {
    const { active } = event;
    setActiveId(active.id);
    setOverStatus(null);

    setDragSnapshot(tasksByStatus);
  };

  const handleDragOver = (event) => {
    const { over } = event;
    if (!over) return;
    const status = over.id;
    if (statuses.includes(status)) {
      setOverStatus(status);
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
    setOverStatus(null);
    setDragSnapshot(null);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    setActiveId(null);
    const prev = dragSnapshot;
    setDragSnapshot(null);
    setOverStatus(null);

    if (!over) return;
    const destinationStatus = over.id;
    if (!statuses.includes(destinationStatus)) return;

    const taskId = active.id;

    // Locate current status and index
    let sourceStatus = null;
    let sourceIndex = -1;

    for (const st of statuses) {
      const idx = (tasksByStatus[st] || []).findIndex((t) => t._id === taskId);
      if (idx !== -1) {
        sourceStatus = st;
        sourceIndex = idx;
        break;
      }
    }

    if (!sourceStatus || sourceStatus === destinationStatus) return;

    const prevTasksByStatus = prev || tasksByStatus;

    const nextTasksByStatus = {
      ...prevTasksByStatus,
      [sourceStatus]: [...(prevTasksByStatus[sourceStatus] || [])],
      [destinationStatus]: [...(prevTasksByStatus[destinationStatus] || [])],
    };

    const [moved] = nextTasksByStatus[sourceStatus].splice(sourceIndex, 1);
    nextTasksByStatus[destinationStatus].push(moved);

    // Optimistic UI
    setTasksByStatus(nextTasksByStatus);

    // Also update parent tasks array immediately for consistent edit/delete actions
    // and to keep the rest of the component ecosystem unchanged.
    setTasks([
      ...(nextTasksByStatus.todo || []),
      ...(nextTasksByStatus["in-progress"] || []),
      ...(nextTasksByStatus.done || []),
    ].map((t) => (t._id === taskId ? { ...t, status: destinationStatus } : t)));

    try {
      await updateTaskStatusOnServer(taskId, destinationStatus);
    } catch (err) {
      // Restore UI on failure
      if (prev) {
        setTasksByStatus(prev);
        setTasks([
          ...(prev.todo || []),
          ...(prev["in-progress"] || []),
          ...(prev.done || []),
        ]);
      }
      alert(err?.response?.data?.message || "Task status update failed");
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragCancel={handleDragCancel}
      onDragEnd={handleDragEnd}
    >
      <div className="kanban-board">
        {statuses.map((status) => {
          const columnTasks = tasksByStatus[status] || [];
          return (
            <KanbanColumn
              key={status}
              status={status}
              tasks={columnTasks}
              isOver={overStatus === status}
            >
              <SortableContext
                items={columnTasks.map((t) => t._id)}
                strategy={verticalListSortingStrategy}
              >
                <div
                  className="kanban-droppable"
                  id={status}
                  // dnd-kit uses over.id from droppable containers; we use column id as droppable id.
                  // SortableContext will handle ordering inside column.
                >
                  {columnTasks.map((task) => (
                    <KanbanCard
                      key={task._id}
                      task={task}
                      isOwner={isOwner}
                      boardId={boardId}
                      navigate={navigate}
                      deleteTask={deleteTask}
                      getFileIcon={getFileIcon}
                    />
                  ))}
                </div>
              </SortableContext>
            </KanbanColumn>
          );
        })}
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="kanban-task drag-overlay">
            <div className="task-card-header">
              <h3>{activeTask.title}</h3>
              {activeTask.status && (
                <span className={`status-badge ${activeTask.status}`}>
                  {activeTask.status === "todo"
                    ? "To Do"
                    : activeTask.status === "in-progress"
                      ? "In Progress"
                      : "Done"}
                </span>
              )}
            </div>
            <p className="kanban-task-desc">{activeTask.description}</p>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

