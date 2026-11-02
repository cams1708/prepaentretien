import { Mic } from "lucide-react";
import Link from "next/link";

import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";

// Les utilisateurs connectés sont redirigés par le middleware vers leur
// espace (étudiant·e : /dashboard/entretien, CREE : /staff).
export default function HomePage() {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="flex h-16 items-center justify-between px-6">
        <Logo />
        <Button asChild variant="ghost" size="sm">
          <Link href="/login">Connexion</Link>
        </Button>
      </header>
      <main className="flex flex-1 items-center justify-center px-6">
        <div className="max-w-2xl space-y-6 text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Mic className="size-6" />
          </span>
          <h1 className="text-4xl font-semibold tracking-tight text-balance">
            Prépare ton entretien d&apos;alternance avec le coach IA de l&apos;ECM
          </h1>
          <p className="text-lg text-muted-foreground">
            Indique le poste visé, réponds aux questions d&apos;un·e recruteur·se RH, reçois un retour
            concret après chaque réponse et un compte rendu complet à la fin de la session.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/register">Créer mon compte</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/login">Se connecter</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
