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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Suspense } from "react";
import { unstable_noStore as noStore } from "next/cache";

// ─── Auth guard ───────────────────────────────────────────────
async function getUser() {
  noStore();
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) redirect("/auth/login");
  return data.user;
}

// ─── Stat card ────────────────────────────────────────────────
function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  trend,
  color = "blue",
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  trend?: string;
  color?: "blue" | "violet" | "emerald" | "amber";
}) {
  const colorMap = {
    blue: "from-blue-500/10 to-blue-500/5 border-blue-500/20 text-blue-400",
    violet: "from-violet-500/10 to-violet-500/5 border-violet-500/20 text-violet-400",
    emerald: "from-emerald-500/10 to-emerald-500/5 border-emerald-500/20 text-emerald-400",
    amber: "from-amber-500/10 to-amber-500/5 border-amber-500/20 text-amber-400",
  };

  return (
    <Card className="bg-card/60 border-border/40 hover:border-border hover:bg-card/90 transition-all duration-200 group">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div
            className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorMap[color]} border flex items-center justify-center`}
          >
            <Icon size={18} />
          </div>
          {trend && (
            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] font-semibold">
              {trend}
            </Badge>
          )}
        </div>
        <p className="text-3xl font-black tracking-tight" style={{ letterSpacing: "-0.03em" }}>
          {value}
        </p>
        <p className="text-sm font-medium text-muted-foreground mt-0.5">{label}</p>
        {sub && <p className="text-xs text-muted-foreground/60 mt-1">{sub}</p>}
      </CardContent>
    </Card>
  );
}

// ─── Quick action card ────────────────────────────────────────
function QuickAction({
  href,
  icon: Icon,
  label,
  desc,
  badge,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  desc: string;
  badge?: string;
}) {
  return (
    <Link href={href}>
      <div className="group flex items-center gap-4 p-4 rounded-xl border border-border/40 bg-card/40 hover:bg-card/80 hover:border-border transition-all duration-200 cursor-pointer">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0 group-hover:from-blue-500/20 group-hover:to-blue-500/10 transition-all">
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
        <ArrowRight
          size={16}
          className="text-muted-foreground/40 group-hover:text-muted-foreground group-hover:translate-x-0.5 transition-all flex-shrink-0"
        />
      </div>
    </Link>
  );
}

// ─── Mock active queue row ─────────────────────────────────────
function QueueRow({
  name,
  type,
  count,
  status,
}: {
  name: string;
  type: "temporary" | "permanent";
  count: number;
  status: "active" | "paused" | "closed";
}) {
  const statusStyles = {
    active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    paused: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    closed: "bg-muted text-muted-foreground border-border",
  };

  return (
    <div className="flex items-center gap-4 py-3 px-4 rounded-xl hover:bg-muted/30 transition-colors group">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold truncate">{name}</p>
          <Badge
            variant="outline"
            className="text-[10px] font-medium border-border/40 text-muted-foreground hidden sm:inline-flex"
          >
            {type}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          {count} {count === 1 ? "person" : "people"} in queue
        </p>
      </div>
      <Badge className={`text-[10px] font-semibold ${statusStyles[status]}`}>
        {status}
      </Badge>
      <Link href="/dashboard/queues">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
        >
          Manage
        </Button>
      </Link>
    </div>
  );
}

// ─── Skeleton loader ──────────────────────────────────────────
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
      <div className="h-40 bg-muted rounded-2xl" />
    </div>
  );
}

// ─── Async inner component (does the data fetching) ───────────
async function DashboardContent() {
  const claims = await getUser();
  const email = claims.email as string;
  const name = email?.split("@")[0] ?? "there";
  const displayName = name.charAt(0).toUpperCase() + name.slice(1);

  // Placeholder stats — replace with real Supabase queries
  const stats = {
    activeQueues: 3,
    totalServedToday: 47,
    avgWaitMinutes: 8,
    scheduledQueues: 2,
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground font-medium">
            Welcome back
          </p>
          <h1
            className="text-3xl font-black tracking-tight mt-0.5"
            style={{ letterSpacing: "-0.03em" }}
          >
            {displayName} 👋
          </h1>
        </div>
        <Link href="/dashboard/queues/create">
          <Button className="h-10 px-5 font-semibold bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 border-0 shadow-lg shadow-blue-500/20">
            <PlusCircle size={16} className="mr-2" />
            New Queue
          </Button>
        </Link>
      </div>

      {/* ── Stats grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Active Queues"
          value={stats.activeQueues}
          icon={Activity}
          trend="+1 today"
          color="blue"
        />
        <StatCard
          label="Served Today"
          value={stats.totalServedToday}
          sub="across all queues"
          icon={CheckCircle2}
          trend="+12%"
          color="emerald"
        />
        <StatCard
          label="Avg Wait Time"
          value={`${stats.avgWaitMinutes}m`}
          sub="last 7 days"
          icon={Timer}
          color="amber"
        />
        <StatCard
          label="Scheduled"
          value={stats.scheduledQueues}
          sub="queues this week"
          icon={CalendarClock}
          color="violet"
        />
      </div>

      {/* ── Main grid: queues + quick actions ── */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Active queues — takes 2 cols */}
        <Card className="lg:col-span-2 bg-card/60 border-border/40">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-bold">Active Queues</CardTitle>
            <Link href="/dashboard/queues">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground hover:text-foreground"
              >
                View all
                <ArrowRight size={12} className="ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-1">
              <QueueRow
                name="Morning Walk-ins"
                type="temporary"
                count={6}
                status="active"
              />
              <QueueRow
                name="Barbershop Daily"
                type="permanent"
                count={3}
                status="active"
              />
              <QueueRow
                name="Lunch Service"
                type="scheduled"
                count={0}
                status="paused"
              />
            </div>

            {/* Empty state hint */}
            <div className="mt-4 pt-4 border-t border-border/30">
              <Link href="/dashboard/queues/new">
                <div className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-border/60 hover:border-blue-500/40 hover:bg-blue-500/5 transition-all group cursor-pointer">
                  <PlusCircle
                    size={16}
                    className="text-muted-foreground/40 group-hover:text-blue-400 transition-colors"
                  />
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
            <QuickAction
              href="/dashboard/queues/new"
              icon={Zap}
              label="Temp Queue"
              desc="Live in 30 seconds"
              badge="Fast"
            />
            <QuickAction
              href="/dashboard/queues/new?type=permanent"
              icon={ListOrdered}
              label="Permanent Queue"
              desc="With scheduling & hours"
            />
            <QuickAction
              href="/dashboard/scheduled"
              icon={CalendarClock}
              label="Schedule Queue"
              desc="Set recurring time slots"
            />
            <QuickAction
              href="/dashboard/guests"
              icon={Users}
              label="Guest Reservations"
              desc="Manage pending guests"
            />
          </CardContent>
        </Card>
      </div>

      {/* ── Bottom: recent activity ── */}
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
                label: "Peak hour",
                value: "10:00 – 11:00",
                icon: Clock,
                desc: "18 people served",
              },
              {
                label: "Busiest queue",
                value: "Morning Walk-ins",
                icon: ListOrdered,
                desc: "31 served today",
              },
              {
                label: "No-shows",
                value: "4",
                icon: Users,
                desc: "8.5% no-show rate",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="flex items-start gap-3 p-4 rounded-xl bg-muted/30 border border-border/30"
                >
                  <div className="w-8 h-8 rounded-lg bg-muted/60 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon size={15} className="text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">
                      {item.label}
                    </p>
                    <p className="text-sm font-bold mt-0.5">{item.value}</p>
                    <p className="text-xs text-muted-foreground/60 mt-0.5">
                      {item.desc}
                    </p>
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

// ─── Page shell — no async work here ─────────────────────────
export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}