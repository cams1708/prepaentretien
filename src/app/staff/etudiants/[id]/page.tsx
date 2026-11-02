import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { InterviewPrepHistory } from "@/components/interview-prep/interview-prep-history";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { loadInterviewPrepSessions } from "@/lib/data/interview-prep-sessions";
import { requireStaffAccess } from "@/lib/data/profile";

export const metadata: Metadata = { title: "Fiche étudiant·e" };

export default async function StaffStudentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireStaffAccess();

  const { data: student } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .eq("role", "student")
    .maybeSingle();
  if (!student) notFound();

  const sessions = await loadInterviewPrepSessions(supabase, student.id);
  const name = `${student.first_name} ${student.last_name}`.trim() || student.email;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link
        href="/staff"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Retour à la liste
      </Link>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{name}</h1>
        <p className="text-muted-foreground">{student.email}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-start">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-base">Profil utilisé par le coach</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <Info label="Accroche" value={student.headline} />
            <Info
              label="Diplôme"
              value={[student.degree, student.current_year].filter(Boolean).join(" · ") || null}
            />
            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">Compétences</p>
              {student.skills.length ? (
                <div className="flex flex-wrap gap-1.5">
                  {student.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">—</p>
              )}
            </div>
            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">Expériences</p>
              {student.experiences.length ? (
                <ul className="list-disc space-y-1 pl-5">
                  {student.experiences.map((exp, i) => (
                    <li key={i}>{exp}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">—</p>
              )}
            </div>
          </CardContent>
        </Card>

        {sessions.length > 0 ? (
          <InterviewPrepHistory
            sessions={sessions}
            description="Compte rendu et transcription des sessions terminées par l'étudiant·e."
          />
        ) : (
          <Card className="shadow-soft">
            <CardContent className="py-6 text-sm text-muted-foreground">
              Aucune session de prépa entretien terminée pour le moment.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <p className="mb-1 text-xs font-medium text-muted-foreground">{label}</p>
      <p>{value || <span className="text-muted-foreground">—</span>}</p>
    </div>
  );
}
