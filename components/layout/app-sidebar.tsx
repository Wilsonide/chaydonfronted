"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { roleNavigation } from "./role-nav";
import { useAuthStore } from "@/app/store/auth-store";

interface AppSidebarProps {
  mobile?: boolean;
  onNavigate?: () => void;
}

export default function AppSidebar({
  mobile = false,
  onNavigate,
}: AppSidebarProps) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);

  if (!user) return null;

  const navigation = roleNavigation[user.role];

  return (
    <aside
      className={clsx(
        "w-64 border-r bg-white flex flex-col",
        mobile ? "h-full" : "hidden md:flex min-h-screen",
      )}
    >
      <div className="h-16 flex items-center px-6 border-b shrink-0">
        <h1 className="font-bold text-xl text-blue-600">ChayDon</h1>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const Icon = item.icon;

          /*
           * Dashboard routes must match exactly.
           *
           * Example:
           * /dashboard/super-admin
           *
           * should NOT be active when we're on:
           * /dashboard/super-admin/tasks
           */
          const isDashboard = item.label === "Dashboard";

          const isActive = isDashboard
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={clsx(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition",
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100",
              )}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
