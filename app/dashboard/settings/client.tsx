"use client";

import { useActionState, useState } from "react";
import {
  User, Shield, Activity, KeyRound, LogOut,
  Eye, EyeOff, CheckCircle2, AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  signOut,
  updateDisplayName,
  changePassword,
  deleteAccount,
} from "@/app/dashboard/settings/actions";

// ── Small UI helpers ──────────────────────────────────────────────────────────

function SectionLabel({
  icon: Icon,
  label,
  danger,
}: {
  icon: React.ElementType;
  label: string;
  danger?: boolean;
}) {
  return (
    <div className={`flex items-center gap-2 text-sm font-semibold ${danger ? "text-destructive" : "text-muted-foreground"}`}>
      <Icon size={15} />
      {label}
    </div>
  );
}

function FormFeedback({
  state,
}: {
  state: { error?: string; success?: boolean } | null;
}) {
  if (!state) return null;
  if (state.success) {
    return (
      <div className="flex items-center gap-2 text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
        <CheckCircle2 size={14} /> Saved successfully.
      </div>
    );
  }
  if (state.error) {
    return (
      <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
        <AlertCircle size={14} /> {state.error}
      </div>
    );
  }
  return null;
}

function PasswordInput({
  id,
  name,
  label,
  placeholder,
}: {
  id: string;
  name: string;
  label: string;
  placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          name={name}
          type={show ? "text" : "password"}
          placeholder={placeholder ?? "••••••••"}
          className="h-11 pr-10"
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        >
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
    </div>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────

export type SettingsClientProps = {
  email: string;
  displayName: string;
  createdAt: string;
  daysSinceJoined: number;
  provider: string;
};

// ── Main component ────────────────────────────────────────────────────────────

export default function SettingsClient({
  email,
  displayName,
  createdAt,
  daysSinceJoined,
  provider,
}: SettingsClientProps) {
  const [nameState, nameAction, namePending] = useActionState(updateDisplayName, null);
  const [passState, passAction, passPending] = useActionState(changePassword, null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");

  const isEmailProvider = provider === "email";

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div>
        <p className="text-sm text-muted-foreground">Account</p>
        <h1
          className="text-3xl font-black tracking-tight mt-0.5"
          style={{ letterSpacing: "-0.03em" }}
        >
          Settings
        </h1>
      </div>

      {/* ── Profile ── */}
      <section className="space-y-3">
        <SectionLabel icon={User} label="Profile" />
        <Card className="border-border/40 bg-card/60">
          <CardContent className="p-6">
            <form action={nameAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Display name</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={displayName}
                  placeholder="Your name"
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={email} disabled className="h-11 opacity-60" />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed.
                </p>
              </div>
              <FormFeedback state={nameState} />
              <Button type="submit" disabled={namePending} className="h-10 px-6 font-semibold">
                {namePending ? "Saving…" : "Save changes"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>

      {/* ── Security ── */}
      <section className="space-y-3">
        <SectionLabel icon={Shield} label="Security" />
        <Card className="border-border/40 bg-card/60">
          <CardContent className="p-6 space-y-5">
            {isEmailProvider ? (
              <form action={passAction} className="space-y-4">
                <p className="text-sm font-semibold">Change password</p>
                <PasswordInput
                  id="current"
                  name="current_password"
                  label="Current password"
                />
                <PasswordInput
                  id="new"
                  name="new_password"
                  label="New password"
                  placeholder="Min. 8 characters"
                />
                <PasswordInput
                  id="confirm"
                  name="confirm_password"
                  label="Confirm new password"
                />
                <FormFeedback state={passState} />
                <Button
                  type="submit"
                  variant="outline"
                  disabled={passPending}
                  className="h-10 px-6"
                >
                  <KeyRound size={15} className="mr-2" />
                  {passPending ? "Updating…" : "Update password"}
                </Button>
              </form>
            ) : (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/30">
                <AlertCircle size={15} className="text-muted-foreground shrink-0" />
                <p className="text-sm text-muted-foreground">
                  You signed in with{" "}
                  <span className="font-semibold capitalize">{provider}</span>.
                  Password management is handled by your provider.
                </p>
              </div>
            )}

            <div className="pt-2 border-t border-border/30">
              <form action={signOut}>
                <Button
                  type="submit"
                  variant="outline"
                  className="h-10 w-full justify-start gap-2"
                >
                  <LogOut size={15} />
                  Sign out
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ── Activity ── */}
      <section className="space-y-3">
        <SectionLabel icon={Activity} label="Activity" />
        <Card className="border-border/40 bg-card/60">
          <CardContent className="p-6">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Member since</p>
                <p className="font-semibold mt-1 text-sm">
                  {new Date(createdAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Days active</p>
                <p className="font-semibold mt-1 text-sm">{daysSinceJoined}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Auth provider</p>
                <p className="font-semibold mt-1 text-sm capitalize">{provider}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ── Danger zone ── */}
      <section className="space-y-3">
        <SectionLabel icon={Shield} label="Danger zone" danger />
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="p-6 space-y-4">
            <div>
              <p className="text-sm font-semibold text-destructive">Delete account</p>
              <p className="text-xs text-muted-foreground mt-1">
                Permanently deletes your account and all queues. This cannot be undone.
              </p>
            </div>

            {!showDeleteConfirm ? (
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => setShowDeleteConfirm(true)}
              >
                Delete account
              </Button>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Type{" "}
                  <span className="font-mono font-bold text-foreground">
                    delete my account
                  </span>{" "}
                  to confirm:
                </p>
                <Input
                  value={deleteInput}
                  onChange={(e) => setDeleteInput(e.target.value)}
                  placeholder="delete my account"
                  className="h-11"
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeleteInput("");
                    }}
                  >
                    Cancel
                  </Button>
                  <form action={deleteAccount} className="flex-1">
                    <Button
                      type="submit"
                      variant="destructive"
                      className="w-full"
                      disabled={deleteInput !== "delete my account"}
                    >
                      Confirm delete
                    </Button>
                  </form>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}