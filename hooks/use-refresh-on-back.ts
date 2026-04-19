"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Calls router.refresh() whenever the user navigates with the browser
 * back/forward buttons (popstate). This forces Next.js to re-fetch
 * server data (auth, session, etc.) instead of serving a stale cache.
 */
export function useRefreshOnBack() {
  const router = useRouter();

  useEffect(() => {
    const handlePopState = () => {
      router.refresh();
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [router]);
}