"use client";

import { useActionState } from "react";
import { Check } from "lucide-react";
import { saveMotherProfile } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { idleState } from "@/lib/action-state";
import type { MotherProfile } from "@/lib/mother-types";

export function ProfileForm({ profile }: { profile: MotherProfile }) {
  const [state, formAction, pending] = useActionState(saveMotherProfile, idleState);

  return (
    <form action={formAction} className="rounded-[16px] border border-line bg-white px-6 py-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2 sm:col-span-2">
          <span className="text-[12px] font-medium text-ink-soft">Full name</span>
          <input
            name="name"
            defaultValue={profile.name}
            required
            className="h-[42px] rounded-[8px] border border-line px-4 text-[14px] text-ink focus:border-brand-accent focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-[12px] font-medium text-ink-soft">Phone number</span>
          <input
            name="phone"
            defaultValue={profile.phone}
            required
            className="h-[42px] rounded-[8px] border border-line px-4 text-[14px] text-ink focus:border-brand-accent focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-[12px] font-medium text-ink-soft">Next of kin (optional)</span>
          <input
            name="nextOfKin"
            defaultValue={profile.nextOfKin}
            placeholder="Name and phone number"
            className="h-[42px] rounded-[8px] border border-line px-4 text-[14px] text-ink placeholder:text-muted focus:border-brand-accent focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-2 sm:col-span-2">
          <span className="text-[12px] font-medium text-ink-soft">Address</span>
          <input
            name="address"
            defaultValue={profile.address}
            required
            className="h-[42px] rounded-[8px] border border-line px-4 text-[14px] text-ink focus:border-brand-accent focus:outline-none"
          />
        </label>
      </div>

      <label className="mt-5 flex items-start gap-3 rounded-[12px] bg-[#f1f5f2] px-4 py-3">
        <input
          type="checkbox"
          name="consentShare"
          defaultChecked={profile.consentShare}
          className="mt-0.5 size-4 rounded-[4px] border border-line accent-[#0B4F4A]"
        />
        <span className="text-[12px] leading-[18px] text-ink-soft">
          I agree that my care team at Harbour Health Centre can see my pregnancy record. I can change this at any time.
        </span>
      </label>

      {state.status !== "idle" && state.message ? (
        <p
          className={`mt-4 flex items-center gap-2 rounded-[8px] px-4 py-3 text-[13px] ${
            state.status === "error" ? "bg-danger-soft text-danger" : "bg-success-soft text-success"
          }`}
        >
          {state.status === "success" ? <Check size={14} /> : null}
          {state.message}
        </p>
      ) : null}

      <div className="mt-5 flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : profile.setupComplete ? "Save details" : "Set up my profile"}
        </Button>
        {profile.setupComplete ? (
          <span className="text-[12px] text-muted">Saved to your facility record.</span>
        ) : (
          <span className="text-[12px] text-muted">Takes about a minute.</span>
        )}
      </div>
    </form>
  );
}
