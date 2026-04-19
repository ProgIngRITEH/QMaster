"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
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
  Eye,
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

import { createQueue, type FormState } from "./actions";

// ── Time Select ───────────────────────────────────────────────────────────────

const HOURS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"));
const MINUTES = ["00", "15", "30", "45"];

function TimeSelect({
  name,
  defaultHour = "08",
  defaultMinute = "00",
  onChange,
}: {
  name: string;
  defaultHour?: string;
  defaultMinute?: string;
  onChange?: (val: string) => void;
}) {
  const [hour, setHour] = useState(defaultHour);
  const [minute, setMinute] = useState(defaultMinute);

  function handleHour(h: string) {
    setHour(h);
    onChange?.(`${h}:${minute}`);
  }
  function handleMinute(m: string) {
    setMinute(m);
    onChange?.(`${hour}:${m}`);
  }

  return (
    <div className="flex items-center gap-2">
      <input type="hidden" name={name} value={`${hour}:${minute}`} />
      <Select value={hour} onValueChange={handleHour}>
        <SelectTrigger className="h-11 flex-1">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="max-h-60">
          {HOURS.map((h) => (
            <SelectItem key={h} value={h}>{h}h</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span className="text-muted-foreground font-bold text-base shrink-0">:</span>
      <Select value={minute} onValueChange={handleMinute}>
        <SelectTrigger className="h-11 w-[90px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {MINUTES.map((m) => (
            <SelectItem key={m} value={m}>{m}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// ── SwitchField ───────────────────────────────────────────────────────────────

function SwitchField({
  name,
  label,
  description,
  defaultChecked,
}: {
  name: string;
  label: string;
  description: string;
  defaultChecked: boolean;
}) {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-border/40 bg-muted/20 p-4">
      <input type="hidden" name={name} value={checked ? "on" : "off"} />
      <div>
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={setChecked} aria-label={label} />
    </div>
  );
}

// ── Small helpers ─────────────────────────────────────────────────────────────

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive mt-1">{message}</p>;
}

function FeatureHint({ icon: Icon, title, desc }: { icon: React.ElementType; title: string; desc: string }) {
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

function PreviewCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-background/60 border border-border/40 p-3">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold mt-1">{value}</p>
    </div>
  );
}

// ── Label maps ────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
  temporary: "Temporary",
  permanent: "Permanent",
  scheduled: "Scheduled",
};
const MODE_LABELS: Record<string, string> = {
  walkin: "Walk-in",
  reservation: "Reservation",
  hybrid: "Hybrid",
};

// ── Presets ───────────────────────────────────────────────────────────────────

const PRESETS = [
  {
    label: "Fast temporary queue",
    sub: "Best for same-day walk-ins",
    Icon: Zap,
    cls: "from-blue-500/10 to-blue-500/5 border-blue-500/20 text-blue-400",
    values: { queueType: "temporary", serviceMode: "walkin", startHour: "08", endHour: "20", maxSize: "50", avgServiceTime: "10" },
  },
  {
    label: "Scheduled service",
    sub: "Recurring hours and controlled entry",
    Icon: CalendarClock,
    cls: "from-violet-500/10 to-violet-500/5 border-violet-500/20 text-violet-400",
    values: { queueType: "scheduled", serviceMode: "reservation", startHour: "09", endHour: "17", maxSize: "30", avgServiceTime: "20" },
  },
  {
    label: "Reservation queue",
    sub: "For booked guests and time slots",
    Icon: Users,
    cls: "from-emerald-500/10 to-emerald-500/5 border-emerald-500/20 text-emerald-400",
    values: { queueType: "permanent", serviceMode: "reservation", startHour: "00", endHour: "00", maxSize: "", avgServiceTime: "15" },
  },
] as const;

// ── Page ──────────────────────────────────────────────────────────────────────

const initialState: FormState = {};

export default function CreateQueuePage() {
  const [state, formAction, isPending] = useActionState(createQueue, initialState);
  const fe = state.fieldErrors ?? {};

  // All form state lifted up for live preview
  const [name, setName] = useState("");
  const [queueType, setQueueType] = useState("temporary");
  const [serviceMode, setServiceMode] = useState("walkin");
  const [maxSize, setMaxSize] = useState("");
  const [avgServiceTime, setAvgServiceTime] = useState("");
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("17:00");

  // Key trick to re-mount TimeSelect when preset is applied
  const [timeKey, setTimeKey] = useState(0);
  const [startHourDefault, setStartHourDefault] = useState("08");
  const [endHourDefault, setEndHourDefault] = useState("17");

  function applyPreset(p: typeof PRESETS[number]) {
    setQueueType(p.values.queueType);
    setServiceMode(p.values.serviceMode);
    setMaxSize(p.values.maxSize);
    setAvgServiceTime(p.values.avgServiceTime);
    setStartTime(`${p.values.startHour}:00`);
    setEndTime(`${p.values.endHour}:00`);
    setStartHourDefault(p.values.startHour);
    setEndHourDefault(p.values.endHour);
    setTimeKey((k) => k + 1);
  }

  const isPermanent = queueType === "permanent";

  // Derived preview values
  const previewName = name.trim() || null;
  const previewCapacity = isPermanent ? "Unlimited" : maxSize ? `${maxSize} people` : "Unlimited";
  const previewWait = avgServiceTime ? `${avgServiceTime} min` : "—";
  const previewSchedule = isPermanent ? "Always open" : `${startTime} – ${endTime}`;

  return (
    <form action={formAction} className="p-6 md:p-8 max-w-6xl mx-auto pb-8">

      {/* ── Header ── */}
      <div className="flex flex-col gap-4 mb-8">
        <Link href="/dashboard/queues">
          <Button variant="ghost" className="w-fit px-0 text-muted-foreground hover:text-foreground" type="button">
            <ArrowLeft size={16} className="mr-2" />
            Back to queues
          </Button>
        </Link>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">New Queue</Badge>
            </div>
            <h1 className="text-3xl font-black tracking-tight" style={{ letterSpacing: "-0.03em" }}>
              Create queue
            </h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
              Set up a new queue for walk-ins, appointments, or recurring service windows.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button type="button" variant="outline" className="h-10 px-4" disabled={isPending}>
              Save draft
            </Button>
            <Button
              type="submit"
              className="h-10 px-5 font-semibold bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 border-0 shadow-lg shadow-blue-500/20"
              disabled={isPending}
            >
              <Sparkles size={16} className="mr-2" />
              {isPending ? "Creating…" : "Create Queue"}
            </Button>
          </div>
        </div>

        {state.error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {state.error}
          </div>
        )}
      </div>

      {/* ── Main grid ── */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Left column */}
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
                <Label htmlFor="name">Queue name</Label>
                <Input
                  id="name" name="name"
                  placeholder="e.g. Morning Walk-ins"
                  className="h-11" required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <FieldError message={fe.name} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description" name="description"
                  placeholder="Short description for staff or guests..."
                  className="min-h-[90px] resize-none"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Queue type</Label>
                  <input type="hidden" name="queue_type" value={queueType} />
                  <Select value={queueType} onValueChange={setQueueType}>
                    <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="temporary">Temporary</SelectItem>
                      <SelectItem value="permanent">Permanent</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldError message={fe.queue_type} />
                </div>

                <div className="space-y-2">
                  <Label>Service mode</Label>
                  <input type="hidden" name="service_mode" value={serviceMode} />
                  <Select value={serviceMode} onValueChange={setServiceMode}>
                    <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
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

          {/* Capacity & Timing */}
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
                  <Label htmlFor="max_size">Max queue size</Label>
                  <Input
                    id="max_size" name="max_size"
                    type="number" min={1}
                    placeholder={isPermanent ? "Unlimited" : "e.g. 50"}
                    className="h-11"
                    value={maxSize}
                    onChange={(e) => setMaxSize(e.target.value)}
                    disabled={isPermanent}
                  />
                  {isPermanent && (
                    <p className="text-xs text-muted-foreground">Permanent queues have no size limit.</p>
                  )}
                  <FieldError message={fe.max_size} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="avg_service_time">Avg service time (min)</Label>
                  <Input
                    id="avg_service_time" name="avg_service_time"
                    type="number" min={1} placeholder="e.g. 10"
                    className="h-11"
                    value={avgServiceTime}
                    onChange={(e) => setAvgServiceTime(e.target.value)}
                  />
                  <FieldError message={fe.avg_service_time} />
                </div>
              </div>

              {!isPermanent && (
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start time</Label>
                    <TimeSelect
                      key={`start-${timeKey}`}
                      name="start_time"
                      defaultHour={startHourDefault}
                      defaultMinute="00"
                      onChange={setStartTime}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End time</Label>
                    <TimeSelect
                      key={`end-${timeKey}`}
                      name="end_time"
                      defaultHour={endHourDefault}
                      defaultMinute="00"
                      onChange={setEndTime}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Timezone</Label>
                <Select name="timezone" defaultValue="cet">
                  <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
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
            <CardContent className="pt-0 space-y-4">
              <SwitchField
                name="allow_guest_notes"
                label="Allow guest notes"
                description="Let staff or guests leave notes during entry."
                defaultChecked={false}
              />
              <SwitchField
                name="no_show_tracking"
                label="Enable no-show tracking"
                description="Mark absent guests and track missed turns."
                defaultChecked={true}
              />
              {isPermanent ? (
                <input type="hidden" name="auto_close" value="off" />
              ) : (
                <SwitchField
                  name="auto_close"
                  label="Auto-close queue"
                  description="Automatically stop new joins after closing time."
                  defaultChecked={true}
                />
              )}
              <div className="grid sm:grid-cols-2 gap-4 pt-1">
                <div className="space-y-2">
                  <Label htmlFor="grace_period">Grace period (min)</Label>
                  <Input id="grace_period" name="grace_period" type="number" min={0} placeholder="5" className="h-11" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slot_interval">Slot interval (min)</Label>
                  <Input id="slot_interval" name="slot_interval" type="number" min={1} placeholder="15" className="h-11" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-6">

          {/* Live Preview */}
          <Card className="bg-card/60 border-border/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Eye size={16} className="text-blue-400" />
                Live Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="rounded-2xl border border-border/40 bg-gradient-to-br from-blue-500/10 via-violet-500/5 to-transparent p-4 space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Queue name</p>
                  <p className={`text-base font-bold mt-1 transition-colors ${!previewName ? "text-muted-foreground/40 italic font-normal" : ""}`}>
                    {previewName ?? "Queue name…"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <PreviewCell label="Type" value={TYPE_LABELS[queueType] ?? queueType} />
                  <PreviewCell label="Mode" value={MODE_LABELS[serviceMode] ?? serviceMode} />
                  <PreviewCell label="Capacity" value={previewCapacity} />
                  <PreviewCell label="Avg wait" value={previewWait} />
                </div>

                <div className="rounded-xl border border-border/40 bg-background/50 p-3">
                  <p className="text-[11px] text-muted-foreground">Schedule</p>
                  <p className="text-sm font-semibold mt-1">{previewSchedule}</p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/30 shrink-0" />
                  <p className="text-xs text-muted-foreground">Starts closed — open from dashboard</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Setup */}
          <Card className="bg-card/60 border-border/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">Quick Setup</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className="w-full text-left flex items-center gap-4 p-4 rounded-xl border border-border/40 bg-card/40 hover:bg-card/80 hover:border-border transition-all duration-200"
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br border flex items-center justify-center flex-shrink-0 ${p.cls}`}>
                    <p.Icon size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{p.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{p.sub}</p>
                  </div>
                </button>
              ))}
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
              <FeatureHint icon={Clock3} title="Set realistic service time" desc="It helps estimate waiting time more accurately for guests." />
              <FeatureHint icon={CalendarClock} title="Use schedule for recurring queues" desc="Scheduled queues are better for services with fixed opening hours." />
              <FeatureHint icon={Users} title="Keep capacity manageable" desc="Smaller queue limits reduce crowding and improve flow." />
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}