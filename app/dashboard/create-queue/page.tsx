import Link from "next/link";
import {
  ArrowLeft,
  CalendarClock,
  Clock3,
  Info,
  ListOrdered,
  Settings2,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Optional helper block
function FeatureHint({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-border/30">
      <div className="w-9 h-9 rounded-xl bg-muted/60 flex items-center justify-center flex-shrink-0">
        <Icon size={16} className="text-muted-foreground" />
      </div>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-muted-foreground mt-1">{desc}</p>
      </div>
    </div>
  );
}

export default function CreateQueuePage() {
  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Link href="/dashboard/queues">
          <Button
            variant="ghost"
            className="w-fit px-0 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to queues
          </Button>
        </Link>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                New Queue
              </Badge>
              <Badge
                variant="outline"
                className="border-border/40 text-muted-foreground"
              >
                UI only
              </Badge>
            </div>

            <h1
              className="text-3xl font-black tracking-tight"
              style={{ letterSpacing: "-0.03em" }}
            >
              Create queue
            </h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
              Set up a new queue for walk-ins, appointments, or recurring service
              windows. You can connect the real logic later.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" className="h-10 px-4">
              Save draft
            </Button>
            <Button className="h-10 px-5 font-semibold bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 border-0 shadow-lg shadow-blue-500/20">
              <Sparkles size={16} className="mr-2" />
              Create Queue
            </Button>
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic info */}
          <Card className="bg-card/60 border-border/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <ListOrdered size={16} className="text-muted-foreground" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="queue-name">Queue name</Label>
                <Input
                  id="queue-name"
                  placeholder="e.g. Morning Walk-ins"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="queue-description">Description</Label>
                <Textarea
                  id="queue-description"
                  placeholder="Short description for staff or guests..."
                  className="min-h-[110px] resize-none"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Queue type</Label>
                  <Select defaultValue="temporary">
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select queue type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="temporary">Temporary</SelectItem>
                      <SelectItem value="permanent">Permanent</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Service mode</Label>
                  <Select defaultValue="walkin">
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="walkin">Walk-in</SelectItem>
                      <SelectItem value="reservation">Reservation</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Capacity & timing */}
          <Card className="bg-card/60 border-border/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Clock3 size={16} className="text-muted-foreground" />
                Capacity & Timing
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="max-size">Max queue size</Label>
                  <Input
                    id="max-size"
                    type="number"
                    placeholder="50"
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="avg-service">Average service time (min)</Label>
                  <Input
                    id="avg-service"
                    type="number"
                    placeholder="10"
                    className="h-11"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start time</Label>
                  <Input type="time" className="h-11" />
                </div>

                <div className="space-y-2">
                  <Label>End time</Label>
                  <Input type="time" className="h-11" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Timezone</Label>
                <Select defaultValue="local">
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="local">Local timezone</SelectItem>
                    <SelectItem value="cet">CET / Europe</SelectItem>
                    <SelectItem value="utc">UTC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Rules */}
          <Card className="bg-card/60 border-border/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Settings2 size={16} className="text-muted-foreground" />
                Queue Rules
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-5">
              <div className="flex items-center justify-between gap-4 rounded-xl border border-border/40 bg-muted/20 p-4">
                <div>
                  <p className="text-sm font-semibold">Allow guest notes</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Let staff or guests leave notes during entry.
                  </p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between gap-4 rounded-xl border border-border/40 bg-muted/20 p-4">
                <div>
                  <p className="text-sm font-semibold">Enable no-show tracking</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Mark absent guests and track missed turns.
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between gap-4 rounded-xl border border-border/40 bg-muted/20 p-4">
                <div>
                  <p className="text-sm font-semibold">Auto-close queue</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Automatically stop new joins after closing time.
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="grace-period">Grace period (min)</Label>
                  <Input
                    id="grace-period"
                    type="number"
                    placeholder="5"
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slot-interval">Slot interval (min)</Label>
                  <Input
                    id="slot-interval"
                    type="number"
                    placeholder="15"
                    className="h-11"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Preview */}
          <Card className="bg-card/60 border-border/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Zap size={16} className="text-blue-400" />
                Queue Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="rounded-2xl border border-border/40 bg-gradient-to-br from-blue-500/10 via-violet-500/5 to-transparent p-4 space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">
                    Queue name
                  </p>
                  <p className="text-base font-bold mt-1">Morning Walk-ins</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-background/60 border border-border/40 p-3">
                    <p className="text-[11px] text-muted-foreground">Type</p>
                    <p className="text-sm font-semibold mt-1">Temporary</p>
                  </div>
                  <div className="rounded-xl bg-background/60 border border-border/40 p-3">
                    <p className="text-[11px] text-muted-foreground">Mode</p>
                    <p className="text-sm font-semibold mt-1">Walk-in</p>
                  </div>
                  <div className="rounded-xl bg-background/60 border border-border/40 p-3">
                    <p className="text-[11px] text-muted-foreground">Capacity</p>
                    <p className="text-sm font-semibold mt-1">50 people</p>
                  </div>
                  <div className="rounded-xl bg-background/60 border border-border/40 p-3">
                    <p className="text-[11px] text-muted-foreground">Avg wait</p>
                    <p className="text-sm font-semibold mt-1">10 min</p>
                  </div>
                </div>

                <div className="rounded-xl border border-border/40 bg-background/50 p-3">
                  <p className="text-[11px] text-muted-foreground">Schedule</p>
                  <p className="text-sm font-semibold mt-1">08:00 - 14:00</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick setup */}
          <Card className="bg-card/60 border-border/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">Quick Setup</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              <button
                type="button"
                className="w-full text-left group flex items-center gap-4 p-4 rounded-xl border border-border/40 bg-card/40 hover:bg-card/80 hover:border-border transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0">
                  <Zap size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">Fast temporary queue</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Best for same-day walk-ins
                  </p>
                </div>
              </button>

              <button
                type="button"
                className="w-full text-left group flex items-center gap-4 p-4 rounded-xl border border-border/40 bg-card/40 hover:bg-card/80 hover:border-border transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/10 to-violet-500/5 border border-violet-500/20 text-violet-400 flex items-center justify-center flex-shrink-0">
                  <CalendarClock size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">Scheduled service</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Recurring hours and controlled entry
                  </p>
                </div>
              </button>

              <button
                type="button"
                className="w-full text-left group flex items-center gap-4 p-4 rounded-xl border border-border/40 bg-card/40 hover:bg-card/80 hover:border-border transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                  <Users size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">Reservation queue</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    For booked guests and time slots
                  </p>
                </div>
              </button>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card className="bg-card/60 border-border/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Info size={16} className="text-muted-foreground" />
                Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              <FeatureHint
                icon={Clock3}
                title="Set realistic service time"
                desc="It helps estimate waiting time more accurately for guests."
              />
              <FeatureHint
                icon={CalendarClock}
                title="Use schedule for recurring queues"
                desc="Scheduled queues are better for services with fixed opening hours."
              />
              <FeatureHint
                icon={Users}
                title="Keep capacity manageable"
                desc="Smaller queue limits reduce crowding and improve flow."
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}