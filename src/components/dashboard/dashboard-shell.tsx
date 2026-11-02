import { LogOut, Menu } from "lucide-react";

import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { logoutAction } from "@/lib/actions/auth";

import { NavLink } from "./nav-link";
import { UserMenu } from "./user-menu";

export type DashboardNavItem = {
  href: string;
  label: string;
  // A pre-rendered icon element (e.g. `<LayoutDashboard className="size-4" />`),
  // not a component reference — component references can't cross the
  // server -> client boundary since NavLink is a Client Component.
  icon: React.ReactNode;
};

export function DashboardShell({
  navItems,
  user,
  children,
}: {
  navItems: DashboardNavItem[];
  user: { name: string; email: string; avatarUrl?: string | null; roleLabel: string };
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border/60 bg-sidebar lg:flex">
        <div className="flex h-16 items-center border-b border-sidebar-border/60 bg-[linear-gradient(to_bottom,var(--brand-50),transparent)] px-5 dark:bg-[linear-gradient(to_bottom,var(--brand-800)/25%,transparent)]">
          <Logo />
        </div>
        <nav className="flex-1 space-y-1 px-3 py-3">
          {navItems.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </nav>
        <div className="border-t border-sidebar-border p-3">
          <UserMenu user={user} />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border/60 bg-background/80 px-4 shadow-soft backdrop-blur-md sm:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <div className="flex h-16 items-center px-5">
                <Logo />
              </div>
              <nav className="flex-1 space-y-1 px-3 py-2">
                {navItems.map((item) => (
                  <NavLink key={item.href} item={item} />
                ))}
              </nav>
              <div className="border-t border-sidebar-border p-3">
                <UserMenu user={user} />
              </div>
            </SheetContent>
          </Sheet>

          <Logo className="lg:hidden" />

          <div className="ml-auto flex items-center gap-2">
            <span className="hidden text-sm text-muted-foreground sm:inline">{user.roleLabel}</span>
            <ThemeToggle />
            <form action={logoutAction}>
              <Button type="submit" variant="ghost" size="icon" aria-label="Se déconnecter">
                <LogOut className="size-4" />
              </Button>
            </form>
          </div>
        </header>

        <main className="relative flex-1 p-4 sm:p-6 lg:p-8">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] bg-[radial-gradient(ellipse_at_top,var(--brand-50),transparent_65%)] dark:bg-[radial-gradient(ellipse_at_top,var(--brand-800),transparent_65%)] dark:opacity-30"
            aria-hidden
          />
          {children}
        </main>
      </div>
    </div>
  );
}
