"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  Clock, Users, CheckCircle2, XCircle, Loader2,
  Phone, User, FileText, AlertCircle, Timer, Share2, Copy,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

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
  is_active: boolean;
  is_open: boolean;
  is_paused: boolean;
};

type Entry = {
  id: string;
  queue_id: string;
  guest_name: string;
  position: number;
  status: "waiting" | "called" | "served" | "no_show" | "left";
  joined_at: string;
  token: string;
  admin_notes: string | null;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function estimateWait(position: number, avgMin: number | null) {
  if (!avgMin || position <= 0) return null;
  const mins = (position - 1) * avgMin;
  if (mins === 0) return "You're next!";
  if (mins < 60) return `~${mins} min`;
  return `~${Math.floor(mins / 60)}h ${mins % 60}min`;
}

function formatTime(t: string | null) {
  if (!t) return "—";
  return t.slice(0, 5);
}

// ── Countdown hook ────────────────────────────────────────────────────────────

function useOpenCountdown(startTime: string | null, isOpen: boolean) {
  const [countdown, setCountdown] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen || !startTime) {
      setCountdown(null);
      return;
    }

    function calc() {
      const now = new Date();
      const [h, m] = startTime!.split(":").map(Number);

      const target = new Date();
      target.setHours(h, m, 0, 0);

      // If already past today, aim for tomorrow
      if (target <= now) {
        target.setDate(target.getDate() + 1);
      }

      const totalSecs = Math.floor((target.getTime() - now.getTime()) / 1000);
      const hours = Math.floor(totalSecs / 3600);
      const mins = Math.floor((totalSecs % 3600) / 60);
      const secs = totalSecs % 60;

      if (hours > 0) {
        setCountdown(`${hours}h ${mins}m ${String(secs).padStart(2, "0")}s`);
      } else if (mins > 0) {
        setCountdown(`${mins}m ${String(secs).padStart(2, "0")}s`);
      } else {
        setCountdown(`${secs}s`);
      }
    }

    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [startTime, isOpen]);

  return countdown;
}

// ── StatCard ──────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon, label, value,
}: {
  icon: React.ElementType; label: string; value: string;
}) {
  return (
    <div className="rounded-xl border border-border/40 bg-card/60 p-3 text-center">
      <Icon size={16} className="mx-auto text-muted-foreground mb-1.5" />
      <p className="text-[11px] text-muted-foreground font-medium">{label}</p>
      <p className="text-sm font-bold mt-0.5 truncate">{value}</p>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function QueuePublicClient() {
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

  const [queue, setQueue] = useState<Queue | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [myEntry, setMyEntry] = useState<Entry | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  const countdown = useOpenCountdown(
    queue?.start_time ?? null,
    queue?.is_open ?? false
  );

  useEffect(() => { setMounted(true); }, []);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    const sb = getSB();
    const [{ data: q }, { data: e }] = await Promise.all([
      sb.from("queues").select("*").eq("id", id).single(),
      sb
        .from("queue_entries")
        .select("*")
        .eq("queue_id", id)
        .in("status", ["waiting", "called"])
        .order("position", { ascending: true }),
    ]);
    if (q) setQueue(q);
    if (e) setEntries(e);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    if (!mounted) return;
    fetchData();
  }, [mounted, fetchData]);

  // Restore my entry from localStorage
  useEffect(() => {
    if (!mounted) return;
    const stored = localStorage.getItem(`qmaster_entry_${id}`);
    if (!stored) return;
    try { setMyEntry(JSON.parse(stored)); }
    catch { localStorage.removeItem(`qmaster_entry_${id}`); }
  }, [mounted, id]);

  // ── Realtime ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mounted) return;
    const sb = getSB();

    const channel = sb
      .channel(`queue-public-${id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "queue_entries", filter: `queue_id=eq.${id}` },
        (payload) => {
          sb.from("queue_entries")
            .select("*")
            .eq("queue_id", id)
            .in("status", ["waiting", "called"])
            .order("position", { ascending: true })
            .then(({ data }) => { if (data) setEntries(data); });

          if (payload.eventType === "UPDATE" && payload.new) {
            setMyEntry((prev) => {
              if (!prev || prev.id !== payload.new.id) return prev;
              const updated = { ...prev, ...payload.new } as Entry;
              if (["served", "no_show", "left"].includes(updated.status)) {
                localStorage.removeItem(`qmaster_entry_${id}`);
              } else {
                localStorage.setItem(`qmaster_entry_${id}`, JSON.stringify(updated));
              }
              return updated;
            });
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "queues", filter: `id=eq.${id}` },
        ({ new: updated }) => {
          setQueue((prev) => (prev ? { ...prev, ...updated } : prev));
        }
      )
      .subscribe();

    return () => { sb.removeChannel(channel); };
  }, [mounted, id]);

  // Sync myEntry position from live entries.
  // Important: do not include myEntry in dependencies to avoid update loops.
  useEffect(() => {
    setMyEntry((prev) => {
      if (!prev) return prev;
      const live = entries.find((e) => e.id === prev.id);
      if (!live) return prev;

      const hasChanged =
        live.position !== prev.position ||
        live.status !== prev.status ||
        live.guest_name !== prev.guest_name ||
        live.admin_notes !== prev.admin_notes;

      if (!hasChanged) return prev;

      const updated = { ...prev, ...live };
      if (["served", "no_show", "left"].includes(updated.status)) {
        localStorage.removeItem(`qmaster_entry_${id}`);
      } else {
        localStorage.setItem(`qmaster_entry_${id}`, JSON.stringify(updated));
      }
      return updated;
    });
  }, [entries, id]);

  // ── Join ───────────────────────────────────────────────────────────────────
  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!queue) return;
    setJoining(true);
    setError(null);

    const sb = getSB();
    const waitingCount = entries.filter((e) => e.status === "waiting").length;

    if (queue.max_size && waitingCount >= queue.max_size) {
      setError("Queue is full. Please try again later.");
      setJoining(false);
      return;
    }

    const { data, error: insertError } = await sb
      .from("queue_entries")
      .insert({
        queue_id: id,
        guest_name: name.trim(),
        guest_phone: phone.trim() || null,
        notes: notes.trim() || null,
        position: waitingCount + 1,
      })
      .select()
      .single();

    if (insertError || !data) {
      setError("Failed to join queue. Please try again.");
      setJoining(false);
      return;
    }

    setMyEntry(data);
    localStorage.setItem(`qmaster_entry_${id}`, JSON.stringify(data));
    setJoining(false);
  }

  // ── Leave ──────────────────────────────────────────────────────────────────
  async function handleLeave() {
    if (!myEntry) return;
    const sb = getSB();
    await sb.from("queue_entries").update({ status: "left" }).eq("id", myEntry.id);
    setMyEntry(null);
    localStorage.removeItem(`qmaster_entry_${id}`);
  }

  // ── Share ──────────────────────────────────────────────────────────────────
  async function handleShare() {
    const url = window.location.href;
    const shareData = {
      title: queue?.name ? `Join ${queue.name}` : "Join queue",
      text: queue?.name ? `Join the queue for ${queue.name}.` : "Join this queue.",
      url,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }

      await navigator.clipboard.writeText(url);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } catch (error) {
      if ((error as Error).name === "AbortError") return;

      try {
        await navigator.clipboard.writeText(url);
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2000);
      } catch {
        console.error("Failed to share or copy queue link");
      }
    }
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
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8 text-center">
        <XCircle size={48} className="text-destructive/60" />
        <h1 className="text-2xl font-bold">Queue not found</h1>
        <p className="text-muted-foreground">This link may be invalid or expired.</p>
      </div>
    );
  }

  const waitingEntries = entries.filter((e) => e.status === "waiting");
  const myPosition = myEntry ? waitingEntries.findIndex((e) => e.id === myEntry.id) + 1 : null;
  const isCalled = myEntry?.status === "called";
  const isServed = myEntry?.status === "served";
  const isPaused = queue.is_paused;
  const queueFull = queue.max_size ? waitingEntries.length >= queue.max_size : false;
  const canJoin = queue.is_open && !isPaused && !queueFull && !myEntry;

  const statusBadge = isPaused
    ? { label: "Paused", cls: "bg-amber-500/10 text-amber-400 border-amber-500/20" }
    : queue.is_open
    ? { label: "Open", cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" }
    : { label: "Closed", cls: "bg-muted/40 text-muted-foreground border-border/40" };

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="border-b border-border/40 bg-card/60 backdrop-blur px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-black text-xl tracking-tight truncate" style={{ letterSpacing: "-0.02em" }}>
              {queue.name}
            </h1>
            {queue.description && (
              <p className="text-xs text-muted-foreground mt-0.5 truncate">{queue.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button type="button" variant="outline" size="sm" onClick={handleShare} className="gap-1.5">
              {shareCopied ? (
                <>
                  <Copy size={14} />
                  Copied
                </>
              ) : (
                <>
                  <Share2 size={14} />
                  Share
                </>
              )}
            </Button>
            <Badge className={statusBadge.cls}>{statusBadge.label}</Badge>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mt-2">
          <StatCard icon={Users} label="In queue" value={waitingEntries.length.toString()} />
          <StatCard
            icon={Timer}
            label="Avg wait"
            value={queue.avg_service_time ? `${queue.avg_service_time} min` : "—"}
          />
          <StatCard
            icon={Clock}
            label="Hours"
            value={
              queue.queue_type === "permanent"
                ? "Always"
                : `${formatTime(queue.start_time)}–${formatTime(queue.end_time)}`
            }
          />
        </div>

        {/* Paused banner */}
        {isPaused && queue.is_open && (
          <div className="flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
            <AlertCircle size={18} className="text-amber-400 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-400">Queue is temporarily paused</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                New guests cannot join right now. Please check back shortly.
              </p>
            </div>
          </div>
        )}

        {/* Closed banner with live countdown */}
        {!queue.is_open && (
          <div className="flex items-start gap-3 rounded-xl border border-border/40 bg-muted/20 p-4">
            <AlertCircle size={18} className="text-muted-foreground shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold">Queue is currently closed</p>
              {queue.queue_type === "permanent" || !queue.start_time ? (
                <p className="text-xs text-muted-foreground mt-0.5">Check back later.</p>
              ) : countdown ? (
                <>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Opens at {formatTime(queue.start_time)}
                  </p>
                  <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 rounded-lg bg-background/60 border border-border/60">
                    <Clock size={12} className="text-muted-foreground" />
                    <span className="text-sm font-bold font-mono tracking-wider tabular-nums">
                      {countdown}
                    </span>
                  </div>
                </>
              ) : (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Opens at {formatTime(queue.start_time)}
                </p>
              )}
            </div>
          </div>
        )}

        {/* My status card */}
        {myEntry && !isServed && (
          <Card className="border-border/40 bg-card/60">
            <CardContent className="p-5">
              {isCalled ? (
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <CheckCircle2 size={32} className="text-emerald-400" />
                  </div>
                  <p className="font-black text-xl text-emerald-400">You're being called!</p>
                  <p className="text-sm text-muted-foreground">Please proceed to the counter.</p>

                  {myEntry.admin_notes && (
                    <div className="mt-4 rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 text-left">
                      <div className="flex items-center gap-2 mb-1.5">
                        <FileText size={14} className="text-blue-400 shrink-0" />
                        <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                          Message from staff
                        </p>
                      </div>
                      <p className="text-sm text-foreground whitespace-pre-wrap">
                        {myEntry.admin_notes}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-muted-foreground">Your position</span>
                    <Badge variant="outline" className="border-blue-500/30 text-blue-400 text-base px-3 py-1">
                      #{myPosition ?? "—"}
                    </Badge>
                  </div>
                  {myPosition && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-muted-foreground">Est. wait</span>
                      <span className="text-sm font-bold">
                        {estimateWait(myPosition, queue.avg_service_time) ?? "—"}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-muted-foreground">Name</span>
                    <span className="text-sm font-semibold">{myEntry.guest_name}</span>
                  </div>

                  {myEntry.admin_notes && (
                    <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
                      <div className="flex items-center gap-2 mb-1.5">
                        <FileText size={14} className="text-blue-400 shrink-0" />
                        <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                          Message from staff
                        </p>
                      </div>
                      <p className="text-sm text-foreground whitespace-pre-wrap">
                        {myEntry.admin_notes}
                      </p>
                    </div>
                  )}

                  {queue.max_size && (
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Queue progress</span>
                        <span>{waitingEntries.length} / {queue.max_size}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted/40 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all duration-500"
                          style={{ width: `${(waitingEntries.length / queue.max_size) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                  <Button
                    variant="outline" size="sm"
                    className="w-full text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                    onClick={handleLeave}
                  >
                    Leave queue
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {isServed && (
          <Card className="border-emerald-500/20 bg-emerald-500/5">
            <CardContent className="p-5 text-center space-y-2">
              <CheckCircle2 size={36} className="mx-auto text-emerald-400" />
              <p className="font-bold text-emerald-400">You've been served!</p>
              <p className="text-xs text-muted-foreground">Thank you for your patience.</p>
              <Button variant="outline" size="sm" className="mt-2" onClick={() => {
                setMyEntry(null);
                localStorage.removeItem(`qmaster_entry_${id}`);
              }}>
                Done
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Join form */}
        {canJoin && (
          <Card className="border-border/40 bg-card/60">
            <CardContent className="p-5">
              <h2 className="font-bold text-base mb-4">Join this queue</h2>
              <form onSubmit={handleJoin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="g-name" className="flex items-center gap-2">
                    <User size={13} className="text-muted-foreground" />Your name
                  </Label>
                  <Input id="g-name" value={name} onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ana Kovač" className="h-11" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="g-phone" className="flex items-center gap-2">
                    <Phone size={13} className="text-muted-foreground" />Phone number
                    <span className="text-xs text-muted-foreground font-normal">(optional)</span>
                  </Label>
                  <Input id="g-phone" value={phone} type="tel"
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+385 91 234 5678" className="h-11" />
                </div>
                {queue.allow_guest_notes && (
                  <div className="space-y-2">
                    <Label htmlFor="g-notes" className="flex items-center gap-2">
                      <FileText size={13} className="text-muted-foreground" />Notes
                      <span className="text-xs text-muted-foreground font-normal">(optional)</span>
                    </Label>
                    <Textarea id="g-notes" value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any special requests..." className="resize-none min-h-[80px]" />
                  </div>
                )}
                {error && (
                  <p className="text-sm text-destructive flex items-center gap-2">
                    <AlertCircle size={14} />{error}
                  </p>
                )}
                <Button type="submit" disabled={joining || !name.trim()}
                  className="w-full h-11 font-semibold bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 border-0">
                  {joining ? <><Loader2 size={16} className="mr-2 animate-spin" />Joining…</> : "Join Queue"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {!myEntry && queueFull && queue.is_open && !isPaused && (
          <Card className="border-border/40 bg-muted/10">
            <CardContent className="p-5 text-center space-y-2">
              <Users size={32} className="mx-auto text-muted-foreground/60" />
              <p className="font-bold">Queue is full</p>
              <p className="text-sm text-muted-foreground">Maximum capacity reached. Try again later.</p>
            </CardContent>
          </Card>
        )}

        {/* Live queue list */}
        {waitingEntries.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
              Currently waiting — {waitingEntries.length}
            </p>
            {waitingEntries.map((entry) => (
              <div key={entry.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors ${
                myEntry?.id === entry.id ? "border-blue-500/30 bg-blue-500/5" : "border-border/30 bg-card/40"
              }`}>
                <div className="w-7 h-7 rounded-full bg-muted/60 flex items-center justify-center text-xs font-bold shrink-0">
                  {entry.position}
                </div>
                <span className="text-sm font-medium flex-1 truncate">
                  {myEntry?.id === entry.id
                    ? <span className="text-blue-400">{entry.guest_name} (you)</span>
                    : entry.guest_name}
                </span>
                {entry.status === "called" && (
                  <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">
                    Called
                  </Badge>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}