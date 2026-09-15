/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Download, Eye, File, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

import productionService from "@/app/services/productionService";

import type { ProductionFile as ProductionFileType } from "./types";

import { Button } from "@/components/ui/button";

interface ProductionFilesProps {
  folderId: string;
  files: ProductionFileType[];
  onChanged: () => void;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function ProductionFiles({
  folderId,
  files,
  onChanged,
}: ProductionFilesProps) {
  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) return;

    try {
      await productionService.uploadProductionFile(folderId, file);

      toast.success("Production file uploaded successfully");

      onChanged();
    } catch (error: any) {
      toast.error(error?.response?.data?.detail ?? "Failed to upload file");
    }
  };

  const handleDelete = async (fileId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this file?",
    );

    if (!confirmed) return;

    try {
      await productionService.deleteProductionFile(fileId);

      toast.success("Production file deleted successfully");

      onChanged();
    } catch (error: any) {
      toast.error(error?.response?.data?.detail ?? "Failed to delete file");
    }
  };

  const handleDownload = async (file: ProductionFileType) => {
    if (!file.file_url) {
      toast.error("File URL is not available");
      return;
    }

    try {
      const response = await fetch(file.file_url);

      if (!response.ok) {
        throw new Error("Failed to fetch file");
      }

      const blob = await response.blob();

      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = blobUrl;
      link.download = file.file_name;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(blobUrl);

      toast.success("File downloaded successfully");
    } catch (error) {
      console.error("File download failed:", error);

      toast.error("Failed to download file. Please try again.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Production Files</h3>

          <p className="text-sm text-muted-foreground">
            Files attached to this production folder.
          </p>
        </div>

        <label className="inline-flex h-9 cursor-pointer items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground">
          <Upload className="mr-2 h-4 w-4" />
          Upload File
          <input type="file" className="hidden" onChange={handleUpload} />
        </label>
      </div>

      {files.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <File className="mx-auto h-8 w-8 text-muted-foreground" />

          <p className="mt-3 text-sm font-medium">No files uploaded</p>

          <p className="mt-1 text-xs text-muted-foreground">
            Upload artwork or other production files.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="rounded-md bg-muted p-2">
                  <File className="h-4 w-4 text-muted-foreground" />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {file.file_name}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    Uploaded {formatDate(file.created_at)}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`View ${file.file_name}`}
                  onClick={() =>
                    window.open(file.file_url, "_blank", "noopener,noreferrer")
                  }
                >
                  <Eye className="h-4 w-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Download ${file.file_name}`}
                  onClick={() => handleDownload(file)}
                >
                  <Download className="h-4 w-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive"
                  aria-label={`Delete ${file.file_name}`}
                  onClick={() => handleDelete(file.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
