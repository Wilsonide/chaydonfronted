"use client";

import { Menu, X } from "lucide-react";
import { useState } from "react";
import AppSidebar from "./app-sidebar";

export default function MobileSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="md:hidden p-2 rounded-lg hover:bg-gray-100"
        aria-label="Open navigation"
      >
        <Menu size={22} />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setOpen(false)}
          />

          <div className="fixed left-0 top-0 bottom-0 w-64 z-50 bg-white shadow-xl">
            <div className="absolute right-3 top-3 z-10">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100"
                aria-label="Close navigation"
              >
                <X size={20} />
              </button>
            </div>

            <AppSidebar mobile onNavigate={() => setOpen(false)} />
          </div>
        </>
      )}
    </>
  );
}
