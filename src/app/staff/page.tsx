import { ChevronRight, Search } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { requireStaffAccess } from "@/lib/data/profile";

export const metadata: Metadata = { title: "Étudiant·e·s" };

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

export default async function StaffHomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { supabase } = await requireStaffAccess();
  const { q } = await searchParams;
  const query = (q ?? "").trim().toLowerCase();

  const [{ data: students }, { data: conversations }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, first_name, last_name, email, degree, current_year")
      .eq("role", "student")
      .order("last_name"),
    supabase
      .from("chat_conversations")
      .select("student_id, created_at")
      .eq("kind", "interview_prep")
      .eq("status", "completed"),
  ]);

  const stats = new Map<string, { count: number; last: string }>();
  for (const conv of conversations ?? []) {
    const current = stats.get(conv.student_id);
    stats.set(conv.student_id, {
      count: (current?.count ?? 0) + 1,
      last: current && current.last > conv.created_at ? current.last : conv.created_at,
    });
  }

  const filtered = (students ?? []).filter((s) =>
    !query
      ? true
      : `${s.first_name} ${s.last_name} ${s.email} ${s.degree ?? ""}`.toLowerCase().includes(query)
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Prépa entretien des étudiant·e·s</h1>
        <p className="text-muted-foreground">
          Consulte les sessions de préparation terminées par chaque étudiant·e : compte rendu IA et
          transcription complète.
        </p>
      </div>

      <form className="relative max-w-sm">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input name="q" defaultValue={q} placeholder="Rechercher (nom, email, diplôme)" className="pl-9" />
      </form>

      <Card className="shadow-soft">
        <CardContent className="divide-y divide-border p-0">
          {filtered.length === 0 && (
            <p className="p-6 text-sm text-muted-foreground">Aucun·e étudiant·e trouvé·e.</p>
          )}
          {filtered.map((student) => {
            const stat = stats.get(student.id);
            return (
              <Link
                key={student.id}
                href={`/staff/etudiants/${student.id}`}
                className="flex items-center justify-between gap-4 px-6 py-4 text-sm hover:bg-accent/40"
              >
                <span className="min-w-0">
                  <span className="block font-medium">
                    {`${student.first_name} ${student.last_name}`.trim() || student.email}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {[student.degree, student.current_year].filter(Boolean).join(" · ") || student.email}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground">
                  <span className="text-right">
                    {stat ? `${stat.count} session${stat.count > 1 ? "s" : ""}` : "Aucune session"}
                    {stat && <span className="block">dernière le {formatDate(stat.last)}</span>}
                  </span>
                  <ChevronRight className="size-4" />
                </span>
              </Link>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
