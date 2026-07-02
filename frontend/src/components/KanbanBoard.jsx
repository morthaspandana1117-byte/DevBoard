import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  useSensor,
  useSensors,
  PointerSensor,
  useDroppable,
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
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: task._id,
      data: { taskId: task._id, status: task.status || "todo" },
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const dueDateLabel = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

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
          <span className={`status-badge ${task.status}`}>
            {task.status === "todo"
              ? "To Do"
              : task.status === "in-progress"
              ? "In Progress"
              : "Done"}
          </span>
        )}
      </div>

      {task.description && <p className="kanban-task-desc">{task.description}</p>}

      <div className="task-card-meta">
        {dueDateLabel && (
          <div className="task-meta-pill">
            <span>📅</span>
            <span>{dueDateLabel}</span>
          </div>
        )}
        <div className="task-meta-pill">
          <span>👤</span>
          <span>{task.assignedTo?.name || "Unassigned"}</span>
        </div>
        <div className="task-meta-pill">
          <span>📎</span>
          <span>{task.attachments?.length || 0}</span>
        </div>
      </div>

      {task.attachments?.length ? (
        <div className="task-attachments-list">
          {task.attachments.map((attachment) => (
            <div className="attachment-item compact" key={attachment._id}>
              <div className="attachment-meta">
                <span>{getFileIcon(attachment.originalName)}</span>
                <div>
                  <strong>{attachment.originalName}</strong>
                  <div className="attachment-details">
                    {Math.round((attachment.fileSize || 0) / 1024)} KB
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <div className="card-actions compact-actions">
        <button
          className="btn btn-edit"
          onClick={() => navigate(`/boards/${boardId}/tasks/edit/${task._id}`)}
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
    </div>
  );
}

function KanbanColumn({ status, tasks, children }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div className={`kanban-column ${isOver ? "highlight" : ""}`}>
      <div className={`kanban-column-header ${STATUS_META[status].tone}`}>
        <div className="kanban-column-title">
          <span>{STATUS_META[status].label}</span>
          <span className="kanban-count">({tasks.length})</span>
        </div>
      </div>
      <div ref={setNodeRef} className="kanban-column-body">
        <div className="kanban-droppable">{children}</div>
      </div>
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
  const [dragError, setDragError] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  );

  const statuses = useMemo(() => ["todo", "in-progress", "done"], []);

  const buildTasksByStatus = (taskList) => {
    const map = { todo: [], "in-progress": [], done: [] };
    for (const task of taskList) {
      const status = task.status || "todo";
      if (!map[status]) map[status] = [];
      map[status].push(task);
    }
    return map;
  };

  const [tasksByStatus, setTasksByStatus] = useState(() => buildTasksByStatus(tasks));
  const [dragSnapshot, setDragSnapshot] = useState(null);

  useEffect(() => {
    setTasksByStatus(buildTasksByStatus(tasks));
  }, [tasks]);

  const activeTask = useMemo(() => {
    if (!activeId) return null;
    return tasks.find((task) => task._id === activeId) || null;
  }, [activeId, tasks]);

  const handleDragStart = (event) => {
    const { active } = event;
    setActiveId(active.id);
    setOverStatus(null);
    setDragError("");
    setDragSnapshot(tasksByStatus);
  };

  const handleDragOver = (event) => {
    const { over } = event;
    if (!over) return;

    const nextStatus = over.data?.current?.status || over.id;
    if (statuses.includes(nextStatus)) {
      setOverStatus(nextStatus);
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
    setOverStatus(null);
    setDragSnapshot(null);
    setDragError("");
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    setActiveId(null);
    const prev = dragSnapshot;
    setDragSnapshot(null);
    setOverStatus(null);

    if (!over) return;

    const destinationStatus = over.data?.current?.status || over.id;
    if (!statuses.includes(destinationStatus)) return;

    const taskId = active.id;
    const sourceStatus = statuses.find((status) =>
      (tasksByStatus[status] || []).some((task) => task._id === taskId),
    );

    if (!sourceStatus || sourceStatus === destinationStatus) return;

    const prevTasksByStatus = prev || tasksByStatus;
    const nextTasksByStatus = {
      ...prevTasksByStatus,
      [sourceStatus]: [...(prevTasksByStatus[sourceStatus] || [])],
      [destinationStatus]: [...(prevTasksByStatus[destinationStatus] || [])],
    };

    const sourceIndex = (nextTasksByStatus[sourceStatus] || []).findIndex(
      (task) => task._id === taskId,
    );
    const [moved] = nextTasksByStatus[sourceStatus].splice(sourceIndex, 1);
    nextTasksByStatus[destinationStatus].push(moved);

    setTasksByStatus(nextTasksByStatus);
    setTasks(
      [
        ...(nextTasksByStatus.todo || []),
        ...(nextTasksByStatus["in-progress"] || []),
        ...(nextTasksByStatus.done || []),
      ].map((task) => (task._id === taskId ? { ...task, status: destinationStatus } : task)),
    );

    try {
      await updateTaskStatusOnServer(taskId, destinationStatus);
      setDragError("");
    } catch (err) {
      if (prev) {
        setTasksByStatus(prev);
        setTasks([
          ...(prev.todo || []),
          ...(prev["in-progress"] || []),
          ...(prev.done || []),
        ]);
      }
      setDragError(err?.response?.data?.message || "Couldn't update task status. Please try again.");
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
      <div className="kanban-board-wrapper">
        {dragError && <div className="alert alert-error">{dragError}</div>}

        <div className="kanban-board">
          {statuses.map((status) => {
            const columnTasks = tasksByStatus[status] || [];
            return (
              <KanbanColumn
                key={status}
                status={status}
                tasks={columnTasks}
              >
                <SortableContext
                  items={columnTasks.map((task) => task._id)}
                  strategy={verticalListSortingStrategy}
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
                </SortableContext>
              </KanbanColumn>
            );
          })}
        </div>
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

