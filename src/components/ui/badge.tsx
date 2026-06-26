import { cn } from "@/lib/utils";
import type { StatusOS } from "@/types";

const statusStyles: Record<StatusOS, string> = {
  Pendente: "bg-amber-950/60 text-amber-300 border-amber-800/60",
  "Em Andamento": "bg-indigo-950/60 text-indigo-300 border-indigo-800/60",
  Concluído: "bg-emerald-950/60 text-emerald-300 border-emerald-800/60",
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
        "print:bg-white print:text-black print:border-gray-400",
        statusStyles[status],
        className
      )}
    >
      {status}
    </span>
  );
}
