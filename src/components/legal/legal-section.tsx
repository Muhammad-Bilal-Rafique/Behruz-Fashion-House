import React from "react";
import { cn } from "@/lib/utils";

interface LegalSectionProps {
  id?: string;
  index?: string | number;
  title: string;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

export function LegalSection({
  id,
  index,
  title,
  children,
  className,
  icon,
}: LegalSectionProps) {
  const sectionId = id || (typeof title === "string" ? title.toLowerCase().replace(/[^a-z0-9]+/g, "-") : undefined);

  return (
    <section
      id={sectionId}
      aria-labelledby={`${sectionId}-heading`}
      className={cn("py-8 sm:py-10 border-b border-border/60 last:border-b-0", className)}
    >
      <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
        {index && (
          <span className="text-[11px] sm:text-xs uppercase tracking-[0.2em] font-medium text-primary mt-1 shrink-0 font-mono">
            {typeof index === "number" ? String(index).padStart(2, "0") : index}
          </span>
        )}
        {icon && (
          <span className="text-primary mt-0.5 shrink-0" aria-hidden="true">
            {icon}
          </span>
        )}
        <h2
          id={`${sectionId}-heading`}
          className="font-serif text-xl sm:text-2xl font-normal text-foreground tracking-tight"
        >
          {title}
        </h2>
      </div>

      <div className={cn("text-sm sm:text-[15px] text-muted-foreground font-light leading-relaxed space-y-3.5", index ? "sm:pl-8" : "")}>
        {children}
      </div>
    </section>
  );
}

export default LegalSection;
