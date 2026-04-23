"use client";

import BottomNav from "@/components/BottomNav";
import UserInit from "@/components/UserInit";
import { useUserStore } from "@/lib/store";

function AppShell({ children }: { children: React.ReactNode }) {
  const initialized = useUserStore((s) => s.initialized);

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background max-w-lg mx-auto">
        <div className="w-8 h-8 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: "#2563EB", borderTopColor: "transparent" }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-lg mx-auto">
      <main className="flex-1 pb-28">{children}</main>
      <BottomNav />
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <UserInit />
      <AppShell>{children}</AppShell>
    </>
  );
}
