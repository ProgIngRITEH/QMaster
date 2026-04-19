"use client";

import Link from "next/link";
import { useTransition } from "react";
import {
  Clock, Users, CalendarClock, Zap,
  MoreHorizontal, Power, Eye, Trash2,
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
  is_open: boolean;
  entry_count: number;
};

type Props = {
  queue: Queue;
  onToggle: (formData: FormData) => Promise<void>;
  onDelete: (formData: FormData) => Promise<void>;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const TYPE_META = {
  temporary: { label: "Temporary",  Icon: Zap,          color: "text-blue-400",   bg: "bg-blue-500/10 border-blue-500/20"    },
  permanent: { label: "Permanent",  Icon: Clock,         color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20" },
  scheduled: { label: "Scheduled",  Icon: CalendarClock, color: "text-amber-400",  bg: "bg-amber-500/10 border-amber-500/20"  },
};

function fmt(t: string | null) {
  return t ? t.slice(0, 5) : null;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function QueueCard({ queue, onToggle, onDelete }: Props) {
  const [togglePending, startToggle] = useTransition();
  const [deletePending, startDelete] = useTransition();

  const meta = TYPE_META[queue.queue_type];

  function handleToggle() {
    const fd = new FormData();
    fd.set("queue_id", queue.id);
    fd.set("is_open", queue.is_open ? "true" : "false");
    startToggle(() => onToggle(fd));
  }

  function handleDelete() {
    if (!confirm(`Delete "${queue.name}"? This cannot be undone.`)) return;
    const fd = new FormData();
    fd.set("queue_id", queue.id);
    startDelete(() => onDelete(fd));
  }

  return (
    <Card className="bg-card/60 border-border/40 hover:border-border/80 transition-colors">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">

          {/* Left info */}
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
                    <Clock size={12} />~{queue.avg_service_time} min avg
                  </span>
                )}
                {queue.queue_type !== "permanent" && queue.start_time && (
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CalendarClock size={12} />
                    {fmt(queue.start_time)} – {fmt(queue.end_time) ?? "?"}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Toggle open/close */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={togglePending}
              onClick={handleToggle}
              className={
                queue.is_open
                  ? "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                  : "border-border/40"
              }
            >
              <Power size={14} className="mr-1.5" />
              {togglePending ? "…" : queue.is_open ? "Close" : "Open"}
            </Button>

            {/* Dropdown — no <form> inside, uses onClick handlers */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal size={15} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem asChild>
                  <Link
                    href={`/dashboard/queues/${queue.id}`}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Eye size={14} />
                    View & manage
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href={`/queue/${queue.id}`}
                    target="_blank"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Users size={14} />
                    Guest view ↗
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="flex items-center gap-2 text-destructive focus:text-destructive cursor-pointer"
                  disabled={deletePending}
                  onClick={handleDelete}
                >
                  <Trash2 size={14} />
                  {deletePending ? "Deleting…" : "Delete"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}