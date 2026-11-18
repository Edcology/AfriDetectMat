import { toTermiiNumber } from "@/lib/phone";

export type OtpChannel = "console" | "email" | "termii";

const channel = (process.env.OTP_CHANNEL ?? "console").toLowerCase() as OtpChannel;

/**
 * Delivery is deliberately separated from generation: Better Auth mints and
 * verifies the code, this module only carries it. Swapping channel is one env
 * var (`OTP_CHANNEL`) and no application change.
 *
 * - console  ships today; the code is printed to the server log
 * - email    used when a mother has an address and RESEND_API_KEY is set
 * - termii   left in place for when the CAC registration lands
 */
export async function sendOtp(phone: string, code: string, email?: string): Promise<{ channel: OtpChannel }> {
  const message = otpMessage(code);

  if (channel === "email") {
    if (!email) throw new Error("OTP_CHANNEL=email but the recipient has no email address.");
    await sendEmail(email, "Your AfriDetect Mat verification code", message);
    return { channel };
  }

  if (channel === "termii") {
    await sendSms(phone, message);
    return { channel };
  }

  const recipient = email ? `${phone} / ${email}` : phone;
  console.info(`\n[OTP:console] ${recipient} → ${code}  (valid for 10 minutes)\n`);
  return { channel };
}

/** Only surfaced to the UI when the server is explicitly in demo mode. */
export function otpDevCode(code: string): string | undefined {
  return process.env.OTP_DEV_MODE === "1" && process.env.NODE_ENV !== "production" ? code : undefined;
}

export function otpMessage(code: string): string {
  // Wording must match the approved Termii sender sample, or delivery gets blocked.
  return `Your AfriDetect Mat verification code is ${code}. It expires in 10 minutes. Do not share it with anyone.`;
}

/* --------------------------------------------------------------------- email */

async function sendEmail(to: string, subject: string, text: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not set (required for OTP_CHANNEL=email).");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM ?? "AfriDetect Mat <no-reply@afridetect.app>",
      to,
      subject,
      text,
    }),
    cache: "no-store",
  });

  if (!response.ok) throw new Error(`Email provider rejected the message: ${response.status}`);
}

/* ---------------------------------------------------------------------- sms */

const TERMII_ENDPOINT = "https://api.ng.termii.com/api/sms/send";

async function sendSms(e164: string, message: string) {
  const apiKey = process.env.TERMII_API_KEY;
  const sender = process.env.TERMII_SENDER_ID;
  if (!apiKey) throw new Error("TERMII_API_KEY is not set.");
  if (!sender) throw new Error("TERMII_SENDER_ID is not set — request a sender ID in the Termii console first.");

  const response = await fetch(TERMII_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: apiKey,
      to: toTermiiNumber(e164),
      from: sender,
      sms: message,
      type: "plain",
      channel: "generic",
    }),
    cache: "no-store",
  });

  const result = (await response.json().catch(() => ({}))) as { code?: string; message?: string };
  if (!response.ok || result.code === "400") {
    throw new Error(`Termii rejected the message: ${result.message ?? response.status}`);
  }
}
