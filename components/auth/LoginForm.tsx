/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import { useAuthStore } from "@/app/store/auth-store";
import { getDashboardRoute } from "@/lib/role-redirect";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { login, user, hydrated, isLoading } = useAuthStore();

  const next = searchParams.get("next");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!hydrated || !user) return;

    // If middleware stored the intended destination,
    // return the user there after login.
    if (next?.startsWith("/")) {
      router.replace(next);
      return;
    }

    // Otherwise use role-based dashboard.
    router.replace(getDashboardRoute(user.role));
  }, [hydrated, user, next, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setError("");

    try {
      await login(username, password);
      // Redirect happens automatically when `user` is populated.
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Login failed.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Welcome Back</h1>
        <p className="text-gray-500">Sign in to ChaydonMedia</p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium">Username</label>

        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter username"
          disabled={isLoading}
          className="w-full rounded-lg border p-3 outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Password</label>

        <div className="relative">
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            disabled={isLoading}
            className="w-full rounded-lg border p-3 pr-11 outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isLoading}
            className="absolute right-3 top-3 text-gray-500"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-lg bg-indigo-600 py-3 font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="animate-spin" size={18} />
            Signing In...
          </span>
        ) : (
          "Sign In"
        )}
      </button>
    </form>
  );
}
