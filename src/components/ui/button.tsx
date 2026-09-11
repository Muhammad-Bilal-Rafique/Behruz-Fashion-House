import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const buttonVariants = {
  variant: {
    default:
      "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 active:scale-[0.99]",
    destructive:
      "bg-red-600 text-white shadow-xs hover:bg-red-700 active:scale-[0.99]",
    outline:
      "border border-border bg-background hover:bg-muted hover:text-foreground active:scale-[0.99]",
    secondary:
      "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80 active:scale-[0.99]",
    ghost: "hover:bg-muted hover:text-foreground",
    link: "text-primary underline-offset-4 hover:underline",
  },
  size: {
    default: "h-10 px-4 py-2 text-sm",
    sm: "h-8 rounded-xs px-3 text-xs",
    lg: "h-12 rounded-sm px-8 text-base",
    icon: "h-9 w-9",
  },
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
          buttonVariants.variant[variant],
          buttonVariants.size[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
