"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ToolbarProps } from "react-big-calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CalendarEvent } from "@/types";

const MESES = Array.from({ length: 12 }, (_, i) => ({
  value: String(i),
  label: format(new Date(2024, i, 1), "MMMM", { locale: ptBR }),
}));

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function CalendarToolbar({ date, onNavigate }: ToolbarProps<CalendarEvent>) {
  const currentYear = date.getFullYear();
  const currentMonth = date.getMonth();

  const years = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i);

  function goToMonthYear(month: number, year: number) {
    onNavigate("DATE", new Date(year, month, 1));
  }

  return (
    <div className="no-print flex items-center justify-between gap-2 sm:gap-4 mb-3 sm:mb-4 px-0.5 sm:px-1">
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={() => onNavigate("PREV")}
        aria-label="Mês anterior"
        className="h-10 w-10 sm:h-11 sm:w-11 shrink-0"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>

      <div className="flex flex-1 items-center justify-center gap-2 sm:gap-3 min-w-0">
        <Select
          value={String(currentMonth)}
          onValueChange={(v) => goToMonthYear(parseInt(v), currentYear)}
        >
          <SelectTrigger className="w-[7.5rem] sm:w-44 h-10 sm:h-11 text-sm sm:text-base capitalize">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MESES.map((m) => (
              <SelectItem key={m.value} value={m.value} className="capitalize">
                {capitalize(m.label)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={String(currentYear)}
          onValueChange={(v) => goToMonthYear(currentMonth, parseInt(v))}
        >
          <SelectTrigger className="w-20 sm:w-28 h-10 sm:h-11 text-sm sm:text-base">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={() => onNavigate("NEXT")}
        aria-label="Próximo mês"
        className="h-10 w-10 sm:h-11 sm:w-11 shrink-0"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  );
}
