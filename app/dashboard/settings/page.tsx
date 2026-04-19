import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";
import { connection } from "next/server";
import SettingsClient from "@/app/dashboard/settings/client";

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SettingsSkeleton() {
  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6 animate-pulse">
      <div className="h-8 w-40 bg-muted rounded-md" />
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-40 bg-muted rounded-2xl" />
      ))}
    </div>
  );
}

// ─── Async content ────────────────────────────────────────────────────────────

async function SettingsContent() {
  await connection();

  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) redirect("/auth/login");

  const user = data.user;
  const daysSinceJoined = Math.floor(
    (Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24)
  );
  const displayName =
    (user.user_metadata?.display_name as string | undefined) ??
    user.email?.split("@")[0] ??
    "";
  const provider = (user.app_metadata?.provider as string | undefined) ?? "email";

  return (
    <SettingsClient
      email={user.email ?? ""}
      displayName={displayName}
      createdAt={user.created_at}
      daysSinceJoined={daysSinceJoined}
      provider={provider}
    />
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  return (
    <Suspense fallback={<SettingsSkeleton />}>
      <SettingsContent />
    </Suspense>
  );
}