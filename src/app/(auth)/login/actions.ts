"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";

export interface AuthFormState {
  error?: string;
}

export async function signIn(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) return { error: "Enter your email and password." };

  const { error } = await auth.signIn.email({ email, password });
  if (error) return { error: "Those details did not match an account." };

  redirect("/");
}

export async function signUp(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const name = String(formData.get("name") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !name || !password) return { error: "Fill in every field." };
  if (password.length < 10) return { error: "Use at least 10 characters." };
  if (!email.endsWith("@harbour.health"))
    return { error: "Clinician accounts must use a @harbour.health address." };

  const { error } = await auth.signUp.email({ email, name, password });
  if (error) return { error: error.message || "Could not create the account." };

  redirect("/");
}
