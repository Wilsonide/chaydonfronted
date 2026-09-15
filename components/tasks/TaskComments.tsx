"use client";

import { useEffect, useRef, useState } from "react";

import { FileText, Loader2, Paperclip, Send, Trash2, X } from "lucide-react";

import { toast } from "sonner";

import taskService from "@/app/services/taskService";

import { TaskComment } from "./types";

interface TaskCommentsProps {
  taskId: string;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

function formatRole(role: string) {
  return role
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getUserName(comment: TaskComment) {
  if (!comment.user) {
    return "Unknown user";
  }

  return `${comment.user.first_name} ${comment.user.last_name}`;
}

export default function TaskComments({ taskId }: TaskCommentsProps) {
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  async function loadComments() {
    try {
      setLoading(true);

      const response = await taskService.getComments(taskId);

      setComments(response.data);
    } catch (error) {
      console.error("Failed to load comments:", error);

      toast.error("Failed to load task comments.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    Promise.resolve().then(() => loadComments());
  }, [taskId]);

  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setSelectedFile(file);

    // Reset the input so the same file can be selected again
    // after removing it.
    event.target.value = "";
  }

  function removeSelectedFile() {
    setSelectedFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleSend() {
    const trimmedMessage = message.trim();

    if (!trimmedMessage && !selectedFile) {
      toast.error("Write a comment or attach a file.");
      return;
    }

    try {
      setSending(true);

      if (selectedFile) {
        await taskService.addCommentWithAttachment(
          taskId,
          trimmedMessage || null,
          selectedFile,
        );
      } else {
        await taskService.addComment(taskId, {
          message: trimmedMessage,
        });
      }

      setMessage("");
      setSelectedFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      await loadComments();

      toast.success(
        selectedFile ? "Comment and attachment added." : "Comment added.",
      );
    } catch (error) {
      console.error("Failed to send comment:", error);

      toast.error("Failed to send comment.");
    } finally {
      setSending(false);
    }
  }

  async function handleDeleteAttachment(commentId: string) {
    const confirmed = window.confirm("Delete this attachment?");

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(commentId);

      await taskService.deleteAttachment(commentId);

      await loadComments();

      toast.success("Attachment deleted.");
    } catch (error) {
      console.error("Failed to delete attachment:", error);

      toast.error("Failed to delete attachment.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h3 className="font-semibold">Activity & Comments</h3>

        <p className="text-sm text-muted-foreground">
          Discussion and files attached to this task.
        </p>
      </div>

      {/* Comments */}
      <div className="rounded-xl border">
        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : comments.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
            No comments yet.
          </div>
        ) : (
          <div className="divide-y">
            {comments.map((comment) => (
              <div key={comment.id} className="space-y-3 p-4">
                {/* Comment author */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">
                        {getUserName(comment)}
                      </span>

                      {comment.user?.role && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                          {formatRole(comment.user.role)}
                        </span>
                      )}
                    </div>

                    {comment.user?.username && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        @{comment.user.username}
                      </p>
                    )}
                  </div>

                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatDate(comment.created_at)}
                  </span>
                </div>

                {/* Message */}
                {comment.message && (
                  <p className="whitespace-pre-wrap text-sm leading-6">
                    {comment.message}
                  </p>
                )}

                {/* Attachment */}
                {comment.attachment_url && (
                  <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/30 p-3">
                    <a
                      href={comment.attachment_url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex min-w-0 items-center gap-2 text-sm font-medium text-primary hover:underline"
                    >
                      <Paperclip className="h-4 w-4 shrink-0" />

                      <span className="truncate">
                        {comment.attachment_name ?? "Attachment"}
                      </span>
                    </a>

                    <button
                      type="button"
                      onClick={() => handleDeleteAttachment(comment.id)}
                      disabled={deletingId === comment.id}
                      className="ml-3 shrink-0 rounded-lg p-2 text-destructive transition hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label="Delete attachment"
                    >
                      {deletingId === comment.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="rounded-xl border p-4">
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={3}
          placeholder="Write a comment..."
          disabled={sending}
          className="w-full resize-none border-0 bg-transparent text-sm outline-none disabled:cursor-not-allowed disabled:opacity-60"
        />

        {/* Selected file */}
        {selectedFile && (
          <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border bg-muted/30 p-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <FileText className="h-4 w-4 text-primary" />
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {selectedFile.name}
                </p>

                <p className="text-xs text-muted-foreground">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={removeSelectedFile}
              disabled={sending}
              className="shrink-0 rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Remove selected file"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="mt-3 flex items-center justify-between gap-3 border-t pt-3">
          {/* File picker */}
          <label
            className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition hover:bg-muted ${
              sending ? "cursor-not-allowed opacity-50" : ""
            }`}
          >
            <Paperclip className="h-4 w-4" />
            Attach file
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileSelect}
              disabled={sending}
            />
          </label>

          {/* Send */}
          <button
            type="button"
            onClick={handleSend}
            disabled={sending || (!message.trim() && !selectedFile)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

function formatFileSize(bytes: number) {
  if (bytes === 0) {
    return "0 Bytes";
  }

  const units = ["Bytes", "KB", "MB", "GB"];

  const index = Math.floor(Math.log(bytes) / Math.log(1024));

  const size = bytes / Math.pow(1024, index);

  return `${size.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}
