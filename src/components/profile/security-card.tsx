"use client";

import { useActionState, useState } from "react";
import { KeyRound, LogOut, ShieldCheck, Smartphone, X } from "lucide-react";
import { changePassword, signOut } from "@/app/(clinic)/profile/actions";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";
import { idleState } from "@/lib/action-state";

export interface SessionInfo {
  createdAt?: string;
  expiresAt?: string;
  userAgent?: string | null;
}

function when(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function PasswordDialog({ onClose }: { onClose: () => void }) {
  const [state, formAction, pending] = useActionState(changePassword, idleState);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close dialog"
        onClick={onClose}
        className="animate-fade absolute inset-0 cursor-default bg-[#182522]/55"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Change password"
        className="animate-pop relative w-full max-w-[420px] rounded-[16px] border border-line bg-white p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-[18px] font-semibold text-ink">Change password</h2>
            <p className="mt-1 text-[13px] text-ink-soft">Use at least 10 characters.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="focus-ring grid size-8 place-items-center rounded-[8px] text-ink-soft hover:bg-surface-muted"
          >
            <X size={16} />
          </button>
        </div>

        <form action={formAction} className="mt-5 flex flex-col gap-4">
          <Field label="Current password" htmlFor="currentPassword">
            <Input id="currentPassword" name="currentPassword" type="password" autoComplete="current-password" required />
          </Field>
          <Field label="New password" htmlFor="newPassword">
            <Input id="newPassword" name="newPassword" type="password" autoComplete="new-password" required />
          </Field>
          <Field label="Confirm new password" htmlFor="confirmPassword">
            <Input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required />
          </Field>

          {state.status !== "idle" && state.message ? (
            <p
              className={`rounded-[8px] px-4 py-3 text-[13px] ${
                state.status === "error" ? "bg-danger-soft text-danger" : "bg-success-soft text-success"
              }`}
            >
              {state.message}
            </p>
          ) : null}

          <div className="mt-1 flex items-center justify-end gap-3">
            <Button variant="secondary" type="button" onClick={onClose}>
              Close
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Change password"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function SecurityCard({ session }: { session: SessionInfo }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="rounded-card border border-line bg-white px-6 py-5">
        <h2 className="card-title">Security</h2>

        <div className="mt-4 flex flex-col gap-4">
          <div className="flex items-center gap-3 border-b border-line-soft pb-3">
            <span className="grid size-9 place-items-center rounded-full bg-surface-muted text-ink-soft">
              <KeyRound size={16} />
            </span>
            <div className="flex-1">
              <p className="text-[14px] font-medium text-ink">Password</p>
              <p className="text-[12px] text-muted">Used with your work email to sign in</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="focus-ring rounded-[6px] text-[12px] font-medium text-brand hover:underline"
            >
              Change
            </button>
          </div>

          <div className="flex items-center gap-3 border-b border-line-soft pb-3">
            <span className="grid size-9 place-items-center rounded-full bg-surface-muted text-ink-soft">
              <Smartphone size={16} />
            </span>
            <div className="flex-1">
              <p className="text-[14px] font-medium text-ink">Two-factor authentication</p>
              <p className="text-[12px] text-muted">
                Not available yet — Managed Better Auth ships MFA on its roadmap. Until then, access is limited to
                `@harbour.health` accounts.
              </p>
            </div>
            <span className="rounded-pill bg-warn-soft px-2.5 py-1 text-[11px] text-warn">Pending</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-full bg-surface-muted text-ink-soft">
              <ShieldCheck size={16} />
            </span>
            <div className="flex-1">
              <p className="text-[14px] font-medium text-ink">This session</p>
              <p className="text-[12px] text-muted">
                Signed in {when(session.createdAt)} · expires {when(session.expiresAt)}
              </p>
            </div>
            <form action={signOut}>
              <button
                type="submit"
                className="focus-ring inline-flex items-center gap-1 rounded-[6px] text-[12px] font-medium text-danger hover:underline"
              >
                <LogOut size={12} /> Sign out
              </button>
            </form>
          </div>
        </div>
      </div>

      {open ? <PasswordDialog onClose={() => setOpen(false)} /> : null}
    </>
  );
}
