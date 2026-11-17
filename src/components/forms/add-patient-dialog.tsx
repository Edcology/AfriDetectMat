"use client";

import { useActionState, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { createPatient } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { Modal } from "@/components/ui/overlay";
import { idleState } from "@/lib/action-state";

export function AddPatientButton({
  clinicians,
  label = "Add patient",
  variant = "primary",
}: {
  clinicians: { id: string; name: string }[];
  label?: string;
  variant?: "primary" | "secondary";
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(createPatient, idleState);

  useEffect(() => {
    if (state.status === "success") setOpen(false);
  }, [state]);

  return (
    <>
      <Button variant={variant} onClick={() => setOpen(true)}>
        <Plus size={16} strokeWidth={2} aria-hidden />
        {label}
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Register patient"
        description="Booking details create the antenatal record and start the check-in schedule."
        size="lg"
        footer={
          <>
            <Button variant="secondary" type="button" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="add-patient-form" disabled={pending}>
              {pending ? "Registering…" : "Register patient"}
            </Button>
          </>
        }
      >
        <form id="add-patient-form" action={formAction} className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" htmlFor="name" className="sm:col-span-2">
              <Input id="name" name="name" placeholder="e.g. Halima Yusuf" required />
            </Field>
            <Field label="Age" htmlFor="age">
              <Input id="age" name="age" type="number" min={12} max={60} placeholder="27" required />
            </Field>
            <Field label="Phone number" htmlFor="phone">
              <Input id="phone" name="phone" placeholder="+234 80 0000 0000" required />
            </Field>
            <Field label="Gestational weeks" htmlFor="weeks">
              <Input id="weeks" name="weeks" type="number" min={0} max={42} defaultValue={20} required />
            </Field>
            <Field label="Days" htmlFor="days">
              <Input id="days" name="days" type="number" min={0} max={6} defaultValue={0} />
            </Field>
            <Field label="Estimated delivery" htmlFor="edd">
              <Input id="edd" name="edd" placeholder="e.g. 12 Mar 2027" />
            </Field>
            <Field label="Assigned clinician" htmlFor="clinicianId">
              <Select id="clinicianId" name="clinicianId" defaultValue={clinicians[0]?.id}>
                {clinicians.map((clinician) => (
                  <option key={clinician.id} value={clinician.id}>
                    {clinician.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="First reading — systolic" htmlFor="systolic" hint="Optional. Recorded as clinician-verified.">
              <Input id="systolic" name="systolic" type="number" min={60} max={260} placeholder="120" />
            </Field>
            <Field label="First reading — diastolic" htmlFor="diastolic">
              <Input id="diastolic" name="diastolic" type="number" min={30} max={160} placeholder="80" />
            </Field>
          </div>
          <Field label="Relevant history" htmlFor="history">
            <Textarea id="history" name="history" placeholder="G2P1, previous pre-eclampsia, allergies…" />
          </Field>

          {state.status === "error" ? (
            <p className="rounded-[8px] bg-danger-soft px-4 py-3 text-[13px] text-danger">{state.message}</p>
          ) : null}
        </form>
      </Modal>
    </>
  );
}
