"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { ClipboardList, Plus, RefreshCw } from "lucide-react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import taskService from "@/app/services/taskService";

import type { Task, TaskPriority, TaskStatus } from "@/components/tasks/types";

import TaskStats from "./TaskStats";
import TaskFilters from "./TaskFilters";
import TaskTable from "./TaskTable";
import AssignDesignerDialog from "./AssignDesignerDialog";
import ReviewTaskDialog from "./ReviewTaskDialog";

export default function GraphicLeadTasksPage() {
  const router = useRouter();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<TaskStatus | "ALL">("ALL");
  const [priority, setPriority] = useState<TaskPriority | "ALL">("ALL");

  const [assignmentTask, setAssignmentTask] = useState<Task | null>(null);
  const [assignmentOpen, setAssignmentOpen] = useState(false);

  const [reviewTask, setReviewTask] = useState<Task | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);

  const loadTasks = async () => {
    setLoading(true);

    try {
      const response = await taskService.getTasks(
        1,
        100,
        search.trim() || undefined,
        status !== "ALL" ? status : undefined,
        priority !== "ALL" ? priority : undefined,
        "DESIGN",
      );

      setTasks(response.data.data);
    } catch (error) {
      console.error("Failed to load tasks:", error);

      toast.error("Failed to load tasks.");
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
  }, [search, status, priority]);

  const handleReset = () => {
    setSearch("");
    setStatus("ALL");
    setPriority("ALL");
  };

  const handleAssign = (task: Task) => {
    setAssignmentTask(task);
    setAssignmentOpen(true);
  };

  const handleAssigned = (updatedTask: Task) => {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === updatedTask.id ? updatedTask : task,
      ),
    );
  };

  const handleReview = (task: Task) => {
    setReviewTask(task);
    setReviewOpen(true);
  };

  const handleReviewed = (updatedTask: Task) => {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === updatedTask.id ? updatedTask : task,
      ),
    );
  };

  const handleView = (task: Task) => {
    router.push(`/dashboard/graphic-lead/tasks/${task.id}`);
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
                Design tasks
              </h1>

              <p className="text-sm text-muted-foreground">
                Assign work, monitor progress, and review designer submissions.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
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

          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create task
          </Button>
        </div>
      </div>

      {/* Stats */}
      <TaskStats tasks={tasks} />

      {/* Filters */}
      <TaskFilters
        search={search}
        status={status}
        priority={priority}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
        onPriorityChange={setPriority}
        onReset={handleReset}
      />

      {/* Task table */}
      <TaskTable
        tasks={tasks}
        loading={loading}
        onAssign={handleAssign}
        onReview={handleReview}
        onView={handleView}
      />

      {/* Assign / Reassign */}
      <AssignDesignerDialog
        task={assignmentTask}
        open={assignmentOpen}
        onOpenChange={(open) => {
          setAssignmentOpen(open);

          if (!open) {
            setAssignmentTask(null);
          }
        }}
        onAssigned={handleAssigned}
      />

      {/* Review */}
      <ReviewTaskDialog
        task={reviewTask}
        open={reviewOpen}
        onOpenChange={(open) => {
          setReviewOpen(open);

          if (!open) {
            setReviewTask(null);
          }
        }}
        onReviewed={handleReviewed}
      />
    </div>
  );
}
