"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_SECTIONS, isActiveNavItem } from "@/lib/nav-config";

export function MobileNav() {
  const pathname = usePathname();

  if (pathname === "/login") return null;

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#080910]/95 backdrop-blur-md border-t border-[#1e2130] safe-area-bottom"
      aria-label="Navegação principal"
    >
      <div className="flex items-stretch justify-around px-1 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {NAV_SECTIONS.map((section) => {
          const isActive = section.items.some((item) => isActiveNavItem(pathname, item.href));
          const Icon = section.mobileIcon;
          return (
            <Link
              key={section.id}
              href={section.mobileHref}
              className={cn(
                "flex flex-col items-center justify-center gap-1 min-w-[5.5rem] min-h-[3.75rem] px-2 py-2 rounded-xl transition-colors",
                isActive
                  ? "text-indigo-300 bg-indigo-600/15"
                  : "text-slate-500 active:bg-[#13151f]"
              )}
            >
              <div className="relative">
                <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
                {section.protected && !isActive && (
                  <Lock className="absolute -top-1 -right-2 w-2.5 h-2.5 text-slate-600" />
                )}
              </div>
              <span
                className={cn(
                  "text-[10px] font-semibold leading-tight text-center",
                  isActive && "text-indigo-200"
                )}
              >
                {section.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
