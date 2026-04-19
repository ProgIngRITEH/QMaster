import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  Clock,
  Users,
  MoreHorizontal,
  Power,
  Eye,
  Trash2,
  CalendarClock,
  Infinity,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { toggleQueueOpen, deleteQueue } from "./actions";

// ── Types ─────────────────────────────────────────────────────────────────────

type Queue = {
  id: string;
  name: string;
  description: string | null;
  queue_type: "temporary" | "permanent" | "scheduled";
  service_mode: string;
  max_size: number | null;
  avg_service_time: number | null;
  start_time: string | null;
  end_time: string | null;
  is_active: boolean;
  is_open: boolean;
  created_at: string;
  entry_count: number;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const TYPE_META = {
  temporary: { label: "Temporary", Icon: Zap, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
  permanent: { label: "Permanent", Icon: Infinity, color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20" },
  scheduled: { label: "Scheduled", Icon: CalendarClock, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
};

function formatTime(t: string | null) {
  if (!t) return null;
  return t.slice(0, 5);
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function QueuesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch queues + live waiting count via subquery
  const { data: queues } = await supabase
    .from("queues")
    .select(`
      *,
      entry_count:queue_entries(count)
    `)
    .eq("owner_id", user.id)
    .eq("queue_entries.status", "waiting")
    .order("created_at", { ascending: false });

  const rows: Queue[] = (queues ?? []).map((q: any) => ({
    ...q,
    entry_count: q.entry_count?.[0]?.count ?? 0,
  }));

  const openCount = rows.filter((q) => q.is_open).length;

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            className="text-3xl font-black tracking-tight"
            style={{ letterSpacing: "-0.03em" }}
          >
            Queues
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {rows.length} total · {openCount} open
          </p>
        </div>
        <Link href="/dashboard/queues/create">
          <Button className="h-10 px-5 font-semibold bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 border-0 shadow-lg shadow-blue-500/20">
            <Plus size={16} className="mr-2" />
            New queue
          </Button>
        </Link>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total queues", value: rows.length },
          { label: "Open now", value: openCount },
          { label: "Waiting guests", value: rows.reduce((s, q) => s + q.entry_count, 0) },
          { label: "Permanent", value: rows.filter((q) => q.queue_type === "permanent").length },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-border/40 bg-card/60 p-4">
            <p className="text-xs text-muted-foreground font-medium">{label}</p>
            <p className="text-2xl font-black mt-1" style={{ letterSpacing: "-0.03em" }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Queue list */}
      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted/40 flex items-center justify-center">
            <Users size={28} className="text-muted-foreground/60" />
          </div>
          <div>
            <p className="font-bold text-lg">No queues yet</p>
            <p className="text-sm text-muted-foreground mt-1">Create your first queue to get started.</p>
          </div>
          <Link href="/dashboard/queues/create">
            <Button variant="outline">
              <Plus size={15} className="mr-2" />
              Create queue
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((queue) => {
            const meta = TYPE_META[queue.queue_type];
            return (
              <Card key={queue.id} className="bg-card/60 border-border/40 hover:border-border/80 transition-colors">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    {/* Left */}
                    <div className="flex items-start gap-4 min-w-0">
                      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${meta.bg}`}>
                        <meta.Icon size={18} className={meta.color} />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold truncate">{queue.name}</span>
                          <Badge
                            className={
                              queue.is_open
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : "bg-muted/40 text-muted-foreground border-border/40"
                            }
                          >
                            {queue.is_open ? "Open" : "Closed"}
                          </Badge>
                          <Badge variant="outline" className={`border text-xs ${meta.bg} ${meta.color}`}>
                            {meta.label}
                          </Badge>
                        </div>

                        {queue.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-sm">
                            {queue.description}
                          </p>
                        )}

                        <div className="flex items-center gap-4 mt-2 flex-wrap">
                          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Users size={12} />
                            {queue.entry_count} waiting
                            {queue.max_size ? ` / ${queue.max_size}` : ""}
                          </span>
                          {queue.avg_service_time && (
                            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Clock size={12} />
                              ~{queue.avg_service_time} min avg
                            </span>
                          )}
                          {queue.queue_type !== "permanent" && queue.start_time && (
                            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <CalendarClock size={12} />
                              {formatTime(queue.start_time)} – {formatTime(queue.end_time) ?? "?"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Toggle open/close */}
                      <form action={toggleQueueOpen}>
                        <input type="hidden" name="queue_id" value={queue.id} />
                        <input type="hidden" name="is_open" value={queue.is_open ? "true" : "false"} />
                        <Button
                          type="submit"
                          variant="outline"
                          size="sm"
                          className={
                            queue.is_open
                              ? "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                              : "border-border/40"
                          }
                        >
                          <Power size={14} className="mr-1.5" />
                          {queue.is_open ? "Close" : "Open"}
                        </Button>
                      </form>

                      {/* Dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal size={15} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/queues/${queue.id}`} className="flex items-center gap-2">
                              <Eye size={14} />
                              View & manage
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/queue/${queue.id}`} target="_blank" className="flex items-center gap-2">
                              <Users size={14} />
                              Guest view ↗
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <form action={deleteQueue}>
                            <input type="hidden" name="queue_id" value={queue.id} />
                            <DropdownMenuItem asChild>
                              <button type="submit" className="flex items-center gap-2 w-full text-destructive focus:text-destructive">
                                <Trash2 size={14} />
                                Delete
                              </button>
                            </DropdownMenuItem>
                          </form>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}