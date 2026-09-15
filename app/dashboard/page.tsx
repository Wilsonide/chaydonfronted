"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/store/auth-store";
import { getDashboardRoute } from "@/lib/role-redirect";

export default function DashboardPage() {
  const router = useRouter();

  const { user, hydrated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!hydrated || isLoading || !user) return;

    router.replace(getDashboardRoute(user.role));
  }, [hydrated, isLoading, user, router]);

  if (!hydrated || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      Redirecting...
    </div>
  );
}
