import "server-only";

import type { InterviewPrepSession } from "@/components/interview-prep/interview-prep-history";
import { interviewPrepSummarySchema } from "@/lib/ai/interview-prep";
import type { createClient } from "@/lib/supabase/server";

// Sessions terminées d'un·e étudiant·e (transcription + compte rendu IA),
// partagé entre la page étudiant·e et la fiche côté CREE — l'accès est
// contrôlé par la RLS (l'étudiant·e ne voit que les siennes, le staff toutes).
export async function loadInterviewPrepSessions(
  supabase: Awaited<ReturnType<typeof createClient>>,
  studentId: string
): Promise<InterviewPrepSession[]> {
  const { data: pastConversations } = await supabase
    .from("chat_conversations")
    .select("id, created_at, metadata")
    .eq("student_id", studentId)
    .eq("kind", "interview_prep")
    .eq("status", "completed")
    .order("created_at", { ascending: false });

  if (!pastConversations?.length) return [];

  const ids = pastConversations.map((c) => c.id);
  const { data: allMessages } = await supabase
    .from("chat_messages")
    .select("conversation_id, role, content")
    .in("conversation_id", ids)
    .order("created_at");

  return pastConversations.map((conv) => {
    const messages = (allMessages ?? [])
      .filter((m) => m.conversation_id === conv.id)
      .map((m) => ({ role: m.role, content: m.content }));
    const parsedSummary = interviewPrepSummarySchema.safeParse(
      (conv.metadata as { summary?: unknown } | null)?.summary
    );
    return {
      id: conv.id,
      createdAt: conv.created_at,
      preview: messages.find((m) => m.role === "user")?.content ?? "",
      aiSummary: parsedSummary.success ? parsedSummary.data : null,
      messages,
    };
  });
}
