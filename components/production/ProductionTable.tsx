import { Eye, FileText, MoreHorizontal, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Skeleton } from "@/components/ui/skeleton";

import type { Order } from "@/components/orders/types";
import type { ProductionFolder } from "./types";

import ProductionStatusBadge from "./ProductionStatusBadge";

interface ProductionTableProps {
  folders: ProductionFolder[];
  orders: Order[];
  loading: boolean;
  onView: (folder: ProductionFolder) => void;
  onEdit: (folder: ProductionFolder) => void;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default function ProductionTable({
  folders,
  orders,
  loading,
  onView,
  onEdit,
}: ProductionTableProps) {
  const orderMap = new Map(orders.map((order) => [order.id, order]));

  return (
    <div className="overflow-hidden rounded-xl border bg-background">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Production Folder</TableHead>
            <TableHead>Order</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Requirements</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-[60px]" />
          </TableRow>
        </TableHeader>

        <TableBody>
          {loading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton className="h-5 w-28" />
                </TableCell>

                <TableCell>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </TableCell>

                <TableCell>
                  <Skeleton className="h-6 w-28" />
                </TableCell>

                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>

                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>

                <TableCell>
                  <Skeleton className="h-8 w-8" />
                </TableCell>
              </TableRow>
            ))
          ) : folders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-32 text-center">
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="rounded-full bg-muted p-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </div>

                  <div>
                    <p className="font-medium">No production folders found</p>

                    <p className="text-sm text-muted-foreground">
                      Try changing your search or filter.
                    </p>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            folders.map((folder) => {
              const order = orderMap.get(folder.order_id);

              return (
                <TableRow key={folder.id}>
                  <TableCell>
                    <div>
                      <p className="font-semibold">{folder.folder_number}</p>

                      <p className="max-w-[220px] truncate text-sm text-muted-foreground">
                        {folder.title}
                      </p>
                    </div>
                  </TableCell>

                  <TableCell>
                    {order ? (
                      <div>
                        <p className="max-w-[240px] truncate font-medium">
                          {order.title}
                        </p>

                        <p className="text-sm text-muted-foreground">
                          {order.customer.name}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="font-medium text-muted-foreground">
                          Order unavailable
                        </p>

                        <p className="text-xs text-muted-foreground">
                          {folder.order_id}
                        </p>
                      </div>
                    )}
                  </TableCell>

                  <TableCell>
                    <ProductionStatusBadge status={folder.status} />
                  </TableCell>

                  <TableCell>
                    <p className="max-w-[240px] truncate text-sm text-muted-foreground">
                      {folder.requirements || "No requirements"}
                    </p>
                  </TableCell>

                  <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                    {formatDate(folder.created_at)}
                  </TableCell>

                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open actions</span>
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onView(folder)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View details
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={() => onEdit(folder)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit folder
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
