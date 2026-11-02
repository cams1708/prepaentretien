"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { INITIAL_FORM_STATE } from "@/lib/action-state";
import { updateStudentProfileAction } from "@/lib/actions/profile";
import { DEGREE_OPTIONS, YEAR_LEVEL_OPTIONS } from "@/lib/degree-options";

type Defaults = {
  firstName: string;
  lastName: string;
  headline: string;
  degree: string;
  currentYear: string;
  skills: string;
  experiences: string;
};

export function ProfileForm({ defaults }: { defaults: Defaults }) {
  const [state, formAction, pending] = useActionState(updateStudentProfileAction, INITIAL_FORM_STATE);

  useEffect(() => {
    if (state.status === "success") toast.success(state.message ?? "Profil enregistré.");
    if (state.status === "error" && state.message) toast.error(state.message);
  }, [state]);

  const degreeOptions: string[] = [...DEGREE_OPTIONS];
  if (defaults.degree && !degreeOptions.includes(defaults.degree)) degreeOptions.push(defaults.degree);

  return (
    <Card className="shadow-soft">
      <CardContent className="py-6">
        <form action={formAction} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Prénom" htmlFor="firstName" errors={state.fieldErrors?.firstName}>
              <Input id="firstName" name="firstName" defaultValue={defaults.firstName} required />
            </Field>
            <Field label="Nom" htmlFor="lastName" errors={state.fieldErrors?.lastName}>
              <Input id="lastName" name="lastName" defaultValue={defaults.lastName} required />
            </Field>
          </div>

          <Field
            label="Accroche"
            htmlFor="headline"
            hint="Ex : Étudiante en Bachelor Commerce à la recherche d'une alternance en business development"
            errors={state.fieldErrors?.headline}
          >
            <Input id="headline" name="headline" defaultValue={defaults.headline} maxLength={200} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Diplôme préparé" htmlFor="degree" errors={state.fieldErrors?.degree}>
              <Select name="degree" defaultValue={defaults.degree || undefined}>
                <SelectTrigger id="degree" className="w-full">
                  <SelectValue placeholder="Choisis ton diplôme" />
                </SelectTrigger>
                <SelectContent>
                  {degreeOptions.map((degree) => (
                    <SelectItem key={degree} value={degree}>
                      {degree}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Année" htmlFor="currentYear" errors={state.fieldErrors?.currentYear}>
              <Select name="currentYear" defaultValue={defaults.currentYear || undefined}>
                <SelectTrigger id="currentYear" className="w-full">
                  <SelectValue placeholder="Choisis ton année" />
                </SelectTrigger>
                <SelectContent>
                  {YEAR_LEVEL_OPTIONS.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field
            label="Compétences"
            htmlFor="skills"
            hint="Séparées par des virgules — ex : Prospection, Négociation, Excel, Canva"
            errors={state.fieldErrors?.skills}
          >
            <Textarea id="skills" name="skills" defaultValue={defaults.skills} rows={3} />
          </Field>

          <Field
            label="Expériences"
            htmlFor="experiences"
            hint="Une par ligne — ex : Vendeur — Decathlon (job étudiant, 2024)"
            errors={state.fieldErrors?.experiences}
          >
            <Textarea id="experiences" name="experiences" defaultValue={defaults.experiences} rows={5} />
          </Field>

          <div className="flex flex-wrap items-center justify-end gap-3">
            <Button asChild type="button" variant="ghost">
              <Link href="/dashboard/entretien">Aller à la prépa entretien</Link>
            </Button>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="size-4 animate-spin" />}
              Enregistrer
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function Field({
  label,
  htmlFor,
  hint,
  errors,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  errors?: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      {errors?.length ? <p className="text-sm text-destructive">{errors[0]}</p> : null}
    </div>
  );
}
