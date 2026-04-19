"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import {
  LayoutDashboard,
  ListOrdered,
  PlusCircle,
  Settings,
  CalendarClock,
  Users,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRefreshOnBack } from "@/hooks/use-refresh-on-back";

const navItems = [
  { label: "Dashboard",    href: "/dashboard",               icon: LayoutDashboard, exact: true },
  { label: "My Queues",    href: "/dashboard/queues",        icon: ListOrdered,     exact: true },
  { label: "Create Queue", href: "/dashboard/queues/create", icon: PlusCircle,      exact: true, highlight: true },
  { label: "Scheduled",    href: "/dashboard/scheduled",     icon: CalendarClock },
  { label: "Guests",       href: "/dashboard/guests",        icon: Users },
  { label: "Settings",     href: "/dashboard/settings",      icon: Settings },
];

function SidebarContent({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-border/40 flex-shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2.5 group" onClick={onNavigate}>
          <div className="relative w-8 h-8 flex-shrink-0">
            <div className="absolute inset-0 rounded-lg bg-blue-500 opacity-20 group-hover:opacity-30 transition-opacity blur-sm" />
            <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white">
                <path d="M3 6h18M3 12h12M3 18h8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="19" cy="18" r="3" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
          </div>
          <span className="text-lg font-black tracking-tight" style={{ letterSpacing: "-0.04em" }}>
            QMaster
          </span>
        </Link>
      </div>

      {/* Nav — only this scrolls if nav items overflow */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto min-h-0">
        <p className="px-3 pb-2 text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground/60">
          Navigation
        </p>
        {navItems.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                active
                  ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                  : item.highlight
                  ? "text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-dashed border-border/60 hover:border-border"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Icon
                size={16}
                className={cn(
                  "flex-shrink-0 transition-colors",
                  active ? "text-blue-400" : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              <span className="flex-1">{item.label}</span>
              {item.highlight && !active && (
                <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px] px-1.5 py-0 h-4">
                  New
                </Badge>
              )}
              {active && <ChevronRight size={14} className="text-blue-400 opacity-60" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-4 py-4 border-t border-border/40 space-y-2 flex-shrink-0">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground font-medium">Theme</span>
          <ThemeSwitcher />
        </div>
        <AuthButton />
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  useRefreshOnBack();

  return (
    // This div takes exactly the viewport — position fixed so it doesn't
    // interact with body scroll at all. Landing page and other routes
    // are unaffected because they don't use this layout.
    <div className="fixed inset-0 flex bg-background">

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 flex-col border-r border-border/40 bg-card/50 backdrop-blur-xl flex-shrink-0">
        <SidebarContent pathname={pathname} />
      </aside>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 flex flex-col border-r border-border/40 bg-card backdrop-blur-xl transition-transform duration-300 md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <X size={16} />
        </button>
        <SidebarContent pathname={pathname} onNavigate={() => setMobileOpen(false)} />
      </aside>

      {/* Main content column */}
      <div className="flex flex-col flex-1 min-w-0 min-h-0">
        {/* Mobile topbar */}
        <header className="md:hidden flex items-center justify-between px-4 h-14 border-b border-border/40 bg-card/50 backdrop-blur-xl flex-shrink-0">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setMobileOpen(true)}>
            <Menu size={18} />
          </Button>
          <span className="text-base font-black tracking-tight" style={{ letterSpacing: "-0.04em" }}>
            QMaster
          </span>
          <ThemeSwitcher />
        </header>

        {/* THE only scrollable area in dashboard */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}