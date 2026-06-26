import { PrintButton } from "@/components/ui/print-button";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  className?: string;
  showPrint?: boolean;
  children?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  className,
  showPrint = true,
  children,
}: PageHeaderProps) {
  return (
    <div className={cn("mb-4 sm:mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 sm:gap-4", className)}>
      <div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-100 tracking-tight print:text-black print:text-2xl">
          {title}
        </h1>
        {description && (
          <p className="text-slate-400 mt-1.5 text-sm sm:text-base lg:text-lg max-w-2xl print:text-gray-600 print:text-sm">
            {description}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {showPrint && <PrintButton />}
        {children}
      </div>
    </div>
  );
}
