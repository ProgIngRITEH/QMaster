"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type FormState = {
  error?: string;
  fieldErrors?: Partial<Record<string, string>>;
};

export async function createQueue(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const supabase = await createClient();

  // ── Auth check ──────────────────────────────────────────────
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to create a queue." };
  }

  // ── Parse fields ────────────────────────────────────────────
  const name = formData.get("name")?.toString().trim() ?? "";
  const description = formData.get("description")?.toString().trim() || null;
  const queue_type = formData.get("queue_type")?.toString() ?? "temporary";
  const service_mode = formData.get("service_mode")?.toString() ?? "walkin";

  const max_size = formData.get("max_size")
    ? Number(formData.get("max_size"))
    : null;
  const avg_service_time = formData.get("avg_service_time")
    ? Number(formData.get("avg_service_time"))
    : null;

  const start_time = formData.get("start_time")?.toString() || null;
  const end_time = formData.get("end_time")?.toString() || null;
  const timezone = formData.get("timezone")?.toString() ?? "local";

  const allow_guest_notes = formData.get("allow_guest_notes") === "on";
  const no_show_tracking = formData.get("no_show_tracking") === "on";
  const auto_close = formData.get("auto_close") === "on";

  const grace_period = formData.get("grace_period")
    ? Number(formData.get("grace_period"))
    : null;
  const slot_interval = formData.get("slot_interval")
    ? Number(formData.get("slot_interval"))
    : null;

  // ── Validation ───────────────────────────────────────────────
  const fieldErrors: Partial<Record<string, string>> = {};

  if (!name || name.length < 2) {
    fieldErrors.name = "Queue name must be at least 2 characters.";
  }
  if (name.length > 80) {
    fieldErrors.name = "Queue name must be under 80 characters.";
  }
  if (!["temporary", "permanent", "scheduled"].includes(queue_type)) {
    fieldErrors.queue_type = "Invalid queue type.";
  }
  if (!["walkin", "reservation", "hybrid"].includes(service_mode)) {
    fieldErrors.service_mode = "Invalid service mode.";
  }
  if (max_size !== null && (isNaN(max_size) || max_size < 1)) {
    fieldErrors.max_size = "Capacity must be at least 1.";
  }
  if (
    avg_service_time !== null &&
    (isNaN(avg_service_time) || avg_service_time < 1)
  ) {
    fieldErrors.avg_service_time = "Service time must be at least 1 minute.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  // ── Insert ───────────────────────────────────────────────────
  const { data, error } = await supabase
    .from("queues")
    .insert({
      owner_id: user.id,
      name,
      description,
      queue_type,
      service_mode,
      max_size,
      avg_service_time,
      start_time,
      end_time,
      timezone,
      allow_guest_notes,
      no_show_tracking,
      auto_close,
      grace_period,
      slot_interval,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[createQueue]", error);
    return { error: "Something went wrong. Please try again." };
  }

  revalidatePath("/dashboard/queues");
  redirect(`/dashboard/queues/${data.id}`);
}