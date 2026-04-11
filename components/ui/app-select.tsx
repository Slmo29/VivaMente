"use client";

import { useState, useEffect, useRef } from "react";
import { COLORS } from "@/lib/design-tokens";
import { NavArrowDown, NavArrowUp } from "iconoir-react";

export interface AppSelectOption {
  value: string;
  label: string;
}

interface AppSelectProps {
  value: string;
  onChange: (v: string) => void;
  options: AppSelectOption[];
  placeholder?: string;
  /** "default" = form field full width, "sm" = compact inline pill */
  size?: "default" | "sm";
  /** Direction the dropdown opens */
  direction?: "up" | "down";
  /** Override auto-search visibility (auto: show if options > 6) */
  showSearch?: boolean;
  className?: string;
}

export default function AppSelect({
  value,
  onChange,
  options,
  placeholder = "Seleziona...",
  size = "default",
  direction = "up",
  showSearch: showSearchProp,
  className = "",
}: AppSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const showSearch = showSearchProp !== undefined ? showSearchProp : options.length > 6;
  const filtered = showSearch
    ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  const selectedLabel = options.find((o) => o.value === value)?.label;

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    if (open) document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  if (size === "sm") {
    return (
      <div ref={ref} className={`relative ${className}`}>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-1 text-xs font-semibold rounded-lg px-2 py-1 border transition-all outline-none cursor-pointer"
          style={{
            backgroundColor: "#F3F4F6",
            borderColor: COLORS.border,
            color: COLORS.inkSecondary,
          }}
        >
          <span>{selectedLabel ?? placeholder}</span>
          {open
            ? <NavArrowUp width={12} height={12} strokeWidth={2} color={COLORS.inkMuted} />
            : <NavArrowDown width={12} height={12} strokeWidth={2} color={COLORS.inkMuted} />
          }
        </button>

        {open && (
          <div
            className={`absolute right-0 z-50 rounded-xl bg-white border border-border overflow-hidden ${direction === "up" ? "bottom-full mb-1" : "top-full mt-1"}`}
            style={{ minWidth: 120, boxShadow: "0 4px 20px rgba(0,0,0,0.12)" }}
          >
            {filtered.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => { onChange(o.value); setOpen(false); }}
                className="w-full text-left px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap"
                style={{
                  backgroundColor: value === o.value ? COLORS.primaryLight : undefined,
                  color: value === o.value ? COLORS.primary : COLORS.inkPrimary,
                  fontWeight: value === o.value ? 700 : undefined,
                }}
              >
                {o.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // size === "default" — form field
  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full min-h-[56px] rounded-md px-4 text-base bg-background border-2 border-border focus:outline-none focus:border-primary transition-colors flex items-center justify-between"
        style={{ color: value ? COLORS.inkPrimary : COLORS.inkMuted }}
      >
        <span>{selectedLabel ?? placeholder}</span>
        {open
          ? <NavArrowUp width={16} height={16} strokeWidth={1.5} color={COLORS.inkMuted} />
          : <NavArrowDown width={16} height={16} strokeWidth={1.5} color={COLORS.inkMuted} />
        }
      </button>

      {open && (
        <div
          className={`absolute left-0 right-0 z-50 rounded-xl bg-white border border-border overflow-hidden ${direction === "up" ? "bottom-full mb-1" : "top-full mt-1"}`}
          style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.12)" }}
        >
          {showSearch && (
            <div className="px-3 pt-3 pb-2">
              <input
                autoFocus
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cerca..."
                className="w-full px-3 py-2 rounded-lg text-sm bg-background border border-border focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          )}
          <div className="overflow-y-auto" style={{ maxHeight: 220 }}>
            {filtered.length === 0 ? (
              <p className="text-sm text-center py-3" style={{ color: COLORS.inkMuted }}>Nessun risultato</p>
            ) : (
              filtered.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => { onChange(o.value); setOpen(false); setSearch(""); }}
                  className="w-full text-left px-4 py-2.5 text-sm transition-colors"
                  style={{
                    backgroundColor: value === o.value ? COLORS.primaryLight : undefined,
                    color: value === o.value ? COLORS.primary : COLORS.inkPrimary,
                    fontWeight: value === o.value ? 700 : undefined,
                  }}
                >
                  {o.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
