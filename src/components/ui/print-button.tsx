"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PrintButton() {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => window.print()}
      className="no-print min-h-10 gap-2 shrink-0"
      aria-label="Imprimir página"
    >
      <Printer className="h-4 w-4" />
      <span className="hidden sm:inline">Imprimir</span>
    </Button>
  );
}
