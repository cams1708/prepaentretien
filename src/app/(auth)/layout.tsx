import { ClipboardCheck, MessageSquareText, Mic } from "lucide-react";

import { Logo } from "@/components/shared/logo";

const HIGHLIGHTS = [
  { icon: Mic, text: "Simule un entretien d'alternance réaliste, question par question." },
  { icon: MessageSquareText, text: "Reçois un retour concret de coaching après chaque réponse." },
  { icon: ClipboardCheck, text: "Garde un compte rendu de chaque session pour progresser." },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col justify-between gap-8 p-6 sm:p-10">
        <Logo />
        <div className="mx-auto w-full max-w-sm">{children}</div>
        <p className="text-center text-xs text-muted-foreground lg:text-left">
          © {new Date().getFullYear()} ECM — Prépa Entretien
        </p>
      </div>

      <div className="relative hidden overflow-hidden bg-primary lg:block">
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.18),transparent_60%)]"
          aria-hidden
        />
        <div className="relative flex h-full flex-col justify-center gap-10 px-16 text-primary-foreground">
          <h2 className="max-w-md text-3xl font-semibold text-balance">
            Arrive à ton entretien d&apos;alternance en sachant déjà quoi répondre.
          </h2>
          <ul className="space-y-5">
            {HIGHLIGHTS.map((item) => (
              <li key={item.text} className="flex items-start gap-3">
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/15">
                  <item.icon className="size-4" />
                </span>
                <span className="text-primary-foreground/90">{item.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
