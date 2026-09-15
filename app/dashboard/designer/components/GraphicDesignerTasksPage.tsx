"use client";

import { useEffect, useState } from "react";

import { ClipboardList, RefreshCw } from "lucide-react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import taskService from "@/app/services/taskService";

import type { Task, TaskStatus } from "@/components/tasks/types";

import DesignerTaskStats from "./DesignerTaskStats";
import DesignerTaskFilters from "./DesignerTaskFilters";
import DesignerTaskTable from "./DesignerTaskTable";

export default function GraphicDesignerTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<TaskStatus | "ALL">("ALL");

  const loadTasks = async () => {
    setLoading(true);

    try {
      const response = await taskService.getMyTasks(
        1,
        100,
        search.trim() || undefined,
      );

      let nextTasks = response.data.data;

      if (status !== "ALL") {
        nextTasks = nextTasks.filter((task) => task.status === status);
      }

      setTasks(nextTasks);
    } catch (error) {
      console.error("Failed to load designer tasks:", error);

      toast.error("Failed to load your tasks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadTasks();
    }, 300);

    return () => {
      window.clearTimeout(timer);
    };
  }, [search, status]);

  const handleReset = () => {
    setSearch("");
    setStatus("ALL");
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
              <ClipboardList className="h-5 w-5 text-primary" />
            </div>

            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                My tasks
              </h1>

              <p className="text-sm text-muted-foreground">
                Manage your assigned design work and submit completed designs
                for review.
              </p>
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={() => void loadTasks()}
          disabled={loading}
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <DesignerTaskStats tasks={tasks} />

      {/* Filters */}
      <DesignerTaskFilters
        search={search}
        status={status}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
        onReset={handleReset}
      />

      {/* Table */}
      <DesignerTaskTable tasks={tasks} loading={loading} />
    </div>
  );
}
