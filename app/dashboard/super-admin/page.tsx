/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import DashboardService from "@/app/services/dashboard.service";
import { SuperAdminDashboard as SuperAdminDashboardType } from "@/app/types/dashboard";
import { useAuthStore } from "@/app/store/auth-store";
import SuperAdminDashboard from "@/components/dashboard/SuperAdminDashboard";

export default function SuperAdminPage() {
  const router = useRouter();

  const { user, hydrated, isLoading } = useAuthStore();

  const [data, setData] = useState<SuperAdminDashboardType | null>(null);
  const [error, setError] = useState<string | null>(null);

  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (!hydrated || isLoading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (user.role !== "SUPER_ADMIN") {
      router.replace("/dashboard");
      return;
    }

    if (hasLoadedRef.current) return;

    hasLoadedRef.current = true;

    let cancelled = false;

    const loadDashboard = async () => {
      try {
        setError(null);

        const response = await DashboardService.getSummary();

        if (cancelled) return;

        if (response.data.role !== "SUPER_ADMIN") {
          throw new Error("Invalid dashboard response.");
        }

        setData(response.data);
      } catch (error: any) {
        if (cancelled) return;

        console.error(
          "Failed to load dashboard:",
          error?.response?.data || error?.message || error,
        );

        setError("Unable to load dashboard.");
      }
    };

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [hydrated, isLoading, user, router]);

  if (!hydrated || isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-sm text-muted-foreground">
          Loading dashboard...
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
        {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-sm text-muted-foreground">
          Loading dashboard...
        </div>
      </div>
    );
  }

  return <SuperAdminDashboard data={data} />;
}
