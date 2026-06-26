"use client";

import * as React from "react";
import { format, isAfter, isBefore, isSameDay, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { DayPicker, type Matcher } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

function capitalizeFirst(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function formatDateLabel(date: Date) {
  const raw = format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  return raw.replace(/ de ([a-zà-ú]+)/i, (_, month) => ` de ${capitalizeFirst(month)}`);
}

interface DatePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  /** Data mínima selecionável */
  minDate?: Date;
  /** Data máxima selecionável */
  maxDate?: Date;
  /** Início do intervalo para destacar visualmente */
  rangeFrom?: Date;
  /** Fim do intervalo para destacar visualmente */
  rangeTo?: Date;
  /** Mês exibido ao abrir o calendário (padrão: value ou minDate) */
  openToMonth?: Date;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Selecione a data",
  disabled,
  minDate,
  maxDate,
  rangeFrom,
  rangeTo,
  openToMonth,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [month, setMonth] = React.useState<Date>(() => value ?? openToMonth ?? minDate ?? new Date());

  React.useEffect(() => {
    if (open) {
      setMonth(value ?? openToMonth ?? minDate ?? new Date());
    }
  }, [open, value, openToMonth, minDate]);

  const disabledDays: Matcher[] = [];
  if (minDate) disabledDays.push({ before: startOfDay(minDate) });
  if (maxDate) disabledDays.push({ after: startOfDay(maxDate) });

  const rangeModifiers = React.useMemo(() => {
    if (!rangeFrom) {
      return { modifiers: undefined, modifiersClassNames: undefined };
    }

    const from = startOfDay(rangeFrom);
    const to = rangeTo ? startOfDay(rangeTo) : undefined;

    return {
      modifiers: {
        range_start: (date: Date) => isSameDay(date, from),
        range_end: (date: Date) => (to ? isSameDay(date, to) : false),
        range_middle: (date: Date) => {
          if (!to) return false;
          const d = startOfDay(date);
          return (
            (isAfter(d, from) || isSameDay(d, from)) &&
            (isBefore(d, to) || isSameDay(d, to)) &&
            !isSameDay(d, from) &&
            !isSameDay(d, to)
          );
        },
      },
      modifiersClassNames: {
        range_start: "rdp-range_start",
        range_end: "rdp-range_end",
        range_middle: "rdp-range_middle",
      },
    };
  }, [rangeFrom, rangeTo]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal h-12 text-base",
            !value && "text-slate-500"
          )}
        >
          <CalendarIcon className="mr-3 h-5 w-5 shrink-0" />
          {value ? formatDateLabel(value) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <DayPicker
          mode="single"
          selected={value}
          month={month}
          onMonthChange={setMonth}
          onSelect={(date) => {
            onChange(date);
            setOpen(false);
          }}
          locale={ptBR}
          disabled={disabledDays.length > 0 ? disabledDays : undefined}
          modifiers={rangeModifiers.modifiers}
          modifiersClassNames={rangeModifiers.modifiersClassNames}
          formatters={{
            formatCaption: (date) => capitalizeFirst(format(date, "LLLL yyyy", { locale: ptBR })),
            formatWeekdayName: (date) => capitalizeFirst(format(date, "EEEEEE", { locale: ptBR })),
          }}
          className="p-4 text-base rdp-custom"
        />
      </PopoverContent>
    </Popover>
  );
}
