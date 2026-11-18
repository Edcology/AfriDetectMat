"use server";

import { auth } from "@/lib/auth/server";

export interface AuthFormState {
  error?: string;
  ok?: boolean;
}

/**
 * One action for both forms, branching on a hidden `intent`. Binding a single
 * action avoids the `useActionState` footgun where a reused component keeps the
 * action it mounted with after a client-side navigation between ?mode=signup
 * and /login.
 */
export async function authenticate(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const intent = String(formData.get("intent") ?? "signin");
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const name = String(formData.get("name") ?? "").trim();

  if (!email) return { error: "Enter your work email." };
  if (!password) return { error: "Enter your password." };

  if (intent === "signup") {
    if (!name) return { error: "Enter your full name." };
    if (password.length < 10) return { error: "Use a password of at least 10 characters." };
    if (!email.endsWith("@harbour.health"))
      return { error: "Clinician accounts must use a @harbour.health address." };

    const { error } = await auth.signUp.email({ email, name, password });
    if (error) return { error: error.message || "Could not create the account." };
  } else {
    const { error } = await auth.signIn.email({ email, password });
    if (error) return { error: "Those details did not match an account." };
  }

  // Return success rather than redirecting: the session cookies must be
  // committed before the browser navigates, otherwise the clinic layout can
  // evaluate getSession against the previous (cookie-less) request and bounce
  // straight back to /login.
  return { ok: true };
}
