import { z } from "zod";

// Une compétence par virgule / une expérience par ligne : formulaire volontairement
// simple, seules ces informations servent au coach pour personnaliser l'entretien.
export const studentProfileSchema = z.object({
  firstName: z.string().trim().min(1, "Le prénom est requis").max(80),
  lastName: z.string().trim().min(1, "Le nom est requis").max(80),
  headline: z.string().trim().max(200, "200 caractères maximum"),
  degree: z.string().trim().max(120),
  currentYear: z.string().trim().max(40),
  skills: z.array(z.string().trim().min(1).max(80)).max(40, "40 compétences maximum"),
  experiences: z.array(z.string().trim().min(1).max(200)).max(20, "20 expériences maximum"),
});
