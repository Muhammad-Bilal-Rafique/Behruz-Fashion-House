"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface AccordionContextValue {
  value?: string | string[];
  onItemClick: (itemValue: string) => void;
  collapsible?: boolean;
}

const AccordionContext = React.createContext<AccordionContextValue | null>(null);

function useAccordion() {
  const context = React.useContext(AccordionContext);
  if (!context) {
    throw new Error("Accordion components must be used within an Accordion");
  }
  return context;
}

interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: "single" | "multiple";
  collapsible?: boolean;
  defaultValue?: string | string[];
  value?: string | string[];
  onValueChange?: (value: string | string[]) => void;
}

export const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(
  (
    {
      type = "single",
      collapsible = true,
      defaultValue,
      value: controlledValue,
      onValueChange,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const [uncontrolledValue, setUncontrolledValue] = React.useState<string | string[]>(
      defaultValue ?? (type === "multiple" ? [] : "")
    );

    const isControlled = controlledValue !== undefined;
    const value = isControlled ? controlledValue : uncontrolledValue;

    const onItemClick = React.useCallback(
      (itemValue: string) => {
        if (type === "single") {
          const currentValue = typeof value === "string" ? value : "";
          const newValue = currentValue === itemValue ? (collapsible ? "" : currentValue) : itemValue;

          if (!isControlled) {
            setUncontrolledValue(newValue);
          }
          onValueChange?.(newValue);
        } else {
          const currentArray = Array.isArray(value) ? value : [];
          const exists = currentArray.includes(itemValue);
          const newArray = exists
            ? currentArray.filter((v) => v !== itemValue)
            : [...currentArray, itemValue];

          if (!isControlled) {
            setUncontrolledValue(newArray);
          }
          onValueChange?.(newArray);
        }
      },
      [type, collapsible, value, isControlled, onValueChange]
    );

    return (
      <AccordionContext.Provider value={{ value, onItemClick, collapsible }}>
        <div ref={ref} className={cn("space-y-3", className)} {...props}>
          {children}
        </div>
      </AccordionContext.Provider>
    );
  }
);
Accordion.displayName = "Accordion";

interface AccordionItemContextValue {
  value: string;
  isOpen: boolean;
  itemId: string;
}

const AccordionItemContext = React.createContext<AccordionItemContextValue | null>(null);

function useAccordionItem() {
  const context = React.useContext(AccordionItemContext);
  if (!context) {
    throw new Error("AccordionItem subcomponents must be used within an AccordionItem");
  }
  return context;
}

export interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export const AccordionItem = React.forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ value, className, children, ...props }, ref) => {
    const { value: selectedValue } = useAccordion();
    const itemId = React.useId();

    const isOpen = Array.isArray(selectedValue)
      ? selectedValue.includes(value)
      : selectedValue === value;

    return (
      <AccordionItemContext.Provider value={{ value, isOpen, itemId }}>
        <div
          ref={ref}
          data-state={isOpen ? "open" : "closed"}
          className={cn(
            "border border-border/80 bg-background transition-colors duration-200",
            isOpen && "border-primary/40 shadow-xs",
            className
          )}
          {...props}
        >
          {children}
        </div>
      </AccordionItemContext.Provider>
    );
  }
);
AccordionItem.displayName = "AccordionItem";

export interface AccordionTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const AccordionTrigger = React.forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  ({ className, children, ...props }, ref) => {
    const { onItemClick } = useAccordion();
    const { value, isOpen, itemId } = useAccordionItem();

    return (
      <button
        ref={ref}
        type="button"
        id={`accordion-trigger-${itemId}`}
        aria-controls={`accordion-content-${itemId}`}
        aria-expanded={isOpen}
        onClick={() => onItemClick(value)}
        className={cn(
          "flex w-full items-center justify-between gap-4 p-5 sm:p-6 text-left font-serif text-base sm:text-lg font-normal tracking-tight text-foreground transition-all duration-200 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 cursor-pointer",
          isOpen && "text-primary",
          className
        )}
        {...props}
      >
        <span className="flex-1 leading-snug">{children}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 ease-out",
            isOpen && "rotate-180 text-primary"
          )}
          aria-hidden="true"
        />
      </button>
    );
  }
);
AccordionTrigger.displayName = "AccordionTrigger";

export interface AccordionContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const AccordionContent = React.forwardRef<HTMLDivElement, AccordionContentProps>(
  ({ className, children, ...props }, ref) => {
    const { isOpen, itemId } = useAccordionItem();

    return (
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key={`content-${itemId}`}
            id={`accordion-content-${itemId}`}
            role="region"
            aria-labelledby={`accordion-trigger-${itemId}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div
              ref={ref}
              className={cn(
                "px-5 pb-6 sm:px-6 sm:pb-7 pt-1 text-sm sm:text-[15px] leading-relaxed text-muted-foreground font-light border-t border-border/40",
                className
              )}
              {...props}
            >
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }
);
AccordionContent.displayName = "AccordionContent";
