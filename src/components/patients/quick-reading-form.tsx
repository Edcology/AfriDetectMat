"use client";

import { useActionState } from "react";
import { logReading } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/form";
import { idleState } from "@/lib/action-state";

export function QuickReadingForm({ patients }: { patients: { id: string; name: string }[] }) {
  const [state, formAction, pending] = useActionState(logReading, idleState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-4">
        <div className="min-w-[200px] flex-1">
          <label htmlFor="quick-patient" className="mb-2 block text-[12px] font-medium text-ink-soft">
            Patient
          </label>
          <Select id="quick-patient" name="patientId" defaultValue={patients[0]?.id}>
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.name} · {patient.id}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <label htmlFor="quick-systolic" className="mb-2 block text-[12px] font-medium text-ink-soft">
            Systolic, mmHg
          </label>
          <Input id="quick-systolic" name="systolic" type="number" min={60} max={260} placeholder="162" className="w-[160px]" required />
        </div>
        <div>
          <label htmlFor="quick-diastolic" className="mb-2 block text-[12px] font-medium text-ink-soft">
            Diastolic, mmHg
          </label>
          <Input id="quick-diastolic" name="diastolic" type="number" min={30} max={160} placeholder="108" className="w-[160px]" required />
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? "Checking…" : "Check reading"}
        </Button>
      </div>
      {state.status !== "idle" && state.message ? (
        <p
          className={`rounded-[8px] px-4 py-3 text-[13px] ${
            state.status === "error"
              ? "bg-danger-soft text-danger"
              : /severe/i.test(state.message)
                ? "bg-danger-soft text-danger"
                : /raised/i.test(state.message)
                  ? "bg-warn-soft text-warn"
                  : "bg-success-soft text-success"
          }`}
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
