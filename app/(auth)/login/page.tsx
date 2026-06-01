import Link from "next/link";
import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Sign In – DevFlow AI",
  description: "Sign in to your DevFlow AI account.",
};

export default function LoginPage() {
  return (
    <div className="min-h-full flex bg-slate-950">
      {/* Left panel – branding */}
      <div className="hidden lg:flex lg:flex-1 flex-col justify-between p-12 bg-slate-900 border-r border-slate-800">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-white font-bold text-lg">DevFlow AI</span>
        </Link>

        <div>
          <blockquote className="text-slate-300 text-xl leading-relaxed font-light mb-6">
            &ldquo;The best tool I found as a beginner developer. Everything I need is in one place.&rdquo;
          </blockquote>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center text-indigo-400 font-bold text-sm">
              AK
            </div>
            <div>
              <div className="text-white text-sm font-medium">Alex Kim</div>
              <div className="text-slate-500 text-sm">Indie Developer</div>
            </div>
          </div>
        </div>

        <div className="text-slate-600 text-sm">© 2024 DevFlow AI. All rights reserved.</div>
      </div>

      {/* Right panel – form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 xl:px-24">
        {/* Mobile logo */}
        <div className="lg:hidden mb-10">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-white font-bold text-lg">DevFlow AI</span>
          </Link>
        </div>

        <div className="w-full max-w-sm mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">Welcome back</h1>
            <p className="text-slate-400">Sign in to your DevFlow AI workspace</p>
          </div>

          <LoginForm />

          <p className="text-center text-slate-500 text-sm mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
              Sign up for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
