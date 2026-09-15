"use client";

import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";

import productionService from "@/app/services/productionService";

import {
  Task,
  TaskCreatePayload,
  TaskPriority,
  TaskUpdatePayload,
} from "./types";

interface TaskFormDialogProps {
  open: boolean;
  task?: Task | null;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (data: TaskCreatePayload | TaskUpdatePayload) => Promise<void>;
}

const PRIORITIES: TaskPriority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];

export default function TaskFormDialog(props: TaskFormDialogProps) {
  if (!props.open) {
    return null;
  }

  return <TaskFormDialogContent key={props.task?.id ?? "new"} {...props} />;
}

function TaskFormDialogContent({
  open,
  task,
  submitting,
  onClose,
  onSubmit,
}: TaskFormDialogProps) {
  const isEditing = Boolean(task);

  const [productionFolderId, setProductionFolderId] = useState(
    () => task?.production_folder_id ?? "",
  );

  const [title, setTitle] = useState(() => task?.title ?? "");
  const [description, setDescription] = useState(() => task?.description ?? "");

  const [priority, setPriority] = useState<TaskPriority>(
    () => task?.priority ?? "MEDIUM",
  );

  const [deadline, setDeadline] = useState(() => {
    if (!task?.deadline) return "";

    const date = new Date(task.deadline);
    if (Number.isNaN(date.getTime())) return "";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  });

  const [folders, setFolders] = useState<
    NonNullable<
      Awaited<
        ReturnType<typeof productionService.getProductionFolders>
      >["data"]["data"]
    >
  >([]);

  const [loadingFolders, setLoadingFolders] = useState(false);

  const [folderError, setFolderError] = useState("");

  /*
   * Production folders are only required when creating
   * a task because the backend does not allow the folder
   * to be changed through TaskUpdate.
   */
  useEffect(() => {
    if (!open || isEditing) {
      return;
    }

    let cancelled = false;

    async function loadFolders() {
      try {
        setLoadingFolders(true);
        setFolderError("");

        const response = await productionService.getProductionFolders(1, 100);

        if (!cancelled) {
          setFolders(response.data.data);
        }
      } catch {
        if (!cancelled) {
          setFolderError("Unable to load production folders.");
        }
      } finally {
        if (!cancelled) {
          setLoadingFolders(false);
        }
      }
    }

    loadFolders();

    return () => {
      cancelled = true;
    };
  }, [open, isEditing]);

  if (!open) {
    return null;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formattedDeadline = deadline
      ? new Date(deadline).toISOString()
      : undefined;

    /*
     * Editing
     *
     * The backend TaskUpdate schema supports:
     * - title
     * - description
     * - priority
     * - deadline
     *
     * It does NOT support changing production_folder_id.
     */
    if (isEditing) {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || null,
        priority,
        deadline: formattedDeadline,
      });

      return;
    }

    /*
     * Creating
     *
     * New tasks are intentionally created without
     * an assignee. The backend handles:
     *
     * assigned_to = None
     * status = UNASSIGNED
     */
    await onSubmit({
      production_folder_id: productionFolderId,
      title: title.trim(),
      description: description.trim() || null,
      priority,
      deadline: formattedDeadline,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl border bg-background shadow-xl">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold">
              {isEditing ? "Edit Task" : "Create Task"}
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              {isEditing
                ? "Update the task details."
                : "Create a task for the production team. A Graphic Lead will assign it to a designer."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close"
            className="rounded-lg p-2 transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          {/* PRODUCTION FOLDER */}
          {!isEditing && (
            <div>
              <label
                htmlFor="production-folder"
                className="mb-2 block text-sm font-medium"
              >
                Production Folder
              </label>

              <select
                id="production-folder"
                value={productionFolderId}
                onChange={(event) => setProductionFolderId(event.target.value)}
                required
                disabled={loadingFolders}
                className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="">
                  {loadingFolders
                    ? "Loading production folders..."
                    : "Select a production folder"}
                </option>

                {folders.map((folder) => (
                  <option key={folder.id} value={folder.id}>
                    {folder.folder_number} — {folder.title}
                  </option>
                ))}
              </select>

              {folderError && (
                <p className="mt-1 text-xs text-destructive">{folderError}</p>
              )}

              {!loadingFolders && !folderError && folders.length === 0 && (
                <p className="mt-1 text-xs text-muted-foreground">
                  No production folders available.
                </p>
              )}

              {!loadingFolders && !folderError && folders.length > 0 && (
                <p className="mt-1 text-xs text-muted-foreground">
                  The task will be created as unassigned.
                </p>
              )}
            </div>
          )}

          {/* EDITING FOLDER INFORMATION */}
          {isEditing && task?.production_folder && (
            <div className="rounded-xl border bg-muted/30 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-5 w-5"
                  >
                    <path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
                  </svg>
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Production Folder
                  </p>

                  <p className="mt-1 font-semibold text-foreground">
                    {task.production_folder.folder_number}
                  </p>

                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {task.production_folder.title}
                  </p>
                </div>
              </div>

              <p className="mt-3 text-xs text-muted-foreground">
                The production folder cannot be changed when editing a task.
              </p>
            </div>
          )}

          {/* TITLE */}
          <div>
            <label
              htmlFor="task-title"
              className="mb-2 block text-sm font-medium"
            >
              Task Title
            </label>

            <input
              id="task-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
              maxLength={200}
              placeholder="e.g. Design wedding invitation"
              className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </div>

          {/* DESCRIPTION */}
          <div>
            <label
              htmlFor="task-description"
              className="mb-2 block text-sm font-medium"
            >
              Description
            </label>

            <textarea
              id="task-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={4}
              placeholder="Describe the work..."
              className="w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </div>

          {/* PRIORITY + DEADLINE */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="task-priority"
                className="mb-2 block text-sm font-medium"
              >
                Priority
              </label>

              <select
                id="task-priority"
                value={priority}
                onChange={(event) =>
                  setPriority(event.target.value as TaskPriority)
                }
                className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              >
                {PRIORITIES.map((item) => (
                  <option key={item} value={item}>
                    {item.charAt(0) + item.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="task-deadline"
                className="mb-2 block text-sm font-medium"
              >
                Deadline
              </label>

              <input
                id="task-deadline"
                type="datetime-local"
                value={deadline}
                onChange={(event) => setDeadline(event.target.value)}
                className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </div>
          </div>

          {/* ASSIGNMENT INFORMATION */}
          {!isEditing && (
            <div className="rounded-xl border bg-muted/40 px-4 py-3">
              <p className="text-sm font-medium">Assignment</p>

              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                This task will start as{" "}
                <strong className="font-semibold text-foreground">
                  Unassigned
                </strong>
                . The Graphic Lead will assign it to a Graphic Designer after
                creation.
              </p>
            </div>
          )}

          {/* EDITING ASSIGNMENT INFORMATION */}
          {isEditing && (
            <div className="rounded-xl border bg-muted/40 px-4 py-3">
              <p className="text-sm font-medium">Assignment</p>

              {task?.assignee ? (
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Currently assigned to{" "}
                  <strong className="font-semibold text-foreground">
                    {task.assignee.first_name} {task.assignee.last_name}
                  </strong>
                  .
                </p>
              ) : (
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  This task is currently{" "}
                  <strong className="font-semibold text-foreground">
                    Unassigned
                  </strong>
                  .
                </p>
              )}

              <p className="mt-1 text-xs text-muted-foreground">
                Assignment is managed separately by the Graphic Lead.
              </p>
            </div>
          )}

          {/* ACTIONS */}
          <div className="flex justify-end gap-3 border-t pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="h-10 rounded-lg border px-4 text-sm font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                submitting ||
                !title.trim() ||
                (!isEditing && (loadingFolders || !productionFolderId))
              }
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}

              {isEditing ? "Save Changes" : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
