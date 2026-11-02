"use client";

import Link from "next/link";
import { useActionState } from "react";

import { INITIAL_FORM_STATE } from "@/lib/action-state";
import { registerStudentAction } from "@/lib/actions/auth";
import { PasswordInput } from "@/components/shared/password-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerStudentAction, INITIAL_FORM_STATE);

  if (state.status === "success") {
    return <SuccessNotice message={state.message} />;
  }

  return (
    <form action={formAction} className="space-y-4">
      {state.status === "error" && state.message && <ErrorBanner message={state.message} />}

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="firstName">Prénom</Label>
          <Input id="firstName" name="firstName" autoComplete="given-name" required />
          <FieldError errors={state.fieldErrors?.firstName} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Nom</Label>
          <Input id="lastName" name="lastName" autoComplete="family-name" required />
          <FieldError errors={state.fieldErrors?.lastName} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
        <FieldError errors={state.fieldErrors?.email} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="password">Mot de passe</Label>
          <PasswordInput id="password" name="password" autoComplete="new-password" required />
          <FieldError errors={state.fieldErrors?.password} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirmer</Label>
          <PasswordInput
            id="confirmPassword"
            name="confirmPassword"
            autoComplete="new-password"
            required
          />
          <FieldError errors={state.fieldErrors?.confirmPassword} />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Création..." : "Créer mon compte étudiant"}
      </Button>
    </form>
  );
}

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return <p className="text-sm text-destructive">{errors[0]}</p>;
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{message}</p>
  );
}

function SuccessNotice({ message }: { message?: string }) {
  return (
    <div className="space-y-4 rounded-lg border border-border bg-accent/40 p-4 text-sm">
      <p>{message}</p>
      <Link href="/login" className="font-medium text-primary hover:underline">
        Retour à la connexion
      </Link>
    </div>
  );
}
