/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

import AuthService from "@/app/services/auth.service";
import { useAuthStore } from "@/app/store/auth-store";
import { UserRole } from "@/app/types/auth";
import { isSuperAdmin } from "@/lib/role-utils";

export default function RegisterPage() {
  const router = useRouter();

  const { hydrated, isLoading, user } = useAuthStore();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    password: "",
    role: UserRole.FRONT_DESK,
  });

  useEffect(() => {
    if (!hydrated || isLoading) return;

    if (!user) {
      router.replace("/login?next=/register");
      return;
    }

    if (!isSuperAdmin(user.role)) {
      router.replace("/dashboard");
    }
  }, [hydrated, isLoading, user, router]);

  if (!hydrated || isLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (!isSuperAdmin(user.role)) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    setSubmitting(true);
    setError("");

    try {
      await AuthService.register(form);
      router.push("/dashboard");
    } catch (err: any) {
      setError(
        err?.response?.data?.detail || "Failed to create staff account.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl p-6">
      <form
        onSubmit={submit}
        className="space-y-5 rounded-2xl border bg-white p-6 shadow-sm"
      >
        <div>
          <h1 className="text-2xl font-bold">Create Staff Account</h1>
          <p className="mt-1 text-sm text-gray-500">
            Only Super Admins can create PrintFlow staff accounts.
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <input
          placeholder="First name"
          className="w-full rounded-lg border p-3"
          value={form.first_name}
          onChange={(e) => setForm({ ...form, first_name: e.target.value })}
        />

        <input
          placeholder="Last name"
          className="w-full rounded-lg border p-3"
          value={form.last_name}
          onChange={(e) => setForm({ ...form, last_name: e.target.value })}
        />

        <input
          placeholder="Username"
          className="w-full rounded-lg border p-3"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
        />

        <input
          placeholder="Email"
          type="email"
          className="w-full rounded-lg border p-3"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          placeholder="Password"
          type="password"
          className="w-full rounded-lg border p-3"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <select
          className="w-full rounded-lg border p-3"
          value={form.role}
          onChange={(e) =>
            setForm({
              ...form,
              role: e.target.value as UserRole,
            })
          }
        >
          <option value={UserRole.FRONT_DESK}>Front Desk</option>
          <option value={UserRole.GRAPHIC_LEAD}>Graphic Lead</option>
          <option value={UserRole.GRAPHIC_DESIGNER}>Graphic Designer</option>
        </select>

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-3 font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {submitting ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              Creating...
            </>
          ) : (
            "Create Staff"
          )}
        </button>
      </form>
    </div>
  );
}
