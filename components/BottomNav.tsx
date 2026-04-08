"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type IconProps = { active: boolean };

function HomeIcon({ active }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill={"none"} stroke="currentColor" strokeWidth={2} className="w-6 h-6 flex-shrink-0">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}

function EserciziIcon({ active }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill={"none"} stroke="currentColor" strokeWidth={2} className="w-6 h-6 flex-shrink-0">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  );
}

function ProgressiIcon({ active }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill={"none"} stroke="currentColor" strokeWidth={2} className="w-6 h-6 flex-shrink-0">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

function ProfiloIcon({ active }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill={"none"} stroke="currentColor" strokeWidth={2} className="w-6 h-6 flex-shrink-0">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

const navItems = [
  { href: "/home",      label: "Home",      Icon: HomeIcon },
  { href: "/esercizi",  label: "Esercizi",  Icon: EserciziIcon },
  { href: "/progressi", label: "Progressi", Icon: ProgressiIcon },
  { href: "/profilo",   label: "Profilo",   Icon: ProfiloIcon },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    /* Floating pill */
    <nav className="fixed bottom-5 left-4 right-4 z-50 max-w-lg mx-auto">
      <div className="bg-surface rounded-xl shadow-float h-[72px] flex items-center px-2">
        {navItems.map(({ href, label, Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex items-center justify-center"
            >
              <div
                className={cn(
                  "flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg transition-all duration-200 min-w-[60px]",
                  active ? "text-[#1891B1]" : "text-ink-secondary"
                )}
              >
                <Icon active={active} />
                <span className="text-xs font-semibold leading-tight">
                  {label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
