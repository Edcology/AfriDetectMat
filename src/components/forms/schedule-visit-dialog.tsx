"use client";

import { useActionState, useEffect, useState } from "react";
import { scheduleAppointment } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { Modal } from "@/components/ui/overlay";
import { idleState } from "@/lib/action-state";

export function ScheduleVisitButton({
  patients,
  clinicians,
  defaultPatientId,
  label = "Schedule visit",
  variant = "secondary",
}: {
  patients: { id: string; name: string }[];
  clinicians: { id: string; name: string }[];
  defaultPatientId?: string;
  label?: string;
  variant?: "primary" | "secondary";
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(scheduleAppointment, idleState);

  useEffect(() => {
    if (state.status === "success") setOpen(false);
  }, [state]);

  return (
    <>
      <Button variant={variant} onClick={() => setOpen(true)}>
        {label}
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Schedule a visit"
        description="The visit appears on the shared calendar and in the patient's record."
        footer={
          <>
            <Button variant="secondary" type="button" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="schedule-visit-form" disabled={pending}>
              {pending ? "Booking…" : "Confirm visit"}
            </Button>
          </>
        }
      >
        <form id="schedule-visit-form" action={formAction} className="flex flex-col gap-4">
          <Field label="Patient" htmlFor="patientId">
            <Select id="patientId" name="patientId" defaultValue={defaultPatientId ?? patients[0]?.id}>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.name} · {patient.id}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Reason for visit" htmlFor="reason">
            <Textarea id="reason" name="reason" placeholder="Urgent BP review, antenatal visit, growth scan…" required />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Date" htmlFor="date">
              <Input id="date" name="date" type="date" defaultValue="2026-11-18" required />
            </Field>
            <Field label="Time" htmlFor="time">
              <Input id="time" name="time" type="time" defaultValue="09:00" required />
            </Field>
          </div>
          <Field label="Clinician" htmlFor="clinicianId">
            <Select id="clinicianId" name="clinicianId" defaultValue={clinicians[0]?.id}>
              {clinicians.map((clinician) => (
                <option key={clinician.id} value={clinician.id}>
                  {clinician.name}
                </option>
              ))}
            </Select>
          </Field>

          {state.status === "error" ? (
            <p className="rounded-[8px] bg-danger-soft px-4 py-3 text-[13px] text-danger">{state.message}</p>
          ) : null}
          {state.status === "success" ? (
            <p className="rounded-[8px] bg-success-soft px-4 py-3 text-[13px] text-success">{state.message}</p>
          ) : null}
        </form>
      </Modal>
    </>
  );
}
