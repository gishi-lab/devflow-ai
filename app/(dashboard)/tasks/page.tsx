"use client";

import { useState } from "react";

type Priority = "low" | "medium" | "high";
type Status = "todo" | "in-progress" | "done";

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  status: Status;
  createdAt: string;
}

const priorityConfig: Record<Priority, { label: string; color: string; dot: string }> = {
  low: { label: "Low", color: "bg-slate-100 text-slate-600", dot: "bg-slate-400" },
  medium: { label: "Medium", color: "bg-amber-50 text-amber-700", dot: "bg-amber-400" },
  high: { label: "High", color: "bg-red-50 text-red-700", dot: "bg-red-400" },
};

const statusConfig: Record<Status, { label: string; color: string }> = {
  "todo": { label: "To Do", color: "bg-slate-100 text-slate-600" },
  "in-progress": { label: "In Progress", color: "bg-indigo-50 text-indigo-700" },
  "done": { label: "Done", color: "bg-emerald-50 text-emerald-700" },
};

const INITIAL_TASKS: Task[] = [
  {
    id: "1",
    title: "Set up Supabase database",
    description: "Create tables for tasks, notes, and links",
    priority: "high",
    status: "todo",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Design landing page hero",
    description: "Create the main hero section with CTA",
    priority: "medium",
    status: "in-progress",
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    title: "Read Next.js App Router docs",
    priority: "low",
    status: "done",
    createdAt: new Date().toISOString(),
  },
];

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [filter, setFilter] = useState<Status | "all">("all");
  const [showForm, setShowForm] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", description: "", priority: "medium" as Priority });

  const filtered = filter === "all" ? tasks : tasks.filter((t) => t.status === filter);

  const addTask = () => {
    if (!newTask.title.trim()) return;
    setTasks((prev) => [
      {
        id: Date.now().toString(),
        title: newTask.title.trim(),
        description: newTask.description.trim() || undefined,
        priority: newTask.priority,
        status: "todo",
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
    setNewTask({ title: "", description: "", priority: "medium" });
    setShowForm(false);
  };

  const toggleStatus = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const next: Record<Status, Status> = { "todo": "in-progress", "in-progress": "done", "done": "todo" };
        return { ...t, status: next[t.status] };
      })
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const counts = {
    all: tasks.length,
    todo: tasks.filter((t) => t.status === "todo").length,
    "in-progress": tasks.filter((t) => t.status === "in-progress").length,
    done: tasks.filter((t) => t.status === "done").length,
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tasks</h1>
          <p className="text-slate-500 mt-1 text-sm">{tasks.length} tasks total</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2.5 rounded-xl transition-colors text-sm shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Task
        </button>
      </div>

      {/* New task form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-6 shadow-sm">
          <h3 className="text-slate-900 font-semibold text-sm mb-4">New Task</h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Task title..."
              value={newTask.title}
              onChange={(e) => setNewTask((p) => ({ ...p, title: e.target.value }))}
              onKeyDown={(e) => e.key === "Enter" && addTask()}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              autoFocus
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
                onChange={(e) => setNewTask((p) => ({ ...p, priority: e.target.value as Priority }))}
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
                  onClick={addTask}
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
            <span className={`ml-1.5 text-xs ${filter === s ? "text-slate-500" : "text-slate-400"}`}>
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
            <p className="text-slate-400 text-xs mt-1">Click &ldquo;Add Task&rdquo; to get started.</p>
          </div>
        ) : (
          filtered.map((task) => (
            <div
              key={task.id}
              className={`group bg-white rounded-2xl border border-slate-200 px-5 py-4 hover:border-slate-300 hover:shadow-sm transition-all flex items-start gap-4 ${
                task.status === "done" ? "opacity-60" : ""
              }`}
            >
              {/* Status toggle button */}
              <button
                onClick={() => toggleStatus(task.id)}
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
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

              {/* Task content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2 flex-wrap">
                  <span className={`text-sm font-medium ${task.status === "done" ? "text-slate-400 line-through" : "text-slate-900"}`}>
                    {task.title}
                  </span>
                </div>
                {task.description && (
                  <p className="text-slate-500 text-xs mt-1">{task.description}</p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full font-medium ${priorityConfig[task.priority].color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${priorityConfig[task.priority].dot}`} />
                    {priorityConfig[task.priority].label}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusConfig[task.status].color}`}>
                    {statusConfig[task.status].label}
                  </span>
                </div>
              </div>

              {/* Delete button */}
              <button
                onClick={() => deleteTask(task.id)}
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-400 transition-all flex-shrink-0"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
