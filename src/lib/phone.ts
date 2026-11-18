/**
 * Nigerian mobile numbers only (+234).
 *
 * Mothers type 0803…, 803…, 234803…, +234 803… — all of it must resolve to one
 * canonical form, otherwise a returning mother creates a duplicate record and
 * her OTP goes to a number the auth store has never seen.
 */
export function normaliseNgPhone(input: string): string | null {
  let digits = input.replace(/\D/g, "");

  if (digits.startsWith("234")) digits = digits.slice(3);
  else if (digits.startsWith("0")) digits = digits.slice(1);

  // Nigerian mobile numbers are 10 digits after the country code, starting 7/8/9.
  if (digits.length !== 10 || !/^[789]/.test(digits)) return null;
  return `+234${digits}`;
}

/** "+2348031234567" -> "0803 123 4567" */
export function formatNgPhone(e164: string): string {
  if (!/^\+234\d{10}$/.test(e164)) return e164;
  const local = `0${e164.slice(4)}`;
  return `${local.slice(0, 4)} ${local.slice(4, 7)} ${local.slice(7)}`;
}

/** Termii wants the country code without the plus. */
export function toTermiiNumber(e164: string): string {
  return e164.replace(/^\+/, "");
}
