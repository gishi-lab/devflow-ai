"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthState = {
  error?: string;
  fieldErrors?: {
    name?: string;
    email?: string;
    password?: string;
  };
  success?: boolean;
};

// ─── Sign In ──────────────────────────────────────────────────────────────────

export async function signIn(
  _prevState: AuthState | undefined,
  formData: FormData
): Promise<AuthState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // Basic field validation
  const fieldErrors: AuthState["fieldErrors"] = {};
  if (!email || !email.includes("@")) {
    fieldErrors.email = "Please enter a valid email address.";
  }
  if (!password || password.length < 6) {
    fieldErrors.password = "Password must be at least 6 characters.";
  }
  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "Invalid email or password. Please try again." };
  }

  redirect("/dashboard");
}

// ─── Sign Up ──────────────────────────────────────────────────────────────────

export async function signUp(
  _prevState: AuthState | undefined,
  formData: FormData
): Promise<AuthState> {
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;

  // Field validation
  const fieldErrors: AuthState["fieldErrors"] = {};
  if (!name || name.length < 2) {
    fieldErrors.name = "Name must be at least 2 characters.";
  }
  if (!email || !email.includes("@")) {
    fieldErrors.email = "Please enter a valid email address.";
  }
  if (!password || password.length < 8) {
    fieldErrors.password = "Password must be at least 8 characters.";
  }
  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Store display name in user_metadata so it's available immediately
      data: { full_name: name, display_name: name },
      // After email confirmation the user lands back in the app
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes("already registered")) {
      return {
        fieldErrors: { email: "This email is already registered. Try signing in." },
      };
    }
    return { error: error.message };
  }

  // Supabase sends a confirmation email; let the user know.
  return { success: true };
}

// ─── Sign Out ─────────────────────────────────────────────────────────────────

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
