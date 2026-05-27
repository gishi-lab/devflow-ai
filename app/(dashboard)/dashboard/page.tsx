import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Dashboard – DevFlow AI",
};

const quickStats = [
  {
    label: "Open Tasks",
    value: "0",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    color: "bg-indigo-50 text-indigo-600",
    href: "/tasks",
  },
  {
    label: "Notes",
    value: "0",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
    color: "bg-violet-50 text-violet-600",
    href: "/notes",
  },
  {
    label: "Saved Links",
    value: "0",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
    color: "bg-sky-50 text-sky-600",
    href: "/links",
  },
  {
    label: "AI Chats",
    value: "0",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    ),
    color: "bg-emerald-50 text-emerald-600",
    href: "/chat",
  },
];

const quickActions = [
  {
    href: "/tasks",
    label: "Add a task",
    description: "Create a new development task",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    ),
    color: "bg-indigo-600",
  },
  {
    href: "/notes",
    label: "Write a note",
    description: "Save a concept or code snippet",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
    ),
    color: "bg-violet-600",
  },
  {
    href: "/links",
    label: "Save a link",
    description: "Bookmark a useful resource",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
    color: "bg-sky-600",
  },
  {
    href: "/chat",
    label: "Ask AI",
    description: "Get help from your AI assistant",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    color: "bg-emerald-600",
  },
];

const tips = [
  "Start with your most important task first — focus beats multitasking.",
  "Save every useful link you find. You'll need it again.",
  "Use the AI assistant to explain concepts you don't understand yet.",
  "Write notes in your own words to reinforce your learning.",
  "Break big features into small, actionable tasks.",
];

export default function DashboardPage() {
  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12 ? "Good morning" : currentHour < 18 ? "Good afternoon" : "Good evening";

  const randomTip = tips[Math.floor(Math.random() * tips.length)];

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          {greeting}, Developer 👋
        </h1>
        <p className="text-slate-500 mt-1">Here&apos;s an overview of your workspace.</p>
      </div>

      {/* Tip of the day */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 mb-8 flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <div>
          <div className="text-indigo-700 font-semibold text-sm">Dev Tip of the Day</div>
          <p className="text-indigo-600 text-sm mt-0.5">{randomTip}</p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {quickStats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-slate-300 hover:shadow-sm transition-all group"
          >
            <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
              {stat.icon}
            </div>
            <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
            <div className="text-slate-500 text-sm mt-0.5">{stat.label}</div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="mb-8">
        <h2 className="text-base font-semibold text-slate-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="group flex items-center gap-3 bg-white rounded-xl border border-slate-200 px-4 py-3.5 hover:border-slate-300 hover:shadow-sm transition-all"
            >
              <div className={`w-9 h-9 rounded-lg ${action.color} flex items-center justify-center text-white flex-shrink-0`}>
                {action.icon}
              </div>
              <div>
                <div className="text-slate-900 text-sm font-medium">{action.label}</div>
                <div className="text-slate-400 text-xs">{action.description}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Getting started checklist */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="text-base font-semibold text-slate-900 mb-4">Getting Started Checklist</h2>
        <div className="space-y-3">
          {[
            { label: "Create your first task", done: false, href: "/tasks" },
            { label: "Write your first note", done: false, href: "/notes" },
            { label: "Save a useful link", done: false, href: "/links" },
            { label: "Ask the AI assistant a question", done: false, href: "/chat" },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                item.done
                  ? "bg-emerald-500 border-emerald-500"
                  : "border-slate-300 group-hover:border-indigo-400"
              }`}>
                {item.done && (
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className={`text-sm ${item.done ? "text-slate-400 line-through" : "text-slate-700 group-hover:text-slate-900"}`}>
                {item.label}
              </span>
              <svg className="w-4 h-4 text-slate-300 group-hover:text-slate-400 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
