"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/client";
import { LogoutButton } from "./logout-button";
import { useEffect, useState } from "react";

export function AuthButton() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    const resolve = (session: any) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
      setLoading(false);
    };

    // 1. session fetch
    supabase.auth.getSession().then(({ data }) => {
      resolve(data.session);

      // fallback guard (AKO se nešto zaglavi)
      setTimeout(() => {
        if (mounted) setLoading(false);
      }, 800);
    });

    // 2. auth listener
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        resolve(session);
      }
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return <div className="h-6 w-24 bg-muted rounded-md animate-pulse" />;
  }

  return user ? (
    <div className="flex items-center gap-4">
      <span className="text-sm">
        Hey, {user?.user_metadata?.full_name || "user"}!
      </span>
      <LogoutButton />
    </div>
  ) : (
    <div className="flex gap-2">
      <Button asChild size="sm" variant="outline">
        <Link href="/auth/login">Sign in</Link>
      </Button>
      <Button asChild size="sm">
        <Link href="/auth/sign-up">Sign up</Link>
      </Button>
    </div>
  );
}