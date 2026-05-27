import Link from "next/link";

const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    title: "Task Management",
    description: "Keep track of your dev tasks with priorities, deadlines, and statuses. Stay on top of your projects.",
    color: "bg-indigo-500/10 text-indigo-400",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
    title: "Dev Notes & Glossary",
    description: "Save code snippets, concepts, and explanations. Build your personal developer dictionary as you learn.",
    color: "bg-violet-500/10 text-violet-400",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
    title: "Links Library",
    description: "Never lose a useful resource again. Organize docs, tutorials, tools, and articles in one place.",
    color: "bg-sky-500/10 text-sky-400",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    ),
    title: "AI Assistant",
    description: "Get instant help from an AI that understands code. Ask questions, debug errors, and learn faster.",
    color: "bg-emerald-500/10 text-emerald-400",
  },
];

const stats = [
  { label: "Features", value: "5+" },
  { label: "Always Free Tier", value: "✓" },
  { label: "Open Source Ready", value: "✓" },
  { label: "Deploy to Vercel", value: "<1min" },
];

export default function LandingPage() {
  return (
    <div className="min-h-full flex flex-col bg-slate-950">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-white font-bold text-lg tracking-tight">DevFlow AI</span>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-slate-400 hover:text-white text-sm font-medium transition-colors px-3 py-2"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-indigo-600/10 blur-[120px]" />
          <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] rounded-full bg-violet-600/8 blur-[100px]" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            Built for Indie Developers
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight mb-6">
            Your AI-Powered{" "}
            <span className="gradient-text">Dev Workspace</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10">
            Stop juggling tabs. DevFlow AI brings task management, developer notes, resource links,
            and an AI assistant into one clean, focused workspace.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors text-base shadow-lg shadow-indigo-500/25"
            >
              Start for Free
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white font-semibold px-8 py-3.5 rounded-xl transition-colors text-base"
            >
              Sign In
            </Link>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 mt-16 pt-8 border-t border-slate-800">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-slate-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-2xl shadow-black/50">
            {/* Browser bar */}
            <div className="flex items-center gap-2 px-4 py-3 bg-slate-900 border-b border-slate-800">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <div className="w-3 h-3 rounded-full bg-green-500/70" />
              <div className="flex-1 mx-4 bg-slate-800 rounded-md px-3 py-1 text-slate-500 text-xs font-mono">
                devflow-ai.vercel.app/dashboard
              </div>
            </div>
            {/* Mock dashboard */}
            <div className="flex h-64 sm:h-80">
              {/* Sidebar preview */}
              <div className="w-48 bg-slate-950 border-r border-slate-800 p-3 flex flex-col gap-1 shrink-0 hidden sm:flex">
                <div className="flex items-center gap-2 px-2 py-1.5 mb-2">
                  <div className="w-6 h-6 rounded-md bg-indigo-600" />
                  <span className="text-white text-xs font-bold">DevFlow AI</span>
                </div>
                {[
                  { label: "Dashboard", active: true },
                  { label: "Tasks" },
                  { label: "Notes" },
                  { label: "Links" },
                  { label: "AI Chat" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`px-2 py-1.5 rounded-lg text-xs font-medium ${
                      item.active
                        ? "bg-indigo-600 text-white"
                        : "text-slate-400"
                    }`}
                  >
                    {item.label}
                  </div>
                ))}
              </div>
              {/* Main content preview */}
              <div className="flex-1 p-4 bg-slate-900/40">
                <div className="text-slate-300 text-sm font-semibold mb-3">Good morning, Developer</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                  {["5 Tasks", "12 Notes", "28 Links"].map((item) => (
                    <div key={item} className="bg-slate-800/60 rounded-lg p-2">
                      <div className="text-white text-sm font-bold">{item.split(" ")[0]}</div>
                      <div className="text-slate-500 text-xs">{item.split(" ")[1]}</div>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  {["Fix auth bug", "Write API docs", "Deploy to Vercel"].map((task, i) => (
                    <div key={task} className="flex items-center gap-2 bg-slate-800/40 rounded-lg px-3 py-2">
                      <div className={`w-2 h-2 rounded-full ${i === 0 ? "bg-red-400" : i === 1 ? "bg-yellow-400" : "bg-green-400"}`} />
                      <span className="text-slate-300 text-xs">{task}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Everything a beginner developer needs
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Stop context switching. DevFlow AI keeps all your development essentials in one clean interface.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 transition-all hover:-translate-y-1"
              >
                <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4`}>
                  {feature.icon}
                </div>
                <h3 className="text-white font-semibold text-base mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-gradient-to-br from-indigo-600/20 to-violet-600/20 border border-indigo-500/20 rounded-3xl p-10">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to level up your dev workflow?
            </h2>
            <p className="text-slate-400 mb-8">
              Join indie developers who use DevFlow AI to ship faster and stay organized.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors shadow-lg shadow-indigo-500/25"
            >
              Create Free Account
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-slate-800">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-slate-400 text-sm">DevFlow AI</span>
          </div>
          <p className="text-slate-600 text-sm">
            Built for indie developers. Free to start.
          </p>
        </div>
      </footer>
    </div>
  );
}
