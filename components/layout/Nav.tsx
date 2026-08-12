"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ALL_NAV_ITEMS } from "./nav-items";

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="hidden flex-wrap gap-1 sm:flex">
      {ALL_NAV_ITEMS.map((item) => {
        const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              isActive
                ? "bg-brand-600 text-white"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
