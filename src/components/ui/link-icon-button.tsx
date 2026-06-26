import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LinkIconButtonProps {
  href: string;
  label: string;
  className?: string;
  size?: "sm" | "default" | "lg" | "icon";
}

export function LinkIconButton({ href, label, className, size = "icon" }: LinkIconButtonProps) {
  return (
    <Button
      variant="outline"
      size={size}
      asChild
      className={cn("no-print shrink-0", className)}
    >
      <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} title={label}>
        <ExternalLink className="h-5 w-5" />
      </a>
    </Button>
  );
}
