"use client";

import { ChangeEvent, useRef, useState } from "react";

import { Check, File, Loader2, Trash2, Upload } from "lucide-react";

import { toast } from "sonner";

import orderService from "@/app/services/order.service";

import { Button } from "@/components/ui/button";

interface OrderFileUploadProps {
  orderId: string;
  onUploaded?: () => void;
}

export function OrderFileUpload({ orderId, onUploaded }: OrderFileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [files, setFiles] = useState<File[]>([]);

  const [uploading, setUploading] = useState(false);

  const [uploaded, setUploaded] = useState(false);

  const handleFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);

    if (selectedFiles.length === 0) {
      return;
    }

    setFiles((current) => [...current, ...selectedFiles]);

    setUploaded(false);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const removeFile = (fileToRemove: File) => {
    setFiles((current) => current.filter((file) => file !== fileToRemove));
  };

  const uploadFiles = async () => {
    if (files.length === 0) {
      toast.error("Please select at least one file");
      return;
    }

    try {
      setUploading(true);

      for (const file of files) {
        await orderService.uploadOrderFile(orderId, file);
      }

      setFiles([]);
      setUploaded(true);

      toast.success(
        files.length === 1
          ? "File uploaded successfully"
          : "Files uploaded successfully",
      );

      onUploaded?.();
    } catch {
      toast.error("One or more files failed to upload");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload area */}
      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="group w-full rounded-xl border-2 border-dashed p-8 text-center transition hover:border-primary/50 hover:bg-muted/30 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted transition group-hover:bg-background">
          {uploading ? (
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          ) : (
            <Upload className="h-6 w-6 text-muted-foreground" />
          )}
        </div>

        <p className="mt-3 font-medium">
          {uploading ? "Uploading files..." : "Choose reference files"}
        </p>

        <p className="mt-1 text-sm text-muted-foreground">
          Images, PDFs and other design references
        </p>

        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFiles}
          disabled={uploading}
        />
      </button>

      {/* Selected files */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Selected files</p>

            <span className="text-xs text-muted-foreground">
              {files.length} {files.length === 1 ? "file" : "files"}
            </span>
          </div>

          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${file.size}-${index}`}
                className="flex items-center gap-3 rounded-lg border bg-background p-3"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted">
                  <File className="h-4 w-4 text-muted-foreground" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{file.name}</p>

                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={uploading}
                  onClick={() => removeFile(file)}
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <Button type="button" onClick={uploadFiles} disabled={uploading}>
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload {files.length > 1 ? "Files" : "File"}
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Upload complete */}
      {uploaded && files.length === 0 && (
        <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Check className="h-4 w-4" />
          </div>

          <div>
            <p className="text-sm font-medium">Reference files uploaded</p>

            <p className="text-xs text-muted-foreground">
              The files are now attached to this order.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function formatFileSize(bytes: number) {
  if (bytes === 0) {
    return "0 Bytes";
  }

  const units = ["Bytes", "KB", "MB", "GB"];

  const index = Math.floor(Math.log(bytes) / Math.log(1024));

  return `${(bytes / Math.pow(1024, index)).toFixed(index === 0 ? 0 : 1)} ${
    units[index]
  }`;
}
