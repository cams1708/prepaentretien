import { Mic, User } from "lucide-react";

import { DashboardShell, type DashboardNavItem } from "@/components/dashboard/dashboard-shell";
import { requireStudentProfile } from "@/lib/data/profile";

const NAV_ITEMS: DashboardNavItem[] = [
  { href: "/dashboard/entretien", label: "Prépa entretien", icon: <Mic className="size-4" /> },
  { href: "/dashboard/profil", label: "Mon profil", icon: <User className="size-4" /> },
];

export default async function StudentDashboardLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireStudentProfile();

  return (
    <DashboardShell
      navItems={NAV_ITEMS}
      user={{
        name: `${profile.first_name} ${profile.last_name}`.trim() || profile.email,
        email: profile.email,
        roleLabel: "Étudiant",
      }}
    >
      {children}
    </DashboardShell>
  );
}
