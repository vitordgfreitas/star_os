import { cn } from "@/lib/utils";
import type { StatusOS } from "@/types";

const statusStyles: Record<StatusOS, string> = {
  Pendente: "bg-amber-50 text-amber-800 border-amber-200",
  "Em Andamento": "bg-slate-100 text-slate-700 border-slate-300",
  Concluído: "bg-emerald-50 text-emerald-800 border-emerald-200",
};

interface BadgeProps {
  status: StatusOS;
  className?: string;
}

export function StatusBadge({ status, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-3 py-1 text-sm font-medium",
        statusStyles[status],
        className
      )}
    >
      {status}
    </span>
  );
}
