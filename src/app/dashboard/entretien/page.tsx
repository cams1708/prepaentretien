import type { Metadata } from "next";
import Link from "next/link";

import { InterviewPrepHistory } from "@/components/interview-prep/interview-prep-history";
import { ConversationError } from "@/components/shared/conversation-error";
import { getOrCreateInterviewPrepConversationAction } from "@/lib/actions/interview-prep";
import { loadInterviewPrepSessions } from "@/lib/data/interview-prep-sessions";
import { requireStudentProfile } from "@/lib/data/profile";

import { InterviewPrepChat } from "./interview-prep-chat";

export const metadata: Metadata = { title: "Prépa entretien" };
// Server Actions invoked from this page (sendInterviewPrepMessageAction) call
// the Claude API and can take a few seconds — sans ça, Vercel Hobby coupe la
// fonction à 10 s par défaut.
export const maxDuration = 60;

export default async function InterviewPrepPage() {
  const { supabase, profile } = await requireStudentProfile();

  const [result, sessions] = await Promise.all([
    getOrCreateInterviewPrepConversationAction(),
    loadInterviewPrepSessions(supabase, profile.id),
  ]);

  const profileIsEmpty =
    !profile.headline && !profile.degree && profile.skills.length === 0 && profile.experiences.length === 0;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Prépa entretien</h1>
        <p className="text-muted-foreground">
          Simule un entretien avec le coach IA : décris le poste visé, réponds à ses questions, et
          reçois des retours pour t&apos;améliorer. Tu peux relancer une nouvelle session à tout
          moment.
        </p>
        {profileIsEmpty && (
          <p className="mt-3 rounded-lg border border-border bg-accent/40 px-3 py-2 text-sm">
            Astuce : complète{" "}
            <Link href="/dashboard/profil" className="font-medium text-primary hover:underline">
              ton profil
            </Link>{" "}
            (diplôme, compétences, expériences) pour que le coach personnalise ses questions.
          </p>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr] lg:items-start">
        {result.success ? (
          // key={conversationId}: forces a full remount when a session ends and
          // a fresh conversation is created — otherwise React keeps this
          // component's internal `messages` state (initialized once via
          // useState) from the just-ended conversation instead of picking up
          // the new one's initialMessages.
          <InterviewPrepChat
            key={result.conversationId}
            conversationId={result.conversationId}
            initialMessages={result.messages}
          />
        ) : (
          <ConversationError message={result.error} />
        )}

        {sessions.length > 0 && <InterviewPrepHistory sessions={sessions} />}
      </div>
    </div>
  );
}
