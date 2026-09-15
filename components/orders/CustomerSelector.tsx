"use client";

import { useEffect, useState } from "react";

import {
  Check,
  ChevronDown,
  Loader2,
  Plus,
  Search,
  UserPlus,
} from "lucide-react";

import { toast } from "sonner";

import { Customer, CustomerForm } from "@/components/customers/types";

import customerService from "@/app/services/customer.service";

import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";

interface CustomerSelectorProps {
  value: Customer | null;
  onChange: (customer: Customer | null) => void;
}

export function CustomerSelector({ value, onChange }: CustomerSelectorProps) {
  const [open, setOpen] = useState(false);

  const [search, setSearch] = useState("");

  const [customers, setCustomers] = useState<Customer[]>([]);

  const [loading, setLoading] = useState(false);

  const [showCreate, setShowCreate] = useState(false);

  const [creating, setCreating] = useState(false);

  const [form, setForm] = useState<CustomerForm>({
    name: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
  });

  const loadCustomers = async () => {
    try {
      setLoading(true);

      const response = await customerService.getCustomers(
        1,
        10,
        search || undefined,
      );

      setCustomers(response.data.data);
    } catch {
      toast.error("Unable to load customers");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const timer = setTimeout(() => {
      Promise.resolve().then(() => loadCustomers());
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const selectCustomer = (customer: Customer) => {
    onChange(customer);
    setOpen(false);
    setSearch("");
  };

  const createCustomer = async () => {
    if (!form.name.trim()) {
      toast.error("Customer name is required");
      return;
    }

    if (!form.phone.trim()) {
      toast.error("Customer phone is required");
      return;
    }

    try {
      setCreating(true);

      const response = await customerService.createCustomer(form);

      const customer = response.data;

      onChange(customer);

      setForm({
        name: "",
        phone: "",
        email: "",
        address: "",
        notes: "",
      });

      setShowCreate(false);
      setOpen(false);

      toast.success("Customer created successfully");
    } catch {
      toast.error("Unable to create customer");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-3">
      <Label>Customer</Label>

      {value ? (
        <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-4">
          <div>
            <p className="font-medium">{value.name}</p>

            <p className="text-sm text-muted-foreground">
              {value.phone}
              {value.email ? ` • ${value.email}` : ""}
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onChange(null)}
          >
            Change
          </Button>
        </div>
      ) : (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger>
            <Button
              type="button"
              variant="outline"
              className="w-full justify-between"
            >
              <span className="text-muted-foreground">Select customer</span>

              <ChevronDown className="h-4 w-4" />
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Select Customer</DialogTitle>
            </DialogHeader>

            {!showCreate ? (
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                  <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search by name or phone..."
                    className="pl-9"
                  />
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() => setShowCreate(true)}
                >
                  <UserPlus className="h-4 w-4" />
                  Create new customer
                </Button>

                <div className="max-h-72 space-y-1 overflow-y-auto">
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                  ) : customers.length === 0 ? (
                    <div className="py-8 text-center">
                      <p className="text-sm text-muted-foreground">
                        No customers found.
                      </p>

                      <Button
                        type="button"
                        variant="link"
                        onClick={() => setShowCreate(true)}
                      >
                        Create this customer
                      </Button>
                    </div>
                  ) : (
                    customers.map((customer) => (
                      <button
                        key={customer.id}
                        type="button"
                        onClick={() => selectCustomer(customer)}
                        className="flex w-full items-center justify-between rounded-lg p-3 text-left hover:bg-muted"
                      >
                        <div>
                          <p className="font-medium">{customer.name}</p>

                          <p className="text-sm text-muted-foreground">
                            {customer.phone}
                          </p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="customer-name">Name</Label>

                  <Input
                    id="customer-name"
                    value={form.name}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        name: event.target.value,
                      })
                    }
                    placeholder="Customer name"
                  />
                </div>

                <div>
                  <Label htmlFor="customer-phone">Phone</Label>

                  <Input
                    id="customer-phone"
                    value={form.phone}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        phone: event.target.value,
                      })
                    }
                    placeholder="080..."
                  />
                </div>

                <div>
                  <Label htmlFor="customer-email">Email</Label>

                  <Input
                    id="customer-email"
                    type="email"
                    value={form.email ?? ""}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        email: event.target.value,
                      })
                    }
                    placeholder="customer@example.com"
                  />
                </div>

                <div>
                  <Label htmlFor="customer-address">Address</Label>

                  <Input
                    id="customer-address"
                    value={form.address ?? ""}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        address: event.target.value,
                      })
                    }
                    placeholder="Customer address"
                  />
                </div>

                <div>
                  <Label htmlFor="customer-notes">Notes</Label>

                  <Input
                    id="customer-notes"
                    value={form.notes ?? ""}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        notes: event.target.value,
                      })
                    }
                    placeholder="Optional notes"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreate(false)}
                  >
                    Back
                  </Button>

                  <Button
                    type="button"
                    onClick={createCustomer}
                    disabled={creating}
                  >
                    {creating && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    <Plus className="mr-2 h-4 w-4" />
                    Create Customer
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
