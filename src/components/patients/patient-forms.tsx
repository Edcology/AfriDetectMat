"use client";

import { useActionState, useEffect, useState } from "react";
import { Activity, ClipboardPlus } from "lucide-react";
import { addNote, logReading, sendReferral, updateCarePlan } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { Modal } from "@/components/ui/overlay";
import { idleState } from "@/lib/action-state";

function Feedback({ state }: { state: { status: string; message?: string } }) {
  if (state.status === "idle" || !state.message) return null;
  return (
    <p
      className={`rounded-[8px] px-4 py-3 text-[13px] leading-[17px] ${
        state.status === "error" ? "bg-danger-soft text-danger" : "bg-success-soft text-success"
      }`}
    >
      {state.message}
    </p>
  );
}

export function NoteForm({ patientId }: { patientId: string }) {
  const [state, formAction, pending] = useActionState(addNote, idleState);
  const [value, setValue] = useState("");

  useEffect(() => {
    if (state.status === "success") setValue("");
  }, [state]);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="patientId" value={patientId} />
      <Textarea
        name="body"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Add a clinical note — findings, plan, counselling given…"
        className="min-h-20"
      />
      <div className="flex items-center justify-between gap-4">
        <Feedback state={state} />
        <Button type="submit" size="sm" disabled={pending} className="ml-auto">
          {pending ? "Saving…" : "Save note"}
        </Button>
      </div>
    </form>
  );
}

export function CarePlanForm({ patientId, plan }: { patientId: string; plan: string }) {
  const [state, formAction, pending] = useActionState(updateCarePlan, idleState);
  const [value, setValue] = useState(plan);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="patientId" value={patientId} />
      <Textarea name="plan" value={value} onChange={(event) => setValue(event.target.value)} className="min-h-28" />
      <div className="flex items-center justify-between gap-4">
        <Feedback state={state} />
        <Button type="submit" size="sm" variant="secondary" disabled={pending} className="ml-auto">
          {pending ? "Saving…" : "Update care plan"}
        </Button>
      </div>
    </form>
  );
}

export function LogReadingButton({
  patients,
  defaultPatientId,
  label = "Log reading",
  variant = "primary",
}: {
  patients: { id: string; name: string }[];
  defaultPatientId?: string;
  label?: string;
  variant?: "primary" | "secondary";
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(logReading, idleState);

  useEffect(() => {
    if (state.status === "success") setOpen(false);
  }, [state]);

  return (
    <>
      <Button variant={variant} onClick={() => setOpen(true)}>
        <Activity size={16} strokeWidth={1.8} aria-hidden />
        {label}
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Log a blood pressure reading"
        description="Clinician-verified readings feed the screening protocol immediately."
        footer={
          <>
            <Button variant="secondary" type="button" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="log-reading-form" disabled={pending}>
              {pending ? "Saving…" : "Save reading"}
            </Button>
          </>
        }
      >
        <form id="log-reading-form" action={formAction} className="flex flex-col gap-4">
          <Field label="Patient" htmlFor="reading-patient">
            <Select id="reading-patient" name="patientId" defaultValue={defaultPatientId ?? patients[0]?.id}>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.name} · {patient.id}
                </option>
              ))}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Systolic (mmHg)" htmlFor="systolic">
              <Input id="systolic" name="systolic" type="number" min={60} max={260} placeholder="120" required />
            </Field>
            <Field label="Diastolic (mmHg)" htmlFor="diastolic">
              <Input id="diastolic" name="diastolic" type="number" min={30} max={160} placeholder="80" required />
            </Field>
          </div>
          <Feedback state={state} />
        </form>
      </Modal>
    </>
  );
}

export function SendReferralButton({
  patients,
  defaultPatientId,
  label = "Create referral",
}: {
  patients: { id: string; name: string }[];
  defaultPatientId?: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(sendReferral, idleState);

  useEffect(() => {
    if (state.status === "success") setOpen(false);
  }, [state]);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <ClipboardPlus size={16} strokeWidth={1.8} aria-hidden />
        {label}
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Send a referral"
        description="Referrals are shared with the receiving facility and tracked on the referrals board."
        footer={
          <>
            <Button variant="secondary" type="button" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="referral-form" disabled={pending}>
              {pending ? "Sending…" : "Send referral"}
            </Button>
          </>
        }
      >
        <form id="referral-form" action={formAction} className="flex flex-col gap-4">
          <Field label="Patient" htmlFor="referral-patient">
            <Select id="referral-patient" name="patientId" defaultValue={defaultPatientId ?? patients[0]?.id}>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.name} · {patient.id}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Receiving facility" htmlFor="destination">
            <Input id="destination" name="destination" placeholder="Lagos University Teaching Hospital · Obstetric unit" required />
          </Field>
          <Field label="Clinical reason" htmlFor="reason">
            <Textarea id="reason" name="reason" placeholder="Suspected pre-eclampsia, needs specialist review within 24 hours" required />
          </Field>
          <Field label="Urgency" htmlFor="urgency">
            <Select id="urgency" name="urgency" defaultValue="urgent">
              <option value="urgent">Urgent — within 24 hours</option>
              <option value="routine">Routine</option>
            </Select>
          </Field>
          <Feedback state={state} />
        </form>
      </Modal>
    </>
  );
}

export function SessionBadge() {
  return (
    <span className="inline-flex items-center gap-2 rounded-pill bg-brand-mist px-3 py-2 text-[12px] leading-[15px] text-brand-deep">
      Live record
    </span>
  );
}
