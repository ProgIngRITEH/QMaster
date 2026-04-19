"use client";

import { useRefreshOnBack } from "@/hooks/use-refresh-on-back";

/**
 * Drop this anywhere in a Server Component tree to enable
 * auth refresh on browser back/forward navigation.
 * Renders nothing — purely a behaviour hook wrapper.
 */
export function RefreshOnBack() {
  useRefreshOnBack();
  return null;
}