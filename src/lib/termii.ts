import { toTermiiNumber } from "@/lib/phone";

const ENDPOINT = "https://api.ng.termii.com/api/sms/send";

interface TermiiResponse {
  code?: string;
  message?: string;
  message_id?: string;
}

/**
 * Sends one SMS through Termii. Deliberately thin: Better Auth generates and
 * verifies the OTP, Termii only carries the message. That keeps the code's
 * lifetime and attempt limits in our database rather than in Termii's OTP
 * service, so a leaked provider key cannot mint codes.
 */
export async function sendSms(e164: string, message: string): Promise<void> {
  const apiKey = process.env.TERMII_API_KEY;
  const sender = process.env.TERMII_SENDER_ID;

  if (!apiKey) throw new Error("TERMII_API_KEY is not set.");

  if (!sender) {
    // Local development without an approved sender ID.
    console.info(`[termii:dev] ${e164} ← ${message}`);
    return;
  }

  const response = await fetch(ENDPOINT, {
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

  const result = (await response.json().catch(() => ({}))) as TermiiResponse;
  if (!response.ok || result.code === "400") {
    throw new Error(`Termii rejected the message: ${result.message ?? response.status}`);
  }
}

export function otpMessage(code: string): string {
  return `${code} is your AfriDetect Mat verification code. It expires in 5 minutes. Never share it.`;
}

export async function sendOtp(e164: string, code: string): Promise<void> {
  await sendSms(e164, otpMessage(code));
}
