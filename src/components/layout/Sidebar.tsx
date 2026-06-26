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
    <aside className="w-full lg:w-64 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white flex-shrink-0 flex flex-col border-r border-slate-800/50">
      <div className="px-6 py-7 border-b border-slate-800/60">
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
                  ? "bg-white text-slate-900 shadow-md shadow-black/10"
                  : "text-slate-300 hover:bg-white/8 hover:text-white"
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-center w-9 h-9 rounded-lg transition-colors",
                  isActive ? "bg-slate-100" : "bg-white/5 group-hover:bg-white/10"
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-semibold truncate">{item.label}</p>
                  {item.protected && (
                    <Lock className={cn("w-3 h-3 shrink-0", isActive ? "text-slate-400" : "text-slate-500")} />
                  )}
                </div>
                <p className={cn("text-xs truncate", isActive ? "text-slate-500" : "text-slate-500")}>
                  {item.description}
                </p>
              </div>
            </Link>
          );
        })}
      </nav>

      {!isLoginPage && pathname !== "/calendario" && (
        <div className="p-3 border-t border-slate-800/60">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-start text-slate-400 hover:text-white hover:bg-white/8 gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sair da área restrita
          </Button>
        </div>
      )}
    </aside>
  );
}
