"use server";

import { revalidatePath } from "next/cache";

import {
  getInterviewPrepReply,
  summarizeInterviewPrepSession,
  type ChatTurn,
} from "@/lib/ai/interview-prep";
import { PRE_INTERVIEW_CHECKLIST_MESSAGE } from "@/lib/ai/interview-prep-checklist";
import { createClient } from "@/lib/supabase/server";

function openingMessage(firstName: string) {
  return `Salut ${firstName || ""} ! Je vais t'aider à te préparer pour ton entretien d'alternance.\n\nPour commencer : quel est le poste visé ? Précise si possible l'entreprise et le secteur, ça m'aidera à cibler mes questions. (Si c'est en fait pour un stage ou un emploi plutôt qu'une alternance, dis-le moi et on adapte.)`.trim();
}

export type ConversationResult =
  | { success: true; conversationId: string; messages: ChatTurn[] }
  | { success: false; error: string };

// Get-or-create-active-conversation pattern (repris de la Plateforme des
// Compétences) : a student can run several interview
// prep sessions over time: each is closed via endInterviewPrepSessionAction,
// which frees the (student_id, kind) slot for a fresh one.
export async function getOrCreateInterviewPrepConversationAction(): Promise<ConversationResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Non authentifié." };

  let conversationId: string | undefined;

  // Jusqu'à 3 tentatives : le cas normal (déjà une conversation active, ou
  // aucune -> on la crée) se résout dès la première itération. Signalé une
  // fois en prod juste après la fin d'une session ("Impossible de démarrer
  // la conversation") — probablement une course avec une requête
  // concurrente créant la conversation au même moment (l'index unique
  // partiel chat_conversations_one_active_idx fait échouer l'un des deux
  // inserts) ; on boucle pour re-vérifier plutôt que d'abandonner dès le
  // premier échec.
  for (let attempt = 0; attempt < 3 && !conversationId; attempt++) {
    const { data: existing, error: selectError } = await supabase
      .from("chat_conversations")
      .select("id")
      .eq("student_id", user.id)
      .eq("kind", "interview_prep")
      .eq("status", "active")
      .maybeSingle();
    if (selectError) {
      console.error("[interview-prep] getOrCreate: échec de la recherche de conversation active:", selectError);
    }
    if (existing) {
      conversationId = existing.id;
      break;
    }

    const { data: newConv, error: insertError } = await supabase
      .from("chat_conversations")
      .insert({ student_id: user.id, kind: "interview_prep" })
      .select("id")
      .single();

    if (newConv) {
      conversationId = newConv.id;
      const { data: profile } = await supabase
        .from("profiles")
        .select("first_name")
        .eq("id", user.id)
        .single();
      await supabase.from("chat_messages").insert({
        conversation_id: conversationId,
        role: "assistant",
        content: openingMessage(profile?.first_name ?? ""),
      });
    } else {
      console.error(
        `[interview-prep] getOrCreate: échec de la création de conversation (tentative ${attempt + 1}/3):`,
        insertError
      );
    }
  }

  if (!conversationId) {
    return { success: false, error: "Impossible de démarrer la conversation. Réessaie dans un instant." };
  }

  const { data: messages } = await supabase
    .from("chat_messages")
    .select("role, content")
    .eq("conversation_id", conversationId)
    .order("created_at");

  return {
    success: true,
    conversationId,
    messages: (messages ?? []).map((m) => ({ role: m.role, content: m.content })),
  };
}

export type SendMessageResult = { success: true; replies: string[] } | { success: false; error: string };

export async function sendInterviewPrepMessageAction(
  conversationId: string,
  userMessage: string
): Promise<SendMessageResult> {
  const trimmed = userMessage.trim();
  if (!trimmed) return { success: false, error: "Message vide." };
  if (trimmed.length > 4000) return { success: false, error: "Message trop long." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Non authentifié." };

  // Cost/abuse guard: bound how long a single
  // session can run. A student who wants more just starts a new session.
  const { count: messageCount } = await supabase
    .from("chat_messages")
    .select("id", { count: "exact", head: true })
    .eq("conversation_id", conversationId);
  if ((messageCount ?? 0) >= 80) {
    return {
      success: false,
      error: "Cette session est bien fournie ! Termine-la et relance-en une nouvelle si besoin.",
    };
  }

  // Le seul message existant à ce stade est le message d'ouverture — donc
  // ce message-ci est la toute première réponse de l'étudiant·e (poste
  // visé). Les rappels avant-entretien s'insèrent juste après elle, avant
  // la vraie première question du coach.
  const isFirstStudentReply = (messageCount ?? 0) <= 1;

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, headline, degree, current_year, skills, experiences")
    .eq("id", user.id)
    .single();

  // Insert scoped to this conversation via RLS ("Students manage messages in
  // their own conversations") — a conversationId the caller doesn't own
  // simply fails here.
  const { error: insertError } = await supabase
    .from("chat_messages")
    .insert({ conversation_id: conversationId, role: "user", content: trimmed });
  if (insertError) return { success: false, error: "Impossible d'envoyer le message." };

  const { data: history } = await supabase
    .from("chat_messages")
    .select("role, content")
    .eq("conversation_id", conversationId)
    .order("created_at");

  let reply: string;
  try {
    reply = await getInterviewPrepReply(
      (history ?? []).map((m) => ({ role: m.role, content: m.content })),
      {
        firstName: profile?.first_name ?? "",
        headline: profile?.headline ?? null,
        skills: profile?.skills ?? [],
        experiences: profile?.experiences ?? [],
        degree: profile?.degree ?? null,
        currentYear: profile?.current_year ?? null,
      }
    );
  } catch (err) {
    console.error("[interview-prep] getInterviewPrepReply failed:", err);
    return { success: false, error: "Le coach n'a pas pu répondre pour le moment. Réessaie." };
  }

  const replies: string[] = [];
  if (isFirstStudentReply) {
    // Insertion séparée du reply de l'IA (pas un insert multi-lignes) :
    // `now()` est évalué une seule fois pour tout un statement en
    // Postgres, donc un insert groupé donnerait le même `created_at` aux
    // deux messages — l'ordre au ré-affichage (.order("created_at"))
    // deviendrait alors arbitraire entre les deux.
    await supabase.from("chat_messages").insert({
      conversation_id: conversationId,
      role: "assistant",
      content: PRE_INTERVIEW_CHECKLIST_MESSAGE,
    });
    replies.push(PRE_INTERVIEW_CHECKLIST_MESSAGE);
  }

  await supabase
    .from("chat_messages")
    .insert({ conversation_id: conversationId, role: "assistant", content: reply });
  replies.push(reply);

  revalidatePath("/dashboard/entretien");
  return { success: true, replies };
}

export async function endInterviewPrepSessionAction(conversationId: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: history } = await supabase
    .from("chat_messages")
    .select("role, content")
    .eq("conversation_id", conversationId)
    .order("created_at");

  const transcript: ChatTurn[] = (history ?? []).map((m) => ({ role: m.role, content: m.content }));

  // Best-effort: a summary failing shouldn't block the student from ending
  // their session — the raw transcript still stays available in the
  // history view either way.
  if (transcript.some((m) => m.role === "user")) {
    try {
      const summary = await summarizeInterviewPrepSession(transcript);
      if (summary) {
        await supabase
          .from("chat_conversations")
          .update({ metadata: { summary } })
          .eq("id", conversationId)
          .eq("student_id", user.id);
      }
    } catch (err) {
      console.error("[interview-prep] summarizeInterviewPrepSession failed:", err);
    }
  }

  await supabase
    .from("chat_conversations")
    .update({ status: "completed" })
    .eq("id", conversationId)
    .eq("student_id", user.id);

  revalidatePath("/dashboard/entretien");
}
