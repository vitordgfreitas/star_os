"use client";

import { usePathname } from "next/navigation";
import { Toaster } from "sonner";
import { Sidebar } from "@/components/layout/Sidebar";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isCalendar = pathname === "/calendario";
  const isLogin = pathname === "/login";

  return (
    <div className="flex min-h-screen flex-col lg:flex-row bg-[#f4f6f9]">
      {/* Fundo decorativo sutil */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-slate-200/40 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-slate-300/30 blur-3xl" />
      </div>

      <Sidebar />
      <main
        className={cn(
          "flex-1 overflow-auto",
          isCalendar ? "p-4 lg:p-6" : isLogin ? "p-6 lg:p-10" : "p-6 lg:p-10"
        )}
      >
        <div className={cn("mx-auto", isCalendar || isLogin ? "max-w-none" : "max-w-6xl")}>
          {children}
        </div>
      </main>
      <Toaster
        position="top-center"
        closeButton
        toastOptions={{
          classNames: {
            toast: "text-base border border-slate-200/80 shadow-lg bg-white/95 backdrop-blur-sm",
            title: "text-base font-semibold text-slate-900",
            description: "text-sm text-slate-600",
          },
        }}
      />
    </div>
  );
}
