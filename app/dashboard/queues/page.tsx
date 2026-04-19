import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Plus, Clock, Users, CalendarClock, Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { toggleQueueOpen, deleteQueue } from "./actions";
import QueuesLoading from "./loading";
import { QueueCard } from "./queue-card";

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
  created_at: string;
  entry_count: number;
};

async function QueuesList() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: raw } = await supabase
    .from("queues")
    .select(`*, entry_count:queue_entries(count)`)
    .eq("owner_id", user.id)
    .eq("queue_entries.status", "waiting")
    .order("created_at", { ascending: false });

  const rows: Queue[] = (raw ?? []).map((q: any) => ({
    ...q,
    entry_count: q.entry_count?.[0]?.count ?? 0,
  }));

  const openCount = rows.filter((q) => q.is_open).length;

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight" style={{ letterSpacing: "-0.03em" }}>
            Queues
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {rows.length} total · {openCount} open
          </p>
        </div>
        <Link href="/dashboard/queues/create">
          <Button className="h-10 px-5 font-semibold bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 border-0 shadow-lg shadow-blue-500/20">
            <Plus size={16} className="mr-2" />New queue
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total queues",   value: rows.length },
          { label: "Open now",       value: openCount },
          { label: "Waiting guests", value: rows.reduce((s, q) => s + q.entry_count, 0) },
          { label: "Permanent",      value: rows.filter((q) => q.queue_type === "permanent").length },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-border/40 bg-card/60 p-4">
            <p className="text-xs text-muted-foreground font-medium">{label}</p>
            <p className="text-2xl font-black mt-1" style={{ letterSpacing: "-0.03em" }}>{value}</p>
          </div>
        ))}
      </div>

      {/* List */}
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
            <Button variant="outline"><Plus size={15} className="mr-2" />Create queue</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((queue) => (
            <QueueCard
              key={queue.id}
              queue={queue}
              onToggle={toggleQueueOpen}
              onDelete={deleteQueue}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function QueuesPage() {
  return (
    <Suspense fallback={<QueuesLoading />}>
      <QueuesList />
    </Suspense>
  );
}