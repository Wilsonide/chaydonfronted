"use client";

import { ReactNode } from "react";
import AppSidebar from "./app-sidebar";
import AppHeader from "./app-header";

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AppSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <AppHeader />

        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
