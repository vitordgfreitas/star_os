"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Calendar, ClipboardList, Lock, LogOut, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const menuItems = [
  {
    href: "/calendario",
    label: "Calendário",
    description: "Inventário — aberto",
    icon: Calendar,
    protected: false,
  },
  {
    href: "/cadastrar",
    label: "Cadastrar OS",
    description: "Nova ordem de serviço",
    icon: PlusCircle,
    protected: true,
  },
  {
    href: "/ordens",
    label: "Ordens de Serviço",
    description: "Ver e editar",
    icon: ClipboardList,
    protected: true,
  },
];

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
    <aside className="w-64 bg-[#080910] text-white flex-shrink-0 flex flex-col border-r border-[#1e2130] h-dvh sticky top-0">
      <div className="px-6 py-7 border-b border-[#1e2130]">
        <h1 className="text-xl font-bold tracking-tight text-white">Star OS</h1>
        <p className="text-slate-500 text-[11px] mt-1.5 font-medium uppercase tracking-[0.15em]">
          Gestão de Contratos
        </p>
      </div>

      <nav className="p-3 space-y-1 flex-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-4 py-3.5 transition-all duration-200",
                isActive
                  ? "bg-indigo-600/20 text-indigo-200 border border-indigo-500/30 shadow-sm shadow-indigo-950/30"
                  : "text-slate-400 hover:bg-[#13151f] hover:text-slate-200 border border-transparent"
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-center w-9 h-9 rounded-lg transition-colors",
                  isActive ? "bg-indigo-600/30" : "bg-[#13151f] group-hover:bg-[#1a1d2e]"
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-semibold truncate">{item.label}</p>
                  {item.protected && (
                    <Lock className={cn("w-3 h-3 shrink-0", isActive ? "text-indigo-400" : "text-slate-600")} />
                  )}
                </div>
                <p className="text-xs truncate text-slate-500">{item.description}</p>
              </div>
            </Link>
          );
        })}
      </nav>

      {!isLoginPage && pathname !== "/calendario" && (
        <div className="p-3 border-t border-[#1e2130]">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-start text-slate-500 hover:text-slate-200 hover:bg-[#13151f] gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sair da área restrita
          </Button>
        </div>
      )}
    </aside>
  );
}
