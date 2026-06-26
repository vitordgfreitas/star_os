import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date + "T12:00:00") : date;
  return new Intl.DateTimeFormat("pt-BR").format(d);
}

export function toDateInputValue(date: string | Date): string {
  if (typeof date === "string") {
    return date.split("T")[0];
  }
  return date.toISOString().split("T")[0];
}
