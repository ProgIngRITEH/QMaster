import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  ListOrdered,
  PlusCircle,
  Users,
  Clock,
  TrendingUp,
  CalendarClock,
  ArrowRight,
  Activity,
  CheckCircle2,
  Timer,
  Zap,
  Power,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Suspense } from "react";
import { unstable_noStore as noStore } from "next/cache";

// ─── Types ────────────────────────────────────────────────────

type Queue = {
  id: string;
  name: string;
  queue_type: "temporary" | "permanent" | "scheduled";
  is_open: boolean;
  is_active: boolean;
  avg_service_time: number | null;
  start_time: string | null;
  end_time: string | null;
  entry_count: number;
};

// ─── Auth + data ──────────────────────────────────────────────

async function getDashboardData() {
  noStore();
  const supabase = await createClient();
  const { data: authData, error } = await supabase.auth.getUser();
  if (error || !authData?.user) redirect("/auth/login");

  const user = authData.user;

  // All queues for this user
  const { data: rawQueues } = await supabase
    .from("queues")
    .select(`*, entry_count:queue_entries(count)`)
    .eq("owner_id", user.id)
    .eq("queue_entries.status", "waiting")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  const queues: Queue[] = (rawQueues ?? []).map((q: any) => ({
    ...q,
    entry_count: q.entry_count?.[0]?.count ?? 0,
  }));

  // Served today (across all queues)
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { count: servedToday } = await supabase
    .from("queue_entries")
    .select("*", { count: "exact", head: true })
    .eq("status", "served")
    .in("queue_id", queues.map((q) => q.id))
    .gte("served_at", todayStart.toISOString());

  // No-shows today
  const { count: noShowsToday } = await supabase
    .from("queue_entries")
    .select("*", { count: "exact", head: true })
    .eq("status", "no_show")
    .in("queue_id", queues.map((q) => q.id))
    .gte("joined_at", todayStart.toISOString());

  // Total served (for no-show rate)
  const totalToday = (servedToday ?? 0) + (noShowsToday ?? 0);
  const noShowRate = totalToday > 0
    ? Math.round(((noShowsToday ?? 0) / totalToday) * 100)
    : 0;

  // Avg wait time across open queues
  const avgWait = queues.length > 0
    ? Math.round(
        queues
          .filter((q) => q.avg_service_time)
          .reduce((sum, q) => sum + (q.avg_service_time ?? 0), 0) /
          Math.max(queues.filter((q) => q.avg_service_time).length, 1)
      )
    : 0;

  return {
    user,
    queues,
    openQueues: queues.filter((q) => q.is_open),
    scheduledQueues: queues.filter((q) => q.queue_type === "scheduled"),
    servedToday: servedToday ?? 0,
    noShowsToday: noShowsToday ?? 0,
    noShowRate,
    avgWait,
    totalWaiting: queues.reduce((s, q) => s + q.entry_count, 0),
  };
}

// ─── Stat card ────────────────────────────────────────────────

function StatCard({
  label, value, sub, icon: Icon, trend, color = "blue",
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  trend?: string;
  color?: "blue" | "violet" | "emerald" | "amber";
}) {
  const colorMap = {
    blue:    "from-blue-500/10 to-blue-500/5 border-blue-500/20 text-blue-400",
    violet:  "from-violet-500/10 to-violet-500/5 border-violet-500/20 text-violet-400",
    emerald: "from-emerald-500/10 to-emerald-500/5 border-emerald-500/20 text-emerald-400",
    amber:   "from-amber-500/10 to-amber-500/5 border-amber-500/20 text-amber-400",
  };
  return (
    <Card className="bg-card/60 border-border/40 hover:border-border hover:bg-card/90 transition-all duration-200">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorMap[color]} border flex items-center justify-center`}>
            <Icon size={18} />
          </div>
          {trend && (
            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] font-semibold">
              {trend}
            </Badge>
          )}
        </div>
        <p className="text-3xl font-black tracking-tight" style={{ letterSpacing: "-0.03em" }}>{value}</p>
        <p className="text-sm font-medium text-muted-foreground mt-0.5">{label}</p>
        {sub && <p className="text-xs text-muted-foreground/60 mt-1">{sub}</p>}
      </CardContent>
    </Card>
  );
}

// ─── Queue row ────────────────────────────────────────────────

function QueueRow({ queue }: { queue: Queue }) {
  const statusLabel = queue.is_open ? "open" : "closed";
  const statusStyle = queue.is_open
    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
    : "bg-muted text-muted-foreground border-border";

  const typeColors: Record<string, string> = {
    temporary: "text-blue-400",
    permanent: "text-violet-400",
    scheduled: "text-amber-400",
  };

  return (
    <div className="flex items-center gap-4 py-3 px-4 rounded-xl hover:bg-muted/30 transition-colors group">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold truncate">{queue.name}</p>
          <Badge variant="outline" className={`text-[10px] font-medium border-border/40 hidden sm:inline-flex ${typeColors[queue.queue_type]}`}>
            {queue.queue_type}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          {queue.entry_count} {queue.entry_count === 1 ? "person" : "people"} waiting
        </p>
      </div>
      <Badge className={`text-[10px] font-semibold ${statusStyle}`}>
        {statusLabel}
      </Badge>
      <Link href={`/dashboard/queues/${queue.id}`}>
        <Button variant="ghost" size="sm" className="h-7 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
          Manage
        </Button>
      </Link>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-3 w-24 bg-muted rounded-md" />
          <div className="h-8 w-40 bg-muted rounded-md" />
        </div>
        <div className="h-10 w-32 bg-muted rounded-xl" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-muted rounded-2xl" />
        ))}
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-64 bg-muted rounded-2xl" />
        <div className="h-64 bg-muted rounded-2xl" />
      </div>
    </div>
  );
}

// ─── Main content ─────────────────────────────────────────────

async function DashboardContent() {
  const {
    user, queues, openQueues, scheduledQueues,
    servedToday, noShowsToday, noShowRate, avgWait, totalWaiting,
  } = await getDashboardData();

  const email = user.email ?? "";
  const name = email.split("@")[0] ?? "there";
  const displayName = name.charAt(0).toUpperCase() + name.slice(1);

  // Top 3 queues for the preview list (open first, then by entry count)
  const previewQueues = [...queues]
    .sort((a, b) => {
      if (a.is_open !== b.is_open) return a.is_open ? -1 : 1;
      return b.entry_count - a.entry_count;
    })
    .slice(0, 4);

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground font-medium">Welcome back</p>
          <h1 className="text-3xl font-black tracking-tight mt-0.5" style={{ letterSpacing: "-0.03em" }}>
            {displayName} 👋
          </h1>
        </div>
        <Link href="/dashboard/queues/create">
          <Button className="h-10 px-5 font-semibold bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 border-0 shadow-lg shadow-blue-500/20">
            <PlusCircle size={16} className="mr-2" />New Queue
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Open Queues"
          value={openQueues.length}
          sub={`${queues.length} total`}
          icon={Activity}
          color="blue"
        />
        <StatCard
          label="Served Today"
          value={servedToday}
          sub="across all queues"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          label="Avg Wait Time"
          value={avgWait ? `${avgWait}m` : "—"}
          sub="based on service time"
          icon={Timer}
          color="amber"
        />
        <StatCard
          label="Waiting Now"
          value={totalWaiting}
          sub={`across ${openQueues.length} open queues`}
          icon={Users}
          color="violet"
        />
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Queue list */}
        <Card className="lg:col-span-2 bg-card/60 border-border/40">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-bold">Your Queues</CardTitle>
            <Link href="/dashboard/queues">
              <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-foreground">
                View all <ArrowRight size={12} className="ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-0">
            {previewQueues.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm text-muted-foreground">No queues yet.</p>
              </div>
            ) : (
              <div className="space-y-1">
                {previewQueues.map((q) => (
                  <QueueRow key={q.id} queue={q} />
                ))}
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-border/30">
              <Link href="/dashboard/queues/create">
                <div className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-border/60 hover:border-blue-500/40 hover:bg-blue-500/5 transition-all group cursor-pointer">
                  <PlusCircle size={16} className="text-muted-foreground/40 group-hover:text-blue-400 transition-colors" />
                  <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                    Create a new queue
                  </span>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Quick actions */}
        <Card className="bg-card/60 border-border/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            {[
              { href: "/dashboard/queues/create", icon: Zap,          label: "Temp Queue",        desc: "Live in 30 seconds",          badge: "Fast" },
              { href: "/dashboard/queues/create", icon: ListOrdered,  label: "Permanent Queue",   desc: "With scheduling & hours" },
              { href: "/dashboard/queues",        icon: Power,         label: "Manage Queues",     desc: "Open, close or edit queues" },
              { href: "/dashboard/queues",        icon: Users,         label: "View Guests",       desc: "See who's waiting now" },
            ].map(({ href, icon: Icon, label, desc, badge }) => (
              <Link key={label} href={href}>
                <div className="group flex items-center gap-4 p-4 rounded-xl border border-border/40 bg-card/40 hover:bg-card/80 hover:border-border transition-all duration-200 cursor-pointer">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0">
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{label}</p>
                      {badge && (
                        <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px] px-1.5 h-4">
                          {badge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{desc}</p>
                  </div>
                  <ArrowRight size={16} className="text-muted-foreground/40 group-hover:text-muted-foreground group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Today's summary */}
      <Card className="bg-card/60 border-border/40">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <TrendingUp size={16} className="text-muted-foreground" />
            Today's Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              {
                label: "Served today",
                value: servedToday > 0 ? servedToday.toString() : "—",
                icon: CheckCircle2,
                desc: servedToday > 0 ? "across all queues" : "No one served yet",
              },
              {
                label: "Scheduled queues",
                value: scheduledQueues.length > 0 ? scheduledQueues.length.toString() : "—",
                icon: CalendarClock,
                desc: scheduledQueues.length > 0
                  ? scheduledQueues.map((q) => q.name).join(", ")
                  : "No scheduled queues",
              },
              {
                label: "No-shows",
                value: noShowsToday > 0 ? noShowsToday.toString() : "—",
                icon: Users,
                desc: noShowsToday > 0 ? `${noShowRate}% no-show rate` : "No no-shows today",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-start gap-3 p-4 rounded-xl bg-muted/30 border border-border/30">
                  <div className="w-8 h-8 rounded-lg bg-muted/60 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon size={15} className="text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">{item.label}</p>
                    <p className="text-sm font-bold mt-0.5">{item.value}</p>
                    <p className="text-xs text-muted-foreground/60 mt-0.5 truncate max-w-[160px]">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}