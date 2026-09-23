"use client";

import MobileSidebar from "./mobile-sidebar";
import { useAuthStore } from "@/app/store/auth-store";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AppHeader() {
  const router = useRouter();

  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  async function handleLogout() {
    try {
      await logout();
    } finally {
      router.replace("/login");
    }
  }

  const roleLabel = user?.role
    ?.replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());

  return (
    <header className="h-16 border-b bg-white px-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <MobileSidebar />

        <div>
          <h2 className="font-semibold">ChaydonMedia</h2>

          {user && <p className="text-xs text-gray-500">{roleLabel}</p>}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:block text-right">
          <p className="font-medium">
            {user?.first_name} {user?.last_name}
          </p>

          <p className="text-xs text-gray-500">{user?.username}</p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="p-2 rounded-lg hover:bg-gray-100"
          title="Logout"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
