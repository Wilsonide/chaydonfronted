"use client";

import { useCallback, useEffect, useState } from "react";

import { ClipboardList, Loader2, Plus } from "lucide-react";

import { toast } from "sonner";

import taskService from "@/app/services/taskService";

import {
  Task,
  TaskCreatePayload,
  TaskUpdatePayload,
} from "@/components/tasks/types";

import TaskDetailsDialog from "@/components/tasks/TaskDetailsDialog";
import TaskFilters from "@/components/tasks/TaskFilters";
import TaskFormDialog from "@/components/tasks/TaskFormDialog";
import TaskTable from "@/components/tasks/TaskTable";

const PER_PAGE = 10;

export default function SuperAdminTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);

  const [page, setPage] = useState(1);

  const [total, setTotal] = useState(0);

  const [pages, setPages] = useState(1);

  const [search, setSearch] = useState("");

  const [status, setStatus] = useState("");

  const [priority, setPriority] = useState("");

  const [loading, setLoading] = useState(true);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const [detailsOpen, setDetailsOpen] = useState(false);

  const [formOpen, setFormOpen] = useState(false);

  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [submitting, setSubmitting] = useState(false);

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);

      const response = await taskService.getTasks(
        page,
        PER_PAGE,
        search || undefined,
        status || undefined,
        priority || undefined,
      );

      const result = response.data;

      setTasks(result.data);

      setTotal(result.meta.total);

      setPages(
        result.meta.pages ??
          Math.max(1, Math.ceil(result.meta.total / result.meta.limit)),
      );
    } catch (error) {
      console.error("Failed to load tasks:", error);

      toast.error("Failed to load tasks.");
    } finally {
      setLoading(false);
    }
  }, [page, search, status, priority]);

  useEffect(() => {
    Promise.resolve().then(() => loadTasks());
  }, [loadTasks]);

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleStatus(value: string) {
    setStatus(value);
    setPage(1);
  }

  function handlePriority(value: string) {
    setPriority(value);
    setPage(1);
  }

  function openCreate() {
    setEditingTask(null);
    setFormOpen(true);
  }

  function openEdit(task: Task) {
    setEditingTask(task);
    setFormOpen(true);
  }

  function openDetails(task: Task) {
    setSelectedTask(task);
    setDetailsOpen(true);
  }

  async function handleSubmit(data: TaskCreatePayload | TaskUpdatePayload) {
    try {
      setSubmitting(true);

      if (editingTask) {
        await taskService.updateTask(editingTask.id, data as TaskUpdatePayload);

        toast.success("Task updated successfully.");
      } else {
        await taskService.createTask(data as TaskCreatePayload);

        toast.success("Task created successfully.");
      }

      setFormOpen(false);
      setEditingTask(null);

      await loadTasks();
    } catch (error) {
      console.error("Failed to save task:", error);

      toast.error("Failed to save task.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(task: Task) {
    const confirmed = window.confirm(
      `Delete "${task.title}"?\n\nThis action cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(task.id);

      await taskService.deleteTask(task.id);

      toast.success("Task deleted successfully.");

      await loadTasks();
    } catch (error) {
      console.error("Failed to delete task:", error);

      toast.error("Failed to delete task.");
    } finally {
      setDeletingId(null);
    }
  }

  const showingFrom = total === 0 ? 0 : (page - 1) * PER_PAGE + 1;

  const showingTo = Math.min(page * PER_PAGE, total);

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
            <ClipboardList className="h-5 w-5 text-primary" />
          </div>

          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Tasks</h1>

            <p className="text-sm text-muted-foreground">
              Manage design tasks and monitor their progress.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Create Task
        </button>
      </div>

      <TaskFilters
        search={search}
        status={status}
        priority={priority}
        loading={loading}
        onSearchChange={handleSearch}
        onStatusChange={handleStatus}
        onPriorityChange={handlePriority}
        onRefresh={loadTasks}
      />

      <TaskTable
        tasks={tasks}
        loading={loading}
        deletingId={deletingId}
        onView={openDetails}
        onEdit={openEdit}
        onDelete={handleDelete}
      />

      {!loading && total > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Showing{" "}
            <span className="font-medium text-foreground">{showingFrom}</span>{" "}
            to <span className="font-medium text-foreground">{showingTo}</span>{" "}
            of <span className="font-medium text-foreground">{total}</span>{" "}
            tasks
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="h-9 rounded-lg border px-3 text-sm transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>

            <span className="px-2 text-sm text-muted-foreground">
              Page {page} of {pages}
            </span>

            <button
              type="button"
              disabled={page >= pages}
              onClick={() => setPage((current) => Math.min(pages, current + 1))}
              className="h-9 rounded-lg border px-3 text-sm transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <TaskFormDialog
        open={formOpen}
        task={editingTask}
        submitting={submitting}
        onClose={() => {
          if (!submitting) {
            setFormOpen(false);
            setEditingTask(null);
          }
        }}
        onSubmit={handleSubmit}
      />

      <TaskDetailsDialog
        open={detailsOpen}
        task={selectedTask}
        onClose={() => {
          setDetailsOpen(false);
          setSelectedTask(null);
        }}
        onUpdated={loadTasks}
      />

      {loading && tasks.length === 0 && (
        <div className="hidden">
          <Loader2 />
        </div>
      )}
    </div>
  );
}
