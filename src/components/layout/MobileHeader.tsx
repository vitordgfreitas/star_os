"use client";

import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

const PROTECTED = ["/cadastrar", "/ordens"];

export function MobileHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const showLogout = PROTECTED.includes(pathname);

  async function handleLogout() {
    await fetch("/api/auth/os", { method: "DELETE" });
    router.push("/calendario");
    router.refresh();
  }

  if (pathname === "/login") return null;

  return (
    <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-[#080910]/95 backdrop-blur-md border-b border-[#1e2130]">
      <div>
        <h1 className="text-lg font-bold text-white leading-tight">Star OS</h1>
        <p className="text-[10px] text-slate-500 uppercase tracking-widest">Gestão de Contratos</p>
      </div>
      {showLogout && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="text-slate-400 hover:text-white gap-1.5 px-3"
          aria-label="Sair"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-xs">Sair</span>
        </Button>
      )}
    </header>
  );
}
