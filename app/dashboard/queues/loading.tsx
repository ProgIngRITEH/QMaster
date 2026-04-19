import { Card, CardContent } from "@/components/ui/card";

export default function QueuesLoading() {
  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-32 rounded-lg bg-muted/60 animate-pulse" />
          <div className="h-4 w-24 rounded-lg bg-muted/40 animate-pulse" />
        </div>
        <div className="h-10 w-32 rounded-lg bg-muted/60 animate-pulse" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border/40 bg-card/60 p-4 space-y-2">
            <div className="h-3 w-20 rounded bg-muted/40 animate-pulse" />
            <div className="h-7 w-10 rounded bg-muted/60 animate-pulse" />
          </div>
        ))}
      </div>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="bg-card/60 border-border/40">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-muted/60 animate-pulse shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-40 rounded bg-muted/60 animate-pulse" />
                  <div className="h-3 w-64 rounded bg-muted/40 animate-pulse" />
                </div>
                <div className="h-8 w-20 rounded-lg bg-muted/40 animate-pulse" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}