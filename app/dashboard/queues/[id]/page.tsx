import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import AdminQueueDetailClient from "./client";

export default function AdminQueueDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="animate-spin text-muted-foreground" size={32} />
        </div>
      }
    >
      <AdminQueueDetailClient />
    </Suspense>
  );
}