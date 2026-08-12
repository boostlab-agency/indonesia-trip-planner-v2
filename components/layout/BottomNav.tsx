"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { ALL_NAV_ITEMS, PRIMARY_MOBILE_HREFS } from "./nav-items";

export function BottomNav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const primaryItems = ALL_NAV_ITEMS.filter((item) => PRIMARY_MOBILE_HREFS.includes(item.href));
  const moreItems = ALL_NAV_ITEMS.filter((item) => !PRIMARY_MOBILE_HREFS.includes(item.href));
  const isMoreActive = moreItems.some((item) => pathname.startsWith(item.href));

  return (
    <>
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 sm:hidden"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      <div
        className={`fixed inset-x-3 bottom-[calc(4.25rem+env(safe-area-inset-bottom))] z-40 rounded-2xl bg-white p-2 shadow-lg transition-all sm:hidden ${
          menuOpen ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
        }`}
      >
        <div className="grid grid-cols-2 gap-1">
          {moreItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-50 flex items-stretch justify-around border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur sm:hidden">
        {primaryItems.map((item) => {
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${
                isActive ? "text-brand-600" : "text-slate-500"
              }`}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${
            menuOpen || isMoreActive ? "text-brand-600" : "text-slate-500"
          }`}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          Meer
        </button>
      </nav>
    </>
  );
}
