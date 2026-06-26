"use client";

import { usePathname } from "next/navigation";
import { Toaster } from "sonner";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { MobileNav } from "@/components/layout/MobileNav";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isCalendar = pathname === "/calendario";
  const isLogin = pathname === "/login";

  return (
    <div className="flex min-h-dvh flex-col lg:flex-row bg-[#0a0b10] print:bg-white">
      <div className="no-print fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-indigo-950/30 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-slate-900/50 blur-3xl" />
      </div>

      {/* Sidebar — só desktop */}
      <div className="no-print hidden lg:flex lg:flex-shrink-0">
        <Sidebar />
      </div>

      <div className="flex flex-1 flex-col min-h-0 min-w-0">
        <MobileHeader />

        <main
          className={cn(
            "flex-1 overflow-auto min-h-0 print:overflow-visible",
            isLogin ? "p-4 sm:p-6 lg:p-10" : isCalendar ? "p-3 sm:p-4 lg:p-6" : "p-4 sm:p-6 lg:p-10",
            !isLogin && "pb-24 lg:pb-0 print:pb-0"
          )}
        >
          <div className={cn("mx-auto w-full", isCalendar || isLogin ? "max-w-none" : "max-w-6xl")}>
            {children}
          </div>
        </main>
      </div>

      <MobileNav />

      <Toaster
        position="top-center"
        closeButton
        theme="dark"
        toastOptions={{
          classNames: {
            toast: "text-base border border-[#2a2d3e] shadow-lg bg-[#1a1d2e] text-slate-100 max-w-[calc(100vw-2rem)]",
            title: "text-base font-semibold text-slate-100",
            description: "text-sm text-slate-400",
          },
        }}
      />
    </div>
  );
}
