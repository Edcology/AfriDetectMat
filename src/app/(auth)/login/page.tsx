import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { HeartPulse, ShieldCheck } from "lucide-react";
import { AuthForm } from "./auth-form";
import { auth } from "@/lib/auth/server";

export const instant = false;
export const metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  await connection();
  const { data } = await auth.getSession();
  if (data?.user) redirect("/");

  const { mode } = await searchParams;
  const isSignup = mode === "signup";

  return (
    <div className="grid min-h-dvh lg:grid-cols-[1fr_1.05fr]">
      <div className="flex flex-col justify-center px-6 py-12 sm:px-16">
        <Link href="/" className="text-[20px] leading-[25px] font-bold text-ink">
          AfriDetect Mat
        </Link>

        <div className="mt-10 w-full max-w-[400px]">
          <h1 className="text-[28px] leading-[36px] font-semibold tracking-[-0.28px] text-ink">
            {isSignup ? "Create your clinician account" : "Sign in to your workspace"}
          </h1>
          <p className="mt-2 text-[14px] leading-[20px] text-ink-soft">
            {isSignup
              ? "Use your Harbour Health Centre email. The facility admin can change your role later."
              : "Maternal care records for Harbour Health Centre."}
          </p>

          <div className="mt-8">
            <AuthForm key={mode ?? "signin"} mode={isSignup ? "signup" : "signin"} />
          </div>

          <p className="mt-6 flex items-center gap-2 text-[12px] text-muted">
            <ShieldCheck size={14} /> Every sign-in and record view is written to the audit trail.
          </p>
        </div>
      </div>

      <div className="relative hidden overflow-hidden bg-brand lg:block">
        <span className="pointer-events-none absolute -right-24 -top-32 size-96 rounded-full bg-[#266f6a]" />
        <span className="pointer-events-none absolute -left-32 bottom-0 size-96 rounded-full bg-[#266f6a] opacity-70" />
        <div className="relative flex h-full flex-col justify-center px-16 text-white">
          <HeartPulse size={28} />
          <p className="mt-6 max-w-[420px] text-[34px] leading-[42px] font-semibold tracking-[-0.34px]">
            One record, two windows — the clinic and the mother.
          </p>
          <p className="mt-4 max-w-[420px] text-[15px] leading-[24px] text-white/80">
            A check-in she sends at home reaches the right clinician before the end of the day. Every reading is screened,
            every flag is acknowledged by a named member of staff.
          </p>
          <div className="mt-8 flex flex-col gap-2 text-[12px] text-white/60">
            <span>· Protocol A hypertension screening</span>
            <span>· Consent-scoped record sharing</span>
            <span>· 7-year audit retention</span>
          </div>
        </div>
      </div>
    </div>
  );
}
