"use client";

import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white p-12">
        <div className="max-w-md space-y-6">
          <Image
            src="/logo-white.png"
            alt="PrintFlow"
            width={160}
            height={160}
          />

          <h1 className="text-4xl font-bold">PrintFlow</h1>

          <p className="text-lg text-white/90">
            Manage orders, production, inventory, invoices and payments from one
            place.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
