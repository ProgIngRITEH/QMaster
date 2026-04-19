// app/queue/[id]/page.tsx
// Public page — no auth required, accessible by anyone (guests)

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import QueuePublicClient from "./client";

// Next.js 16: wrap the client component in Suspense at the page level
// so the route doesn't block on rendering
export default function QueuePublicPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="animate-spin text-muted-foreground" size={32} />
        </div>
      }
    >
      <QueuePublicClient />
    </Suspense>
  );
}