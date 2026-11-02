"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

import type { DashboardNavItem } from "./dashboard-shell";

export function NavLink({ item }: { item: DashboardNavItem }) {
  const pathname = usePathname();
  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-lg border-l-2 px-3 py-2 text-sm font-medium transition-all",
        isActive
          ? "border-l-ecm-orange bg-sidebar-accent text-sidebar-accent-foreground shadow-soft"
          : "border-l-transparent text-sidebar-foreground/70 hover:border-l-ecm-orange/40 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
      )}
    >
      {item.icon}
      {item.label}
    </Link>
  );
}
