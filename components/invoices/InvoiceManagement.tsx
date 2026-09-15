"use client";

import { useCallback, useEffect, useState } from "react";

import { FilePlus, Loader2, RefreshCw, Search } from "lucide-react";

import { toast } from "sonner";

import invoiceService from "@/app/services/invoice.service";
import paymentService from "@/app/services/payment.service";

import { Invoice } from "./types";
import { InvoiceTable } from "./InvoiceTable";
import { InvoiceForm } from "./InvoiceForm";
import { InvoiceDetailsModal } from "./InvoiceDetailsModal";
import { InvoicePagination } from "./InvoicePagination";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface InvoiceManagementProps {
  role: "FRONT_DESK" | "SUPER_ADMIN";
}

const PAGE_SIZE = 10;
const SEARCH_DELAY = 300;

export function InvoiceManagement({ role }: InvoiceManagementProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const [search, setSearch] = useState("");

  const [createOpen, setCreateOpen] = useState(false);

  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const [detailsOpen, setDetailsOpen] = useState(false);

  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const loadInvoices = useCallback(async () => {
    try {
      setLoading(true);

      const response = await invoiceService.getInvoices(
        page,
        PAGE_SIZE,
        search.trim() || undefined,
      );

      setInvoices(response.data.data);

      const meta = response.data.meta;

      setPages(meta.pages ?? Math.max(1, Math.ceil(meta.total / meta.limit)));
    } catch {
      toast.error("Unable to load invoices");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadInvoices();
    }, SEARCH_DELAY);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [loadInvoices]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setPage(1);
  };

  const openDetails = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setDetailsOpen(true);
  };

  const handleInvoiceCreated = async () => {
    setCreateOpen(false);

    if (page !== 1) {
      setPage(1);
      return;
    }

    await loadInvoices();
  };

  const handleDownload = async (invoice: Invoice) => {
    try {
      setDownloadingId(invoice.id);

      const response = await paymentService.downloadInvoice(invoice.id);

      const blob = new Blob([response.data], {
        type: "application/pdf",
      });

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;
      link.download = `invoice-${invoice.id}.pdf`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch {
      toast.error("Unable to download invoice");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Invoices</h1>

          <p className="text-muted-foreground">
            Create, view, and download customer invoices.
          </p>
        </div>

        {role === "FRONT_DESK" && (
          <Button onClick={() => setCreateOpen(true)}>
            <FilePlus className="mr-2 h-4 w-4" />
            Create Invoice
          </Button>
        )}
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                value={search}
                onChange={handleSearch}
                placeholder="Search by customer name or order title..."
                className="pl-9"
              />
            </div>

            <Button
              variant="outline"
              onClick={() => void loadInvoices()}
              disabled={loading}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Invoice List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <InvoiceTable
            invoices={invoices}
            onView={openDetails}
            onDownload={handleDownload}
          />

          <InvoicePagination page={page} pages={pages} onPageChange={setPage} />
        </>
      )}

      {/* Create Invoice */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Invoice</DialogTitle>
          </DialogHeader>

          <InvoiceForm
            onSuccess={handleInvoiceCreated}
            onCancel={() => setCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Invoice Details */}
      <InvoiceDetailsModal
        invoice={selectedInvoice}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />
    </div>
  );
}
