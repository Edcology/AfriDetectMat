"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import type { ActionState } from "@/lib/action-state";

export async function changePassword(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");

  if (!currentPassword) return { status: "error", message: "Enter your current password." };
  if (newPassword.length < 10) return { status: "error", message: "Use at least 10 characters." };
  if (newPassword !== confirm) return { status: "error", message: "The new passwords do not match." };

  const { error } = await auth.changePassword({ currentPassword, newPassword });
  if (error) return { status: "error", message: error.message || "Could not change the password." };

  revalidatePath("/profile");
  return { status: "success", message: "Password changed. Other devices stay signed in until they expire." };
}

export async function signOut() {
  await auth.signOut();
  redirect("/login");
}
