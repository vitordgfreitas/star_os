"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STATUS_ITEM_OPTIONS, type StatusItem } from "@/types";
import { cn } from "@/lib/utils";

const statusColors: Record<StatusItem, string> = {
  Pendente: "border-amber-800/50 text-amber-300",
  Separado: "border-blue-800/50 text-blue-300",
  Entregue: "border-indigo-800/50 text-indigo-300",
  Concluído: "border-emerald-800/50 text-emerald-300",
  Recolhido: "border-slate-600 text-slate-300",
};

interface ItemStatusSelectProps {
  value: StatusItem;
  onChange: (status: StatusItem) => void;
  disabled?: boolean;
  className?: string;
}

export function ItemStatusSelect({
  value,
  onChange,
  disabled,
  className,
}: ItemStatusSelectProps) {
  return (
    <Select
      value={value}
      onValueChange={(v) => onChange(v as StatusItem)}
      disabled={disabled}
    >
      <SelectTrigger
        className={cn(
          "h-10 w-full sm:w-[11.5rem] shrink-0 px-3 text-sm font-medium bg-[#0f1117] gap-2",
          statusColors[value],
          className
        )}
      >
        <SelectValue className="truncate" />
      </SelectTrigger>
      <SelectContent align="end" sideOffset={4} className="min-w-[11.5rem]">
        {STATUS_ITEM_OPTIONS.map((s) => (
          <SelectItem key={s} value={s} className="text-sm py-2 pl-8 pr-3">
            {s}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
