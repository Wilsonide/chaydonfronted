import { CheckCircle2, FolderKanban, Palette, Printer } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

import type { ProductionFolder } from "./types";

interface ProductionSummaryProps {
  folders: ProductionFolder[];
  total: number;
}

export default function ProductionSummary({
  folders,
  total,
}: ProductionSummaryProps) {
  const active = folders.filter(
    (folder) => !["COMPLETED", "CANCELLED"].includes(folder.status),
  ).length;

  const inDesign = folders.filter(
    (folder) =>
      folder.status === "IN_DESIGN" || folder.status === "DESIGN_REVIEW",
  ).length;

  const printing = folders.filter(
    (folder) => folder.status === "PRINTING",
  ).length;

  const completed = folders.filter(
    (folder) => folder.status === "COMPLETED",
  ).length;

  const cards = [
    {
      title: "Total Folders",
      value: total,
      description: "Production folders",
      icon: FolderKanban,
    },
    {
      title: "Active",
      value: active,
      description: "On current page",
      icon: FolderKanban,
    },
    {
      title: "In Design",
      value: inDesign,
      description: "Design activity",
      icon: Palette,
    },
    {
      title: "Printing",
      value: printing,
      description: "Currently printing",
      icon: Printer,
    },
    {
      title: "Completed",
      value: completed,
      description: "Completed on page",
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <Card key={card.title}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {card.title}
                  </p>

                  <p className="mt-2 text-2xl font-semibold tracking-tight">
                    {card.value}
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {card.description}
                  </p>
                </div>

                <div className="rounded-lg bg-muted p-2.5">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
