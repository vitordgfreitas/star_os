"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Lock, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { NAV_SECTIONS, isActiveNavItem, isProtectedPath } from "@/lib/nav-config";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/login";

  async function handleLogout() {
    await fetch("/api/auth/os", { method: "DELETE" });
    router.push("/calendario");
    router.refresh();
  }

  return (
    <aside className="w-72 bg-[#080910] text-white flex-shrink-0 flex flex-col border-r border-[#1e2130] h-dvh sticky top-0">
      <div className="px-6 py-7 border-b border-[#1e2130]">
        <h1 className="text-xl font-bold tracking-tight text-white">Gerenciador</h1>
        <p className="text-slate-500 text-[11px] mt-1.5 font-medium uppercase tracking-[0.15em]">
          Gestão de Contratos
        </p>
      </div>

      <nav className="p-3 space-y-6 flex-1 overflow-y-auto">
        {NAV_SECTIONS.map((section) => (
          <div key={section.id}>
            <div className="flex items-center gap-2 px-3 mb-2">
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                {section.label}
              </p>
              {section.protected && <Lock className="w-3 h-3 text-slate-600" />}
            </div>
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = isActiveNavItem(pathname, item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group flex items-center gap-3 rounded-xl px-4 py-3.5 transition-all duration-200",
                      isActive
                        ? "bg-indigo-600/20 text-indigo-200 border border-indigo-500/30"
                        : "text-slate-400 hover:bg-[#13151f] hover:text-slate-200 border border-transparent"
                    )}
                  >
                    <div
                      className={cn(
                        "flex items-center justify-center w-9 h-9 rounded-lg",
                        isActive ? "bg-indigo-600/30" : "bg-[#13151f] group-hover:bg-[#1a1d2e]"
                      )}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{item.label}</p>
                      {item.description && (
                        <p className="text-xs truncate text-slate-500">{item.description}</p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {!isLoginPage && isProtectedPath(pathname) && (
        <div className="p-3 border-t border-[#1e2130]">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-start text-slate-500 hover:text-slate-200 hover:bg-[#13151f] gap-2 min-h-11"
          >
            <LogOut className="w-4 h-4" />
            Sair da área restrita
          </Button>
        </div>
      )}
    </aside>
  );
}
