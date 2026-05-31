"use client";

// app/dashboard/queues/[id]/client.tsx

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  ArrowLeft, Users, Clock, CheckCircle2, XCircle,
  Bell, Trash2, Power, Copy, ExternalLink, Loader2, CalendarClock,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QueueQrCodeDialog } from "@/components/queue-qr-code-dialog";

// ── Types ─────────────────────────────────────────────────────────────────────

type Queue = {
  id: string;
  name: string;
  description: string | null;
  queue_type: "temporary" | "permanent" | "scheduled";
  max_size: number | null;
  avg_service_time: number | null;
  start_time: string | null;
  end_time: string | null;
  allow_guest_notes: boolean;
  no_show_tracking: boolean;
  auto_close: boolean;
  is_open: boolean;
  is_active: boolean;
};

type Entry = {
  id: string;
  guest_name: string;
  guest_phone: string | null;
  notes: string | null;
  admin_notes: string | null;
  position: number;
  status: "waiting" | "called" | "served" | "no_show" | "left";
  joined_at: string;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatTime(t: string | null) {
  return t ? t.slice(0, 5) : "—";
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function AdminQueueDetailClient() {
  const { id } = useParams<{ id: string }>();

  const supabaseRef = useRef<SupabaseClient | null>(null);
  function getSB() {
    if (!supabaseRef.current) {
      supabaseRef.current = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
      );
    }
    return supabaseRef.current;
  }

  const [mounted, setMounted] = useState(false);
  const [queue, setQueue] = useState<Queue | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [servedCount, setServedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [copied, setCopied] = useState(false);

  const guestUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/queue/${id}`
      : `/queue/${id}`;

  useEffect(() => { setMounted(true); }, []);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    const sb = getSB();
    const [{ data: q }, { data: e }, { count }] = await Promise.all([
      sb.from("queues").select("*").eq("id", id).single(),
      sb
        .from("queue_entries")
        .select("*")
        .eq("queue_id", id)
        .in("status", ["waiting", "called"])
        .order("position", { ascending: true }),
      sb
        .from("queue_entries")
        .select("*", { count: "exact", head: true })
        .eq("queue_id", id)
        .eq("status", "served"),
    ]);
    if (q) setQueue(q);
    if (e) setEntries(e);
    if (count !== null) setServedCount(count);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    if (!mounted) return;
    fetchData();
  }, [mounted, fetchData]);

  // ── Realtime ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mounted) return;
    const sb = getSB();

    const channel = sb
      .channel(`admin-queue-${id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "queue_entries", filter: `queue_id=eq.${id}` },
        () => fetchData()
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "queues", filter: `id=eq.${id}` },
        ({ new: updated }) => setQueue((prev) => (prev ? { ...prev, ...updated } : prev))
      )
      .subscribe();

    return () => { sb.removeChannel(channel); };
  }, [mounted, id, fetchData]);

  // ── Actions ────────────────────────────────────────────────────────────────

  async function toggleOpen() {
    if (!queue) return;
    setToggling(true);
    const sb = getSB();
    if (queue.is_open) {
      await sb.rpc("close_queue", { p_queue_id: id, p_clear: false });
    } else {
      await sb.rpc("open_queue", { p_queue_id: id });
    }
    setToggling(false);
  }

  async function callNext() {
    const next = entries.find((e) => e.status === "waiting");
    if (!next) return;
    const sb = getSB();
    await sb
      .from("queue_entries")
      .update({ status: "called", called_at: new Date().toISOString() })
      .eq("id", next.id);
  }

  async function markServed(entryId: string) {
    const sb = getSB();
    await sb
      .from("queue_entries")
      .update({ status: "served", served_at: new Date().toISOString() })
      .eq("id", entryId);
    await sb.rpc("recalculate_positions", { p_queue_id: id });
  }

  async function markNoShow(entryId: string) {
    const sb = getSB();
    await sb.from("queue_entries").update({ status: "no_show" }).eq("id", entryId);
    await sb.rpc("recalculate_positions", { p_queue_id: id });
  }

  async function removeEntry(entryId: string) {
    const sb = getSB();
    await sb.from("queue_entries").update({ status: "left" }).eq("id", entryId);
    await sb.rpc("recalculate_positions", { p_queue_id: id });
  }

  async function clearQueue() {
    if (!confirm("Clear all waiting guests? This cannot be undone.")) return;
    const sb = getSB();
    await sb.rpc("close_queue", { p_queue_id: id, p_clear: true });
    if (queue?.is_open) await sb.rpc("open_queue", { p_queue_id: id });
  }

  async function updateAdminNote(entryId: string, adminNotes: string) {
    const sb = getSB();

    const { error } = await sb
      .from("queue_entries")
      .update({
        admin_notes: adminNotes.trim() || null,
      })
      .eq("id", entryId);

    if (error) {
      console.error("Failed to update admin note:", error);
    }
  }

  function copyLink() {
    navigator.clipboard.writeText(guestUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-muted-foreground" size={32} />
      </div>
    );
  }

  if (!queue) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Queue not found.</p>
      </div>
    );
  }

  const waitingEntries = entries.filter((e) => e.status === "waiting");
  const calledEntries = entries.filter((e) => e.status === "called");

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Link href="/dashboard/queues">
          <Button variant="ghost" className="w-fit px-0 text-muted-foreground hover:text-foreground" type="button">
            <ArrowLeft size={16} className="mr-2" />
            Back to queues
          </Button>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="text-2xl font-black tracking-tight" style={{ letterSpacing: "-0.03em" }}>
                {queue.name}
              </h1>
              <Badge className={queue.is_open
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : "bg-muted/40 text-muted-foreground border-border/40"
              }>
                {queue.is_open ? "Open" : "Closed"}
              </Badge>
            </div>
            {queue.description && (
              <p className="text-sm text-muted-foreground">{queue.description}</p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <Button variant="outline" size="sm" onClick={copyLink} className="h-9">
              <Copy size={14} className="mr-1.5" />
              {copied ? "Copied!" : "Copy link"}
            </Button>
            <QueueQrCodeDialog url={guestUrl} queueName={queue.name} />
            <Link href={guestUrl} target="_blank">
              <Button variant="outline" size="sm" className="h-9">
                <ExternalLink size={14} className="mr-1.5" />
                Guest view
              </Button>
            </Link>
            <Button
              size="sm"
              onClick={toggleOpen}
              disabled={toggling}
              className={queue.is_open
                ? "h-9 bg-destructive/10 text-destructive border border-destructive/30 hover:bg-destructive/20"
                : "h-9 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20"
              }
            >
              <Power size={14} className="mr-1.5" />
              {toggling ? "…" : queue.is_open ? "Close queue" : "Open queue"}
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Users,         label: "Waiting",      value: waitingEntries.length },
          { icon: Bell,          label: "Called",       value: calledEntries.length },
          { icon: CheckCircle2,  label: "Served today", value: servedCount },
          {
            icon: Clock,
            label: queue.queue_type === "permanent" ? "Always open" : "Hours",
            value: queue.queue_type === "permanent"
              ? "∞"
              : `${formatTime(queue.start_time)}–${formatTime(queue.end_time)}`,
          },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="rounded-xl border border-border/40 bg-card/60 p-3">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Icon size={13} /><span className="text-xs font-medium">{label}</span>
            </div>
            <p className="text-xl font-black" style={{ letterSpacing: "-0.02em" }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 flex-wrap">
        <Button
          onClick={callNext}
          disabled={waitingEntries.length === 0 || !queue.is_open}
          className="bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 border-0 font-semibold"
        >
          <Bell size={15} className="mr-2" />Call next
        </Button>
        <Button
          variant="outline"
          onClick={clearQueue}
          disabled={waitingEntries.length === 0}
          className="text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 size={14} className="mr-2" />Clear queue
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Guest list */}
        <div className="lg:col-span-2 space-y-3">
          {calledEntries.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Called ({calledEntries.length})
              </p>
              {calledEntries.map((entry) => (
                <GuestRow
                  key={entry.id}
                  entry={entry}
                  variant="called"
                  noShowTracking={queue.no_show_tracking}
                  onServed={() => markServed(entry.id)}
                  onNoShow={() => markNoShow(entry.id)}
                  onRemove={() => removeEntry(entry.id)}
                  onUpdateAdminNote={(note) => updateAdminNote(entry.id, note)}
                />
              ))}
            </div>
          )}

          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Waiting ({waitingEntries.length}{queue.max_size ? ` / ${queue.max_size}` : ""})
            </p>
            {waitingEntries.length === 0 ? (
              <div className="rounded-xl border border-border/30 bg-muted/10 p-8 text-center">
                <p className="text-sm text-muted-foreground">No one in queue.</p>
              </div>
            ) : (
              waitingEntries.map((entry) => (
                <GuestRow
                  key={entry.id}
                  entry={entry}
                  variant="waiting"
                  noShowTracking={queue.no_show_tracking}
                  onServed={() => markServed(entry.id)}
                  onNoShow={() => markNoShow(entry.id)}
                  onRemove={() => removeEntry(entry.id)}
                  onUpdateAdminNote={(note) => updateAdminNote(entry.id, note)}
                />
              ))
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card className="bg-card/60 border-border/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold">Queue Info</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              {[
                ["Type",             queue.queue_type],
                ["Max size",         queue.max_size ? `${queue.max_size} guests` : "Unlimited"],
                ["Avg service",      queue.avg_service_time ? `${queue.avg_service_time} min` : "—"],
                ["Auto-close",       queue.auto_close ? "Yes" : "No"],
                ["Guest notes",      queue.allow_guest_notes ? "Enabled" : "Disabled"],
                ["No-show tracking", queue.no_show_tracking ? "Enabled" : "Disabled"],
                ...(queue.queue_type !== "permanent"
                  ? [["Hours", `${formatTime(queue.start_time)} – ${formatTime(queue.end_time)}`]]
                  : []),
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-semibold capitalize">{val}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-card/60 border-border/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold">Guest Link</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              <p className="text-xs text-muted-foreground break-all font-mono bg-muted/30 rounded-lg px-3 py-2">
                {guestUrl}
              </p>
              <Button variant="outline" size="sm" className="w-full" onClick={copyLink}>
                <Copy size={13} className="mr-1.5" />
                {copied ? "Copied!" : "Copy link"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ── GuestRow ──────────────────────────────────────────────────────────────────

function GuestRow({
  entry, variant, noShowTracking, onServed, onNoShow, onRemove, onUpdateAdminNote,
}: {
  entry: Entry;
  variant: "waiting" | "called";
  noShowTracking: boolean;
  onServed: () => void;
  onNoShow: () => void;
  onRemove: () => void;
  onUpdateAdminNote: (note: string) => Promise<void>;
}) {
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [adminNoteDraft, setAdminNoteDraft] = useState(entry.admin_notes ?? "");
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => {
    setAdminNoteDraft(entry.admin_notes ?? "");
  }, [entry.admin_notes]);

  async function saveAdminNote() {
    setSavingNote(true);
    await onUpdateAdminNote(adminNoteDraft);
    setSavingNote(false);
    setIsEditingNote(false);
  }

  function cancelAdminNoteEdit() {
    setAdminNoteDraft(entry.admin_notes ?? "");
    setIsEditingNote(false);
  }

  return (
    <div className={`rounded-xl border p-4 transition-colors ${
      variant === "called"
        ? "border-emerald-500/20 bg-emerald-500/5"
        : "border-border/40 bg-card/60"
    }`}>
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
          variant === "called"
            ? "bg-emerald-500/20 text-emerald-400"
            : "bg-muted/60 text-foreground"
        }`}>
          {entry.position}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm truncate">{entry.guest_name}</span>
            {variant === "called" && (
              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">
                Called
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
            {entry.guest_phone && (
              <span className="text-xs text-muted-foreground">{entry.guest_phone}</span>
            )}
            <span className="text-xs text-muted-foreground">
              Joined {new Date(entry.joined_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>

          {entry.notes && (
            <p className="text-xs text-muted-foreground mt-1 italic">"{entry.notes}"</p>
          )}

          {!entry.admin_notes && !isEditingNote ? (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="mt-2 h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => setIsEditingNote(true)}
            >
              Add admin note
            </Button>
          ) : (
            <div className="mt-3 rounded-lg border border-border/30 bg-muted/10 p-3">
              <div className="flex items-center justify-between gap-2 mb-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Admin note
                </p>

                {!isEditingNote && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-xs"
                    onClick={() => setIsEditingNote(true)}
                  >
                    Edit
                  </Button>
                )}
              </div>

              {isEditingNote ? (
                <div className="space-y-2">
                  <textarea
                    value={adminNoteDraft}
                    onChange={(e) => setAdminNoteDraft(e.target.value)}
                    placeholder="Add an internal note for this guest..."
                    className="min-h-[72px] w-full resize-none rounded-md border border-border/40 bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />

                  <div className="flex items-center justify-end gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={cancelAdminNoteEdit}
                      disabled={savingNote}
                    >
                      Cancel
                    </Button>

                    <Button
                      type="button"
                      size="sm"
                      onClick={saveAdminNote}
                      disabled={savingNote}
                    >
                      {savingNote ? "Saving..." : "Save note"}
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-foreground whitespace-pre-wrap">
                  {entry.admin_notes}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Button size="sm" variant="ghost" onClick={onServed}
            className="h-8 w-8 p-0 text-emerald-400 hover:bg-emerald-500/10" title="Mark as served">
            <CheckCircle2 size={16} />
          </Button>
          {noShowTracking && (
            <Button size="sm" variant="ghost" onClick={onNoShow}
              className="h-8 w-8 p-0 text-amber-400 hover:bg-amber-500/10" title="Mark as no-show">
              <XCircle size={16} />
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={onRemove}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10" title="Remove">
            <Trash2 size={15} />
          </Button>
        </div>
      </div>
    </div>
  );
}