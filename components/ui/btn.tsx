"use client";

import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "success" | "danger";
  size?: "default" | "lg" | "sm";
  fullWidth?: boolean;
}

const Btn = forwardRef<HTMLButtonElement, BtnProps>(
  ({ className, variant = "primary", size = "default", fullWidth = true, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          // Base
          "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-150",
          "active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none",
          "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30",
          // Size
          size === "lg"      && "min-h-[60px] text-lg rounded-full px-6 py-3",
          size === "default" && "min-h-[60px] text-base rounded-full px-5 py-3",
          size === "sm"      && "min-h-[44px] text-sm rounded-full px-4 py-2",
          // Width
          fullWidth && "w-full",
          // Variants
          variant === "primary"   && "bg-primary text-white shadow-card-md hover:bg-primary-dark",
          variant === "secondary" && "bg-surface-alt text-primary border-2 border-primary",
          variant === "outline"   && "border-2 border-primary text-primary bg-surface hover:bg-primary-light/30",
          variant === "ghost"     && "bg-transparent text-ink-secondary hover:bg-surface-alt",
          variant === "success"   && "bg-success text-white shadow-card-md",
          variant === "danger"    && "bg-[#C62828] text-white shadow-card-md hover:bg-[#B71C1C]",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Btn.displayName = "Btn";
export default Btn;
