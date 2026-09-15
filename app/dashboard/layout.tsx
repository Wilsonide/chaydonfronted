"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/app-shell";
import { useAuthStore } from "@/app/store/auth-store";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();

  const { user, hydrated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!hydrated || isLoading) return;

    if (!user) {
      router.replace("/login");
    }
  }, [hydrated, isLoading, user, router]);

  if (!hydrated || isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!user) return null;

  return <AppShell>{children}</AppShell>;
}
