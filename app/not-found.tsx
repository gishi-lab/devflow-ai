import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-full flex flex-col items-center justify-center bg-slate-950 px-4">
      <div className="text-center">
        <div className="text-8xl font-black text-slate-800 mb-4">404</div>
        <h1 className="text-2xl font-bold text-white mb-2">Page not found</h1>
        <p className="text-slate-400 mb-8 max-w-sm">
          Looks like this page doesn&apos;t exist. Let&apos;s get you back on track.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/"
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-5 py-2.5 rounded-xl transition-colors text-sm"
          >
            Go home
          </Link>
          <Link
            href="/dashboard"
            className="border border-slate-700 hover:border-slate-600 text-slate-300 font-medium px-5 py-2.5 rounded-xl transition-colors text-sm"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
