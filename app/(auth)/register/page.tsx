import Link from "next/link";
import type { Metadata } from "next";
import { RegisterForm } from "./RegisterForm";

export const metadata: Metadata = {
  title: "Create Account – DevFlow AI",
  description: "Create your free DevFlow AI account.",
};

export default function RegisterPage() {
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

        <div className="space-y-6">
          {[
            "Manage your dev tasks with ease",
            "Save notes and build your glossary",
            "Organize useful links and resources",
            "Chat with an AI that understands code",
          ].map((item) => (
            <div key={item} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 flex-shrink-0">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-slate-300 text-sm">{item}</span>
            </div>
          ))}
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
            <h1 className="text-2xl font-bold text-white mb-2">Create your account</h1>
            <p className="text-slate-400">Free forever. No credit card required.</p>
          </div>

          <RegisterForm />

          <p className="text-center text-slate-500 text-sm mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>

          <p className="text-center text-slate-600 text-xs mt-4">
            By creating an account, you agree to our{" "}
            <Link href="/terms" className="hover:text-slate-400 transition-colors underline">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="hover:text-slate-400 transition-colors underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
