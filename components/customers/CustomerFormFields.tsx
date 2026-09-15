"use client";

import { CustomerForm } from "./types";

interface CustomerFormFieldsProps {
  form: CustomerForm;
  onChange: (field: keyof CustomerForm, value: string) => void;
  disabled?: boolean;
}

export function CustomerFormFields({
  form,
  onChange,
  disabled = false,
}: CustomerFormFieldsProps) {
  return (
    <div className="space-y-5">
      <div>
        <label
          htmlFor="customer-name"
          className="mb-1.5 block text-sm font-medium text-gray-700"
        >
          Customer Name
        </label>

        <input
          id="customer-name"
          type="text"
          value={form.name}
          onChange={(event) => onChange("name", event.target.value)}
          disabled={disabled}
          placeholder="Enter customer name"
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900 disabled:bg-gray-100"
        />
      </div>

      <div>
        <label
          htmlFor="customer-phone"
          className="mb-1.5 block text-sm font-medium text-gray-700"
        >
          Phone Number
        </label>

        <input
          id="customer-phone"
          type="tel"
          value={form.phone}
          onChange={(event) => onChange("phone", event.target.value)}
          disabled={disabled}
          placeholder="Enter phone number"
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900 disabled:bg-gray-100"
        />
      </div>

      <div>
        <label
          htmlFor="customer-email"
          className="mb-1.5 block text-sm font-medium text-gray-700"
        >
          Email
        </label>

        <input
          id="customer-email"
          type="email"
          value={form.email}
          onChange={(event) => onChange("email", event.target.value)}
          disabled={disabled}
          placeholder="customer@example.com"
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900 disabled:bg-gray-100"
        />
      </div>

      <div>
        <label
          htmlFor="customer-address"
          className="mb-1.5 block text-sm font-medium text-gray-700"
        >
          Address
        </label>

        <textarea
          id="customer-address"
          value={form.address}
          onChange={(event) => onChange("address", event.target.value)}
          disabled={disabled}
          placeholder="Enter customer address"
          rows={3}
          className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900 disabled:bg-gray-100"
        />
      </div>

      <div>
        <label
          htmlFor="customer-notes"
          className="mb-1.5 block text-sm font-medium text-gray-700"
        >
          Notes
        </label>

        <textarea
          id="customer-notes"
          value={form.notes}
          onChange={(event) => onChange("notes", event.target.value)}
          disabled={disabled}
          placeholder="Additional notes..."
          rows={3}
          className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900 disabled:bg-gray-100"
        />
      </div>
    </div>
  );
}
