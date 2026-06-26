"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Calendar as BigCalendar,
  dateFnsLocalizer,
  type EventProps,
} from "react-big-calendar";
import { format, parse, startOfWeek, getDay, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/ui/badge";
import { CalendarToolbar } from "@/components/calendario/CalendarToolbar";
import { ItensOsList } from "@/components/os/ItensOsList";
import { PageHeader } from "@/components/layout/PageHeader";
import { listarOrdensServico } from "@/lib/supabase/ordens-servico";
import type { CalendarEvent, OrdemServico, StatusItem } from "@/types";
import { formatDate } from "@/lib/utils";

const locales = { "pt-BR": ptBR };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
});

const messages = {
  today: "Hoje",
  previous: "",
  next: "",
  month: "Mês",
  week: "Semana",
  day: "Dia",
  agenda: "Agenda",
  date: "Data",
  time: "Hora",
  event: "Evento",
  noEventsInRange: "Nenhum evento neste período.",
};

function EventComponent({ event }: EventProps<CalendarEvent>) {
  return (
    <div className="text-[10px] sm:text-xs font-medium leading-tight px-0.5 sm:px-1">
      <div className="truncate">{event.resource.nome_contrato || event.resource.orgao_publico}</div>
      <div className="text-[9px] sm:text-xs opacity-80 truncate hidden sm:block">
        {event.resource.cidade}
      </div>
    </div>
  );
}

function osToCalendarEvent(os: OrdemServico): CalendarEvent {
  const start = new Date(os.data_inicio_evento + "T00:00:00");
  const end = addDays(new Date(os.data_fim_evento + "T00:00:00"), 1);
  return {
    id: os.id,
    title: `${os.nome_contrato || os.orgao_publico} — ${os.cidade}`,
    start,
    end,
    resource: os,
  };
}

export function CalendarioPage() {
  const [ordens, setOrdens] = useState<OrdemServico[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOs, setSelectedOs] = useState<OrdemServico | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listarOrdensServico();
      setOrdens(data);
    } catch (err) {
      toast.error("Erro ao carregar calendário", {
        description: err instanceof Error ? err.message : "Tente novamente.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const events = useMemo(() => ordens.map(osToCalendarEvent), [ordens]);

  function handleItemStatusChange(itemId: string, status: StatusItem) {
    setOrdens((prev) =>
      prev.map((o) =>
        o.id === selectedOs?.id
          ? {
              ...o,
              itens_os: o.itens_os?.map((i) =>
                i.id === itemId ? { ...i, status_item: status } : i
              ),
            }
          : o
      )
    );
    setSelectedOs((prev) =>
      prev
        ? {
            ...prev,
            itens_os: prev.itens_os?.map((i) =>
              i.id === itemId ? { ...i, status_item: status } : i
            ),
          }
        : null
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-xl text-slate-400">Carregando calendário...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-7.5rem)] lg:h-[calc(100dvh-3rem)] -mx-1 sm:-m-2 lg:-m-4">
      <div className="mb-3 sm:mb-4 px-1 sm:px-2 lg:px-4 shrink-0">
        <PageHeader
          title="Calendário de Eventos"
          description="Toque em um evento para ver itens e atualizar status logístico."
        />
      </div>

      <div className="flex-1 min-h-[280px] rounded-xl sm:rounded-2xl border border-[#2a2d3e] bg-[#13151f] p-2 sm:p-3 lg:p-5 shadow-sm shadow-black/20 calendar-wrapper mx-1 sm:mx-2 lg:mx-4 mb-1">
        <BigCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: "100%" }}
          culture="pt-BR"
          messages={messages}
          date={currentDate}
          onNavigate={setCurrentDate}
          views={["month"]}
          defaultView="month"
          toolbar
          popup
          selectable={false}
          onSelectEvent={(event) => setSelectedOs(event.resource)}
          components={{ toolbar: CalendarToolbar, event: EventComponent }}
          eventPropGetter={() => ({
            style: {
              backgroundColor: "#4f46e5",
              borderColor: "#6366f1",
              color: "white",
              borderRadius: "6px",
              border: "none",
              padding: "3px 6px",
              fontSize: "13px",
            },
          })}
        />
      </div>

      <Dialog open={!!selectedOs} onOpenChange={(open) => !open && setSelectedOs(null)}>
        <DialogContent className="max-w-2xl">
          {selectedOs && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl sm:text-2xl">
                  {selectedOs.nome_contrato}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-5">
                <div className="flex flex-wrap items-center gap-3">
                  <StatusBadge status={selectedOs.status} />
                  <span className="text-base text-slate-400">{selectedOs.orgao_publico}</span>
                  <span className="text-base text-slate-400">
                    {selectedOs.cidade}/{selectedOs.estado}
                  </span>
                </div>

                <p className="text-sm font-semibold text-indigo-400 uppercase tracking-wide">
                  {selectedOs.empresa_contratada}
                </p>

                <div className="grid gap-3 text-sm sm:text-base text-slate-300 bg-[#0f1117] rounded-xl p-4 border border-[#2a2d3e]">
                  <p>
                    <span className="font-semibold text-slate-100">Endereço:</span>{" "}
                    {selectedOs.endereco}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-100">Período:</span>{" "}
                    {formatDate(selectedOs.data_inicio_evento)} até{" "}
                    {formatDate(selectedOs.data_fim_evento)}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-100 mb-3 flex items-center gap-2">
                    <span className="inline-block w-1 h-5 bg-indigo-500 rounded-full" />
                    Itens — Status Logístico
                  </h3>
                  <ItensOsList
                    itens={selectedOs.itens_os ?? []}
                    onStatusChange={handleItemStatusChange}
                    compact
                  />
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
