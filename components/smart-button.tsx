"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

type SmartButtonProps = {
  loggedOutText?: string;
  loggedInText?: string;
  loggedOutHref?: string;
  loggedInHref?: string;
  className?: string;
};

export function SmartButton({
  loggedOutText = "Start for free",
  loggedInText = "View dashboard",
  loggedOutHref = "/auth/sign-up",
  loggedInHref = "/dashboard",
  className = "",
}: SmartButtonProps) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);
      setLoading(false);
    };

    run();
  }, []);

  if (loading) return null;

  const href = user ? loggedInHref : loggedOutHref;
  const text = user ? loggedInText : loggedOutText;

  return (
    <Link href={href}>
      <Button
        size="lg"
        className={`h-12 px-8 text-base font-semibold cursor-pointer bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 border-0 shadow-lg shadow-blue-500/25 transition-all duration-200 ${className}`}
      >
        {text}
        <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </Button>
    </Link>
  );
}