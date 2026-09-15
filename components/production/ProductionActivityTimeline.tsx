import { CheckCircle2, CircleDot, FileText } from "lucide-react";

import type { ProductionActivity } from "./types";

interface ProductionActivityTimelineProps {
  activities: ProductionActivity[];
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

function getActivityIcon(action: string) {
  if (action === "FILE_UPLOADED" || action === "FILE_DELETED") {
    return FileText;
  }

  if (action === "FOLDER_UPDATED") {
    return CheckCircle2;
  }

  return CircleDot;
}

export default function ProductionActivityTimeline({
  activities,
}: ProductionActivityTimelineProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold">Activity History</h3>

        <p className="text-sm text-muted-foreground">
          A record of changes made to this production folder.
        </p>
      </div>

      {activities.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          No activity recorded yet.
        </div>
      ) : (
        <div className="relative ml-2 space-y-6 border-l pl-6">
          {activities.map((activity) => {
            const Icon = getActivityIcon(activity.action);

            return (
              <div key={activity.id} className="relative">
                <div className="absolute -left-[37px] flex h-6 w-6 items-center justify-center rounded-full border bg-background">
                  <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                </div>

                <div className="space-y-1">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm font-medium">
                      {activity.action
                        .replaceAll("_", " ")
                        .toLowerCase()
                        .replace(/\b\w/g, (letter) => letter.toUpperCase())}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {formatDate(activity.created_at)}
                    </p>
                  </div>

                  <p className="text-sm leading-6 text-muted-foreground">
                    {activity.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
