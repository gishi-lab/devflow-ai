"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { signIn, type AuthState } from "@/app/actions/auth";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-4 rounded-xl transition-colors text-sm shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
    >
      {pending && (
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      )}
      {pending ? "Signing in…" : "Sign in"}
    </button>
  );
}

export function LoginForm() {
  const [state, action] = useActionState<AuthState | undefined, FormData>(
    signIn,
    undefined
  );

  return (
    <form action={action} className="space-y-4">
      {/* Global error */}
      {state?.error && (
        <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">
          <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {state.error}
        </div>
      )}

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1.5">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm ${
            state?.fieldErrors?.email ? "border-red-500" : "border-slate-700"
          }`}
        />
        {state?.fieldErrors?.email && (
          <p className="text-red-400 text-xs mt-1">{state.fieldErrors.email}</p>
        )}
      </div>

      {/* Password */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label htmlFor="password" className="block text-sm font-medium text-slate-300">
            Password
          </label>
          <a href="/forgot-password" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
            Forgot password?
          </a>
        </div>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
          className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm ${
            state?.fieldErrors?.password ? "border-red-500" : "border-slate-700"
          }`}
        />
        {state?.fieldErrors?.password && (
          <p className="text-red-400 text-xs mt-1">{state.fieldErrors.password}</p>
        )}
      </div>

      <SubmitButton />

      <div className="relative my-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-800" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-slate-950 px-2 text-slate-500">or</span>
        </div>
      </div>

      <button
        type="button"
        className="w-full flex items-center justify-center gap-3 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 hover:border-slate-600 font-medium py-2.5 px-4 rounded-xl transition-all text-sm"
        onClick={() => alert("Google OAuth — connect in Supabase Dashboard → Auth → Providers")}
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        Continue with Google
      </button>
    </form>
  );
}
