"use client";

import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";

// Affiché quand getOrCreate(Onboarding|InterviewPrep)ConversationAction
// échoue (rare — un vrai échec malgré ses tentatives internes en cas de
// course avec une requête concurrente, voir ces actions). Sans ce bouton,
// l'étudiant·e n'avait aucun moyen de relancer depuis la page : seul un
// rechargement manuel du navigateur permettait de s'en sortir.
export function ConversationError({ message }: { message: string }) {
  const router = useRouter();
  const [retrying, startRetrying] = useTransition();

  return (
    <div className="space-y-3 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
      <p>{message}</p>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={retrying}
        onClick={() => startRetrying(() => router.refresh())}
      >
        <RefreshCw className={retrying ? "size-4 animate-spin" : "size-4"} /> Réessayer
      </Button>
    </div>
  );
}
