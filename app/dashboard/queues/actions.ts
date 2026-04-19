"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// ── Toggle open/closed ────────────────────────────────────────────────────────

export async function toggleQueueOpen(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const queue_id = formData.get("queue_id")?.toString();
  const currently_open = formData.get("is_open") === "true";

  if (!queue_id) return;

  if (currently_open) {
    // Close it
    await supabase.rpc("close_queue", {
      p_queue_id: queue_id,
      p_clear: false, // don't clear entries, just close
    });
  } else {
    // Open it
    await supabase.rpc("open_queue", { p_queue_id: queue_id });
  }

  revalidatePath("/dashboard/queues");
}

// ── Delete queue ──────────────────────────────────────────────────────────────

export async function deleteQueue(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const queue_id = formData.get("queue_id")?.toString();
  if (!queue_id) return;

  await supabase
    .from("queues")
    .delete()
    .eq("id", queue_id)
    .eq("owner_id", user.id);

  revalidatePath("/dashboard/queues");
}