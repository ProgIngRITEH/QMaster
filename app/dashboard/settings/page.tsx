import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  User,
  Shield,
  MailCheck,
  Activity,
  KeyRound,
  LogOut,
  Bell,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Suspense } from "react";
import { unstable_noStore as noStore } from "next/cache";

// ─── Auth ─────────────────────────────────────
async function getUser() {
  noStore();
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) redirect("/auth/login");
  return data.user;
}

// ─── Settings content ─────────────────────────
async function SettingsContent() {
  const user = await getUser();

  const daysSinceJoined = Math.floor(
    (Date.now() - new Date(user.created_at).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8">

      {/* HEADER */}
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">Account</p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Settings
        </h1>
      </div>

      {/* ───────────────────────────────────────── */}
      {/* ACCOUNT */}
      {/* ───────────────────────────────────────── */}
      <section className="space-y-4">

        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <User size={16} />
          Profile
        </div>

        <Card className="border-border/40 bg-card/40">
          <CardContent className="p-6 space-y-5">

            <div className="grid gap-4">
              <div>
                <Label>Name</Label>
                <Input defaultValue={user.email?.split("@")[0]} />
              </div>

              <div>
                <Label>Email</Label>
                <Input defaultValue={user.email} disabled />
              </div>
            </div>

            {/* EMAIL STATUS */}
            <div className="flex items-center justify-between pt-4 border-t border-border/30">
              <span className="text-sm text-muted-foreground">
                Email verification
              </span>

              {user.email_confirmed_at ? (
                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                  Verified
                </Badge>
              ) : (
                <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20">
                  Not verified
                </Badge>
              )}
            </div>

          </CardContent>
        </Card>
      </section>

      {/* ───────────────────────────────────────── */}
      {/* SECURITY */}
      {/* ───────────────────────────────────────── */}
      <section className="space-y-4">

        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Shield size={16} />
          Security
        </div>

        <Card className="border-border/40 bg-card/40">
          <CardContent className="p-6 space-y-3">

            <Button variant="outline" className="w-full justify-start gap-2">
              <KeyRound size={16} />
              Change password
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2">
              <MailCheck size={16} />
              Resend verification email
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2">
              <LogOut size={16} />
              Log out of all devices
            </Button>

          </CardContent>
        </Card>
      </section>
            
      {/* ───────────────────────────────────────── */}
      {/* NOTIFICATIONS */}
      {/* ───────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Bell size={16} />
          Notifications
        </div>
        <Card className="border-border/40 bg-card/40">
          <CardContent className="p-6 space-y-4">

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Email notifications</p>
                <p className="text-xs text-muted-foreground">
                  Receive updates about your queues
                </p>
              </div>
              <input type="checkbox" className="accent-blue-500 scale-110" />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Queue alerts</p>
                <p className="text-xs text-muted-foreground">
                  Get notified when it's your turn
                </p>
              </div>
              <input type="checkbox" className="accent-blue-500 scale-110" />
            </div>

          </CardContent>
        </Card>
      </section>

      {/* ───────────────────────────────────────── */}
      {/* ACTIVITY */}
      {/* ───────────────────────────────────────── */}
      <section className="space-y-4">

        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Activity size={16} />
          Activity
        </div>

        <Card className="border-border/40 bg-card/40">
          <CardContent className="p-6 grid grid-cols-3 gap-4">

            <div>
              <p className="text-xs text-muted-foreground">Member since</p>
              <p className="font-medium mt-1">
                {new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Days active</p>
              <p className="font-medium mt-1">{daysSinceJoined}</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <p className="font-medium mt-1 text-emerald-400">
                Active
              </p>
            </div>

          </CardContent>
        </Card>
      </section>

      {/* ───────────────────────────────────────── */}
      {/* DANGER ZONE */}
      {/* ───────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-red-400">
          <Shield size={16} />
          Danger zone
        </div>

        <Card className="border-red-500/20 bg-red-500/5">
          <CardContent className="p-6 space-y-4">

            <div>
              <p className="text-sm font-semibold text-red-400">
                Delete your account
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                This action is permanent and cannot be undone.
              </p>
            </div>

            <Button
              variant="destructive"
              className="w-full"
            >
              Delete account
            </Button>

          </CardContent>
        </Card>
      </section>
    </div>
  );
}

// ─── Skeleton ─────────────────────────
function SettingsSkeleton() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 animate-pulse">
      <div className="h-8 w-40 bg-muted rounded-md" />
      <div className="h-32 bg-muted rounded-2xl" />
      <div className="h-32 bg-muted rounded-2xl" />
      <div className="h-32 bg-muted rounded-2xl" />
    </div>
  );
}

// ─── Page ─────────────────────────
export default function SettingsPage() {
  return (
    <Suspense fallback={<SettingsSkeleton />}>
      <SettingsContent />
    </Suspense>
  );
}