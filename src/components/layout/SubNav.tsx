"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { getSectionForPath, isActiveNavItem } from "@/lib/nav-config";

export function SubNav() {
  const pathname = usePathname();
  const section = getSectionForPath(pathname);

  if (!section || section.items.length < 2) return null;

  return (
    <nav
      className="no-print flex flex-wrap gap-2"
      aria-label={`Sub-navegação: ${section.label}`}
    >
      {section.items.map((item) => {
        const active = isActiveNavItem(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "inline-flex items-center justify-center min-h-12 px-5 rounded-xl text-base font-semibold transition-colors border",
              active
                ? "bg-indigo-600 text-white border-indigo-500 shadow-sm"
                : "bg-[#13151f] text-slate-300 border-[#2a2d3e] hover:border-indigo-500/40 hover:text-white"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
