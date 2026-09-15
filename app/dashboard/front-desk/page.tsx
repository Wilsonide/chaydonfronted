"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import DashboardService from "@/app/services/dashboard.service";
import FrontDeskDashboard from "@/components/dashboard/FrontDeskDashboard";
import { FrontDeskDashboard as FrontDeskDashboardType } from "@/app/types/dashboard";
import { useAuthStore } from "@/app/store/auth-store";

export default function FrontDeskPage() {
  const router = useRouter();

  const { user, hydrated, isLoading } = useAuthStore();

  const [data, setData] = useState<FrontDeskDashboardType | null>(null);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hydrated || isLoading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (user.role !== "FRONT_DESK") {
      router.replace("/dashboard");
      return;
    }

    const loadDashboard = async () => {
      try {
        setError(null);

        const response = await DashboardService.getSummary();

        if (response.data.role !== "FRONT_DESK") {
          throw new Error("Invalid dashboard response.");
        }

        setData(response.data);
      } catch (error) {
        console.error("Failed to load dashboard:", error);
        setError("Unable to load dashboard.");
      }
    };

    loadDashboard();
  }, [hydrated, isLoading, user, router]);

  if (!hydrated || isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
        {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        Loading dashboard...
      </div>
    );
  }

  return <FrontDeskDashboard data={data} />;
}
