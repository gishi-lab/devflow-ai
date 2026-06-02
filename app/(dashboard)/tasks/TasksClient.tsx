"use client";

import { useOptimistic, useTransition, useState, useRef } from "react";
import { createTask, updateTaskStatus, deleteTask } from "@/app/actions/tasks";
import type { Task, TaskPriority, TaskStatus } from "@/types";

// ─── Config ───────────────────────────────────────────────────────────────────

const priorityConfig: Record<
  TaskPriority,
  { label: string; color: string; dot: string }
> = {
  low: { label: "Low", color: "bg-slate-100 text-slate-600", dot: "bg-slate-400" },
  medium: { label: "Medium", color: "bg-amber-50 text-amber-700", dot: "bg-amber-400" },
  high: { label: "High", color: "bg-red-50 text-red-700", dot: "bg-red-400" },
};

const statusConfig: Record<TaskStatus, { label: string; color: string }> = {
  "todo": { label: "To Do", color: "bg-slate-100 text-slate-600" },
  "in-progress": { label: "In Progress", color: "bg-indigo-50 text-indigo-700" },
  "done": { label: "Done", color: "bg-emerald-50 text-emerald-700" },
};

// Status cycles: todo → in-progress → done → todo
const NEXT_STATUS: Record<TaskStatus, TaskStatus> = {
  "todo": "in-progress",
  "in-progress": "done",
  "done": "todo",
};

// ─── Optimistic action types ───────────────────────────────────────────────────

type OptimisticAction =
  | { type: "add"; task: Task }
  | { type: "update-status"; id: string; status: TaskStatus }
  | { type: "delete"; id: string };

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  initialTasks: Task[];
}

export function TasksClient({ initialTasks }: Props) {
  // useOptimistic gives us a "shadow" copy of the task list.
  // While a Server Action is running, we immediately show the intended result.
  // If the action fails, useOptimistic automatically reverts.
  const [optimisticTasks, dispatch] = useOptimistic(
    initialTasks,
    (state: Task[], action: OptimisticAction): Task[] => {
      switch (action.type) {
        case "add":
          return [action.task, ...state];
        case "update-status":
          return state.map((t) =>
            t.id === action.id ? { ...t, status: action.status } : t
          );
        case "delete":
          return state.filter((t) => t.id !== action.id);
      }
    }
  );

  // useTransition lets us wrap async work so optimistic updates stay visible
  const [isPending, startTransition] = useTransition();

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium" as TaskPriority,
  });
  const [error, setError] = useState<string | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  // Filter state
  const [filter, setFilter] = useState<TaskStatus | "all">("all");

  const filtered =
    filter === "all"
      ? optimisticTasks
      : optimisticTasks.filter((t) => t.status === filter);

  const counts = {
    all: optimisticTasks.length,
    "todo": optimisticTasks.filter((t) => t.status === "todo").length,
    "in-progress": optimisticTasks.filter((t) => t.status === "in-progress").length,
    "done": optimisticTasks.filter((t) => t.status === "done").length,
  };

  // ─── Handlers ───────────────────────────────────────────────────────────────

  const handleAdd = () => {
    if (!newTask.title.trim()) {
      titleRef.current?.focus();
      return;
    }

    // Build a temporary task for the optimistic UI.
    // The real record (with a proper UUID) replaces it after revalidatePath.
    const tempTask: Task = {
      id: `temp-${Date.now()}`,
      userId: "",
      title: newTask.title.trim(),
      description: newTask.description.trim() || undefined,
      priority: newTask.priority,
      status: "todo",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setNewTask({ title: "", description: "", priority: "medium" });
    setShowForm(false);
    setError(null);

    startTransition(async () => {
      dispatch({ type: "add", task: tempTask });
      try {
        await createTask({
          title: tempTask.title,
          description: tempTask.description,
          priority: tempTask.priority,
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to add task.");
      }
    });
  };

  const handleToggleStatus = (task: Task) => {
    const next = NEXT_STATUS[task.status];
    setError(null);

    startTransition(async () => {
      dispatch({ type: "update-status", id: task.id, status: next });
      try {
        await updateTaskStatus(task.id, next);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to update task.");
      }
    });
  };

  const handleDelete = (id: string) => {
    setError(null);

    startTransition(async () => {
      dispatch({ type: "delete", id });
      try {
        await deleteTask(id);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to delete task.");
      }
    });
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tasks</h1>
          <p className="text-slate-500 mt-1 text-sm">
            {optimisticTasks.length} task{optimisticTasks.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setTimeout(() => titleRef.current?.focus(), 50);
          }}
          disabled={isPending}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-semibold px-4 py-2.5 rounded-xl transition-colors text-sm shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Task
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-4 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-400 hover:text-red-600"
          >
            ✕
          </button>
        </div>
      )}

      {/* New task form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-6 shadow-sm">
          <h3 className="text-slate-900 font-semibold text-sm mb-4">New Task</h3>
          <div className="space-y-3">
            <input
              ref={titleRef}
              type="text"
              placeholder="Task title…"
              value={newTask.title}
              onChange={(e) => setNewTask((p) => ({ ...p, title: e.target.value }))}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            />
            <input
              type="text"
              placeholder="Description (optional)"
              value={newTask.description}
              onChange={(e) => setNewTask((p) => ({ ...p, description: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            />
            <div className="flex items-center gap-3">
              <select
                value={newTask.priority}
                onChange={(e) =>
                  setNewTask((p) => ({ ...p, priority: e.target.value as TaskPriority }))
                }
                className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              >
                <option value="low">Low priority</option>
                <option value="medium">Medium priority</option>
                <option value="high">High priority</option>
              </select>
              <div className="flex gap-2 ml-auto">
                <button
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdd}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
                >
                  Add Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-1 mb-6 bg-slate-100 rounded-xl p-1 w-fit">
        {(["all", "todo", "in-progress", "done"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              filter === s
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {s === "all" ? "All" : statusConfig[s].label}
            <span
              className={`ml-1.5 text-xs ${
                filter === s ? "text-slate-500" : "text-slate-400"
              }`}
            >
              {counts[s]}
            </span>
          </button>
        ))}
      </div>

      {/* Task list */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-slate-500 text-sm">No tasks here yet.</p>
            <p className="text-slate-400 text-xs mt-1">
              Click &ldquo;Add Task&rdquo; to get started.
            </p>
          </div>
        ) : (
          filtered.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              onToggleStatus={() => handleToggleStatus(task)}
              onDelete={() => handleDelete(task.id)}
              isTemporary={task.id.startsWith("temp-")}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ─── TaskRow sub-component ────────────────────────────────────────────────────

function TaskRow({
  task,
  onToggleStatus,
  onDelete,
  isTemporary,
}: {
  task: Task;
  onToggleStatus: () => void;
  onDelete: () => void;
  isTemporary: boolean;
}) {
  return (
    <div
      className={`group bg-white rounded-2xl border border-slate-200 px-5 py-4
        hover:border-slate-300 hover:shadow-sm transition-all flex items-start gap-4
        ${task.status === "done" ? "opacity-60" : ""}
        ${isTemporary ? "opacity-75 pointer-events-none" : ""}`}
    >
      {/* Status toggle */}
      <button
        onClick={onToggleStatus}
        title={`Mark as ${NEXT_STATUS[task.status]}`}
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
          flex-shrink-0 mt-0.5 transition-all ${
          task.status === "done"
            ? "bg-emerald-500 border-emerald-500"
            : task.status === "in-progress"
            ? "border-indigo-400 bg-indigo-50"
            : "border-slate-300 hover:border-indigo-400"
        }`}
      >
        {task.status === "done" && (
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
        {task.status === "in-progress" && (
          <div className="w-2 h-2 rounded-full bg-indigo-400" />
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <span
          className={`text-sm font-medium ${
            task.status === "done"
              ? "text-slate-400 line-through"
              : "text-slate-900"
          }`}
        >
          {task.title}
          {isTemporary && (
            <span className="ml-2 text-xs text-slate-400 font-normal">saving…</span>
          )}
        </span>
        {task.description && (
          <p className="text-slate-500 text-xs mt-1">{task.description}</p>
        )}
        <div className="flex items-center gap-2 mt-2">
          <span
            className={`inline-flex items-center gap-1.5 text-xs px-2 py-0.5
              rounded-full font-medium ${priorityConfig[task.priority].color}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${priorityConfig[task.priority].dot}`} />
            {priorityConfig[task.priority].label}
          </span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium
              ${statusConfig[task.status].color}`}
          >
            {statusConfig[task.status].label}
          </span>
        </div>
      </div>

      {/* Delete */}
      <button
        onClick={onDelete}
        title="Delete task"
        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg
          hover:bg-red-50 text-slate-300 hover:text-red-400 transition-all flex-shrink-0"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
}
