"use client";

import { useActionState, useEffect, useState } from "react";
import { Check } from "lucide-react";
import { submitCheckIn } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { idleState } from "@/lib/action-state";
import { feelings, symptoms } from "@/lib/mother-data";
import { cn } from "@/lib/utils";

export function CheckInForm() {
  const [state, formAction, pending] = useActionState(submitCheckIn, idleState);
  const [feeling, setFeeling] = useState<string>("good");
  const [picked, setPicked] = useState<string[]>([]);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (state.status === "success") {
      setPicked([]);
      setNote("");
    }
  }, [state]);

  if (state.status === "success") {
    return (
      <div className="rounded-[16px] border border-line bg-white px-8 py-10 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-success-soft text-success">
          <Check size={22} />
        </span>
        <h2 className="mt-4 text-[20px] leading-[26px] font-semibold text-ink">Thank you for checking in</h2>
        <p className="mx-auto mt-2 max-w-md text-[14px] leading-[20px] text-ink-soft">{state.message}</p>
        <div className="mt-6 flex justify-center gap-3">
          <Button variant="secondary" onClick={() => window.location.reload()}>
            Check in again
          </Button>
          <a
            href="/mother"
            className="inline-flex h-[42px] items-center rounded-[8px] bg-brand px-6 text-[16px] font-medium text-white"
          >
            Back home
          </a>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="rounded-[16px] border border-line bg-white px-6 py-6">
      <input type="hidden" name="feeling" value={feeling} />
      {picked.map((symptom) => (
        <input key={symptom} type="hidden" name="symptoms" value={symptom} />
      ))}

      <div className="flex gap-4">
        <span className="grid size-8 shrink-0 place-items-center rounded-[8px] bg-brand-mist text-[12px] font-semibold text-brand-deep">
          01
        </span>
        <div className="flex-1">
          <p className="text-[16px] leading-[20px] font-medium text-ink">How would you describe today?</p>
          <p className="mt-1 text-[13px] text-ink-soft">Choose the option that feels closest to how you are right now.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {feelings.map((option) => {
              const active = feeling === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setFeeling(option.id)}
                  aria-pressed={active}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-[12px] border px-3 py-4 transition-colors",
                    active ? "border-brand bg-brand-mist" : "border-line bg-white hover:border-line"
                  )}
                >
                  <span className="text-[22px]" aria-hidden>
                    {option.emoji}
                  </span>
                  <span className="text-[14px] font-medium text-ink">{option.label}</span>
                  <span className="text-[11px] text-muted">{option.hint}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-8 flex gap-4">
        <span className="grid size-8 shrink-0 place-items-center rounded-[8px] bg-brand-mist text-[12px] font-semibold text-brand-deep">
          02
        </span>
        <div className="flex-1">
          <p className="text-[16px] leading-[20px] font-medium text-ink">Anything you&apos;d like to tell us?</p>
          <p className="mt-1 text-[13px] text-ink-soft">
            Select any symptoms or changes you want your care team to know about.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {symptoms.map((symptom) => {
              const active = picked.includes(symptom.id);
              return (
                <button
                  key={symptom.id}
                  type="button"
                  onClick={() =>
                    setPicked((current) =>
                      current.includes(symptom.id) ? current.filter((id) => id !== symptom.id) : [...current, symptom.id]
                    )
                  }
                  aria-pressed={active}
                  className={cn(
                    "flex items-center gap-3 rounded-[8px] border px-4 py-3 text-left transition-colors",
                    active ? "border-brand bg-brand-mist" : "border-line bg-white hover:bg-[#fbfcfb]"
                  )}
                >
                  <span
                    className={cn(
                      "grid size-5 shrink-0 place-items-center rounded-[4px] border",
                      active ? "border-brand bg-brand text-white" : "border-line bg-white"
                    )}
                  >
                    {active ? <Check size={12} strokeWidth={3} /> : null}
                  </span>
                  <span className="text-[14px] text-ink">{symptom.label}</span>
                </button>
              );
            })}
          </div>

          <label htmlFor="note" className="mt-6 block text-[14px] font-medium text-ink">
            Add a note (optional)
          </label>
          <textarea
            id="note"
            name="note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={4}
            className="mt-2 w-full resize-y rounded-[8px] border border-line px-4 py-3 text-[14px] text-ink placeholder:text-muted focus:border-brand-accent focus:outline-none"
            placeholder="Anything else you want your care team to know?"
          />
        </div>
      </div>

      <div className="mt-8 rounded-[12px] bg-[#f1f5f2] px-4 py-3">
        <p className="text-[12px] font-medium text-ink-soft">Review</p>
        <p className="mt-1 text-[13px] text-ink">
          Feeling: {feelings.find((option) => option.id === feeling)?.label}
          {picked.length > 0
            ? ` · Symptoms: ${picked.map((id) => symptoms.find((s) => s.id === id)?.label).join(", ")}`
            : " · No symptoms selected"}
        </p>
      </div>

      {state.status === "error" ? (
        <p className="mt-4 rounded-[8px] bg-danger-soft px-4 py-3 text-[13px] text-danger">{state.message}</p>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Sending…" : "Send check-in"}
        </Button>
        <span className="text-[12px] text-muted">Your care team reviews check-ins during working hours.</span>
      </div>
    </form>
  );
}
