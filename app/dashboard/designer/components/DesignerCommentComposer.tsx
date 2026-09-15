"use client";

import { useRef, useState } from "react";

import { Loader2, Paperclip, Send, X } from "lucide-react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import taskService from "@/app/services/taskService";

import type { TaskComment } from "@/components/tasks/types";

interface DesignerCommentComposerProps {
  taskId: string;
  onCommentAdded: (comment: TaskComment) => void;
  disabled?: boolean;
}

export default function DesignerCommentComposer({
  taskId,
  onCommentAdded,
  disabled = false,
}: DesignerCommentComposerProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] ?? null;

    setFile(selectedFile);
  };

  const handleRemoveFile = () => {
    setFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage && !file) {
      toast.error("Add a message or attach a file before sending.");
      return;
    }

    setSending(true);

    try {
      const response = await taskService.addCommentWithAttachment(
        taskId,
        trimmedMessage || null,
        file,
      );

      onCommentAdded(response.data);

      setMessage("");
      setFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      toast.success(file ? "Comment and attachment sent." : "Comment sent.");
    } catch (error) {
      console.error("Failed to send comment:", error);

      toast.error("Failed to send comment or attachment.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-3">
      <Textarea
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        placeholder="Send a message to your Graphic Lead..."
        rows={4}
        disabled={sending || disabled}
      />

      {file && (
        <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/30 px-3 py-2">
          <div className="flex min-w-0 items-center gap-2">
            <Paperclip className="h-4 w-4 shrink-0 text-muted-foreground" />

            <span className="truncate text-sm font-medium">{file.name}</span>

            <span className="shrink-0 text-xs text-muted-foreground">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </span>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleRemoveFile}
            disabled={sending}
            aria-label="Remove attachment"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
            disabled={sending || disabled}
          />

          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={sending || disabled}
          >
            <Paperclip className="mr-2 h-4 w-4" />
            Attach file
          </Button>
        </div>

        <Button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={sending || disabled || (!message.trim() && !file)}
        >
          {sending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Send className="mr-2 h-4 w-4" />
          )}
          Send
        </Button>
      </div>
    </div>
  );
}
