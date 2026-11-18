"use client";

import Link from "next/link";
import { useActionState } from "react";
import { AlertCircle } from "lucide-react";
import { signIn, signUp, type AuthFormState } from "./actions";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";

const initial: AuthFormState = {};

export function AuthForm({ mode }: { mode: "signin" | "signup" }) {
  const [state, formAction, pending] = useActionState(mode === "signin" ? signIn : signUp, initial);
  const isSignup = mode === "signup";

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {isSignup ? (
        <Field label="Full name" htmlFor="name">
          <Input id="name" name="name" autoComplete="name" placeholder="Dr. Adika Nwosu" required />
        </Field>
      ) : null}

      <Field label="Work email" htmlFor="email">
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@harbour.health"
          defaultValue={isSignup ? "" : "adika.nwosu@harbour.health"}
          required
        />
      </Field>

      <Field label="Password" htmlFor="password" hint={isSignup ? "At least 10 characters." : undefined}>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete={isSignup ? "new-password" : "current-password"}
          placeholder="••••••••••"
          required
        />
      </Field>

      {state.error ? (
        <p className="flex items-start gap-2 rounded-[8px] bg-danger-soft px-4 py-3 text-[13px] text-danger">
          <AlertCircle size={15} className="mt-0.5 shrink-0" />
          {state.error}
        </p>
      ) : null}

      <Button type="submit" disabled={pending} className="mt-2 w-full">
        {pending ? (isSignup ? "Creating account…" : "Signing in…") : isSignup ? "Create account" : "Sign in"}
      </Button>

      <p className="text-center text-[13px] text-ink-soft">
        {isSignup ? (
          <>
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-brand hover:underline">
              Sign in
            </Link>
          </>
        ) : (
          <>
            First time here?{" "}
            <Link href="/login?mode=signup" className="font-medium text-brand hover:underline">
              Create your clinician account
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
