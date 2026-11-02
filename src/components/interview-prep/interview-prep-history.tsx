"use client";

import { CheckCircle2, ChevronRight, History, Lightbulb, TriangleAlert } from "lucide-react";
import { useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { InterviewPrepSummary } from "@/lib/ai/interview-prep";
import { cn } from "@/lib/utils";

export type InterviewPrepSession = {
  id: string;
  createdAt: string;
  preview: string;
  aiSummary: InterviewPrepSummary | null;
  messages: { role: "user" | "assistant"; content: string }[];
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

export function InterviewPrepHistory({
  sessions,
  description = "Relis le compte rendu et les questions de tes sessions passées.",
}: {
  sessions: InterviewPrepSession[];
  description?: string;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const openSession = sessions.find((s) => s.id === openId) ?? null;

  return (
    <>
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <History className="size-4" /> Sessions précédentes
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {sessions.map((session) => (
            <button
              key={session.id}
              type="button"
              onClick={() => setOpenId(session.id)}
              className="flex w-full items-center justify-between gap-3 rounded-lg border border-border p-3 text-left text-sm hover:bg-accent/40"
            >
              <span className="min-w-0">
                <span className="block text-xs text-muted-foreground">{formatDate(session.createdAt)}</span>
                <span className="mt-0.5 block truncate">
                  {session.preview || "Session de préparation à l'entretien"}
                </span>
              </span>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
            </button>
          ))}
        </CardContent>
      </Card>

      <Dialog open={openSession !== null} onOpenChange={(open) => !open && setOpenId(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Session du {openSession && formatDate(openSession.createdAt)}</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue={openSession?.aiSummary ? "summary" : "transcript"}>
            <TabsList>
              <TabsTrigger value="summary">Compte rendu</TabsTrigger>
              <TabsTrigger value="transcript">Transcription complète</TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="space-y-4">
              {openSession?.aiSummary ? (
                <>
                  <p className="text-sm text-muted-foreground">{openSession.aiSummary.overview}</p>

                  {openSession.aiSummary.strengths.length > 0 && (
                    <div>
                      <p className="mb-2 text-sm font-medium">Points forts</p>
                      <ul className="space-y-2">
                        {openSession.aiSummary.strengths.map((point, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-sm">
                            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {openSession.aiSummary.improvements.length > 0 && (
                    <div>
                      <p className="mb-2 text-sm font-medium">Axes d&apos;amélioration</p>
                      <ul className="space-y-2">
                        {openSession.aiSummary.improvements.map((point, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-sm">
                            <TriangleAlert className="mt-0.5 size-4 shrink-0 text-ecm-orange" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {openSession.aiSummary.keyAdvice.length > 0 && (
                    <div>
                      <p className="mb-2 text-sm font-medium">Conseils clés à retenir</p>
                      <ul className="space-y-2">
                        {openSession.aiSummary.keyAdvice.map((point, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-sm">
                            <Lightbulb className="mt-0.5 size-4 shrink-0 text-primary" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Aucun compte rendu disponible pour cette session — consulte la transcription complète.
                </p>
              )}
            </TabsContent>

            <TabsContent value="transcript" className="space-y-4">
              {openSession?.messages.map((message, i) => (
                <div
                  key={i}
                  className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-line",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-accent text-accent-foreground"
                    )}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}
