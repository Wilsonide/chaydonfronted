"use client";

import { Loader2 } from "lucide-react";

import { CustomerModal } from "./CustomerModal";

import { CustomerForm } from "./types";

import { CustomerFormFields } from "./CustomerFormFields";

interface CustomerFormModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  form: CustomerForm;
  onChange: (field: keyof CustomerForm, value: string) => void;
  onSubmit: () => void;
  saving?: boolean;
  submitLabel?: string;
}

export function CustomerFormModal({
  open,
  onClose,
  title,
  description,
  form,
  onChange,
  onSubmit,
  saving = false,
  submitLabel = "Save Customer",
}: CustomerFormModalProps) {
  return (
    <CustomerModal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
        className="space-y-6 p-6"
      >
        <CustomerFormFields form={form} onChange={onChange} disabled={saving} />

        <div className="flex justify-end gap-3 border-t pt-5">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving || !form.name.trim() || !form.phone.trim()}
            className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}

            {saving ? "Saving..." : submitLabel}
          </button>
        </div>
      </form>
    </CustomerModal>
  );
}
