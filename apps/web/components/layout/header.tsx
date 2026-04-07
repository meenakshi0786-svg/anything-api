"use client";

import { usePathname } from "next/navigation";

const titles: Record<string, string> = {
  "/studio": "Studio",
  "/workflows": "Workflows",
  "/runs": "Run History",
  "/schedules": "Schedules",
  "/marketplace": "Marketplace",
  "/settings": "Settings",
};

export function Header() {
  const pathname = usePathname();
  const title = Object.entries(titles).find(([path]) => pathname?.startsWith(path))?.[1] || "Dashboard";

  return (
    <header className="flex h-14 items-center justify-between border-b border-gray-800 px-6">
      <h2 className="text-lg font-semibold text-white">{title}</h2>

      <div className="flex items-center gap-4">
        {/* API key indicator */}
        <div className="flex items-center gap-2 rounded-lg border border-gray-800 bg-gray-900 px-3 py-1.5 text-xs">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          <span className="text-gray-400">afa_sk_...7x2k</span>
          <button className="text-gray-500 hover:text-white">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
            </svg>
          </button>
        </div>

        {/* User avatar */}
        <button className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-sm font-medium text-white">
          R
        </button>
      </div>
    </header>
  );
}
