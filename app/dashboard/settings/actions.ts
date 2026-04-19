"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function updateDisplayName(
  _prev: { error?: string; success?: boolean } | null,
  formData: FormData
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const name = formData.get("name")?.toString().trim() ?? "";
  if (name.length < 2) return { error: "Name must be at least 2 characters." };
  if (name.length > 50) return { error: "Name must be under 50 characters." };

  const { error } = await supabase.auth.updateUser({ data: { display_name: name } });
  if (error) return { error: error.message };

  revalidatePath("/dashboard/settings");
  return { success: true };
}

export async function changePassword(
  _prev: { error?: string; success?: boolean } | null,
  formData: FormData
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const current = formData.get("current_password")?.toString() ?? "";
  const newPass = formData.get("new_password")?.toString() ?? "";
  const confirm = formData.get("confirm_password")?.toString() ?? "";

  if (!current || !newPass || !confirm) return { error: "All fields are required." };
  if (newPass.length < 8) return { error: "New password must be at least 8 characters." };
  if (newPass !== confirm) return { error: "Passwords don't match." };

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password: current,
  });
  if (signInError) return { error: "Current password is incorrect." };

  const { error } = await supabase.auth.updateUser({ password: newPass });
  if (error) return { error: error.message };

  return { success: true };
}

export async function deleteAccount() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("queues").delete().eq("owner_id", user.id);
  await supabase.auth.signOut();
  redirect("/");
}