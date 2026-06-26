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
    <div className="flex items-center justify-between gap-4 mb-4 px-1">
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={() => onNavigate("PREV")}
        aria-label="Mês anterior"
        className="h-11 w-11 shrink-0"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>

      <div className="flex flex-1 items-center justify-center gap-3 flex-wrap">
        <Select
          value={String(currentMonth)}
          onValueChange={(v) => goToMonthYear(parseInt(v), currentYear)}
        >
          <SelectTrigger className="w-44 h-11 text-base capitalize">
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
          <SelectTrigger className="w-28 h-11 text-base">
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
        className="h-11 w-11 shrink-0"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  );
}
