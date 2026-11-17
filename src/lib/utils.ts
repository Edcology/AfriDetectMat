export type ClassValue = string | false | null | undefined;

/** Tiny classname joiner — keeps the bundle free of clsx/tailwind-merge. */
export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(" ");
}
