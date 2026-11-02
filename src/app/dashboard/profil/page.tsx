import type { Metadata } from "next";

import { requireStudentProfile } from "@/lib/data/profile";

import { ProfileForm } from "./profile-form";

export const metadata: Metadata = { title: "Mon profil" };

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string }>;
}) {
  const { profile } = await requireStudentProfile();
  const { welcome } = await searchParams;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Mon profil</h1>
        <p className="text-muted-foreground">
          {welcome
            ? "Bienvenue ! Avant ta première simulation, renseigne ton diplôme, tes compétences et tes expériences : le coach s'en sert pour personnaliser ses questions (mises en situation, « pourquoi vous ? »...)."
            : "Ces informations servent uniquement au coach pour personnaliser tes simulations d'entretien."}
        </p>
      </div>
      <ProfileForm
        defaults={{
          firstName: profile.first_name,
          lastName: profile.last_name,
          headline: profile.headline ?? "",
          degree: profile.degree ?? "",
          currentYear: profile.current_year ?? "",
          skills: profile.skills.join(", "),
          experiences: profile.experiences.join("\n"),
        }}
      />
    </div>
  );
}
