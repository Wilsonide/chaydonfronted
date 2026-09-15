"use client";

import { useCallback, useEffect, useState } from "react";

import { Loader2, Plus, RefreshCw, Search } from "lucide-react";

import { toast } from "sonner";

import paymentService from "@/app/services/payment.service";

import { Payment } from "./types";
import { PaymentTable } from "./PaymentTable";
import { PaymentForm } from "./PaymentForm";
import { PaymentDetailsModal } from "./PaymentDetailsModal";
import { PaymentPagination } from "./PaymentPagination";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PaymentManagementProps {
  role: "FRONT_DESK" | "SUPER_ADMIN";
}

const PAGE_SIZE = 10;
const SEARCH_DELAY = 300;

export function PaymentManagement({ role }: PaymentManagementProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const [search, setSearch] = useState("");

  const [createOpen, setCreateOpen] = useState(false);

  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  const [detailsOpen, setDetailsOpen] = useState(false);

  const loadPayments = useCallback(async () => {
    try {
      setLoading(true);

      const response = await paymentService.getPayments(
        page,
        PAGE_SIZE,
        search.trim() || undefined,
      );

      setPayments(response.data.data);

      const meta = response.data.meta;

      setPages(meta.pages ?? Math.max(1, Math.ceil(meta.total / meta.limit)));
    } catch {
      toast.error("Unable to load payments");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadPayments();
    }, SEARCH_DELAY);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [loadPayments]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setPage(1);
  };

  const openDetails = (payment: Payment) => {
    setSelectedPayment(payment);
    setDetailsOpen(true);
  };

  const handlePaymentCreated = async (): Promise<void> => {
    setCreateOpen(false);

    if (page !== 1) {
      setPage(1);
      return;
    }

    await loadPayments();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payments</h1>

          <p className="text-muted-foreground">
            Record and manage customer payments.
          </p>
        </div>

        {role === "FRONT_DESK" && (
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Record Payment
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
              onClick={() => void loadPayments()}
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

      {/* Payment List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <PaymentTable payments={payments} onView={openDetails} />

          <PaymentPagination page={page} pages={pages} onPageChange={setPage} />
        </>
      )}

      {/* Record Payment */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
          </DialogHeader>

          <PaymentForm
            onSuccess={handlePaymentCreated}
            onCancel={() => setCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Payment Details */}
      <PaymentDetailsModal
        payment={selectedPayment}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />
    </div>
  );
}
