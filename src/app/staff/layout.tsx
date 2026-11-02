import { Users } from "lucide-react";

import { DashboardShell, type DashboardNavItem } from "@/components/dashboard/dashboard-shell";
import { requireStaffAccess } from "@/lib/data/profile";

const NAV_ITEMS: DashboardNavItem[] = [
  { href: "/staff", label: "Étudiant·e·s", icon: <Users className="size-4" /> },
];

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireStaffAccess();

  return (
    <DashboardShell
      navItems={NAV_ITEMS}
      user={{
        name: `${profile.first_name} ${profile.last_name}`.trim() || profile.email,
        email: profile.email,
        roleLabel: profile.role === "admin" ? "Administrateur" : "CREE / Direction",
      }}
    >
      {children}
    </DashboardShell>
  );
}
