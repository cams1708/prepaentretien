"use server";

import { revalidatePath } from "next/cache";

import type { ActionFormState } from "@/lib/action-state";
import { createClient } from "@/lib/supabase/server";
import { studentProfileSchema } from "@/lib/validations/profile";

function splitList(value: FormDataEntryValue | null, separator: RegExp) {
  return String(value ?? "")
    .split(separator)
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function updateStudentProfileAction(
  _prevState: ActionFormState,
  formData: FormData
): Promise<ActionFormState> {
  const parsed = studentProfileSchema.safeParse({
    firstName: formData.get("firstName") ?? "",
    lastName: formData.get("lastName") ?? "",
    headline: formData.get("headline") ?? "",
    degree: formData.get("degree") ?? "",
    currentYear: formData.get("currentYear") ?? "",
    skills: splitList(formData.get("skills"), /[,\n]/),
    experiences: splitList(formData.get("experiences"), /\n/),
  });

  if (!parsed.success) {
    return { status: "error", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "error", message: "Non authentifié." };

  const { error } = await supabase
    .from("profiles")
    .update({
      first_name: parsed.data.firstName,
      last_name: parsed.data.lastName,
      headline: parsed.data.headline || null,
      degree: parsed.data.degree || null,
      current_year: parsed.data.currentYear || null,
      skills: Array.from(new Set(parsed.data.skills)),
      experiences: parsed.data.experiences,
    })
    .eq("id", user.id);

  if (error) {
    console.error("[profile] update failed:", error);
    return { status: "error", message: "Impossible d'enregistrer le profil. Réessaie." };
  }

  revalidatePath("/dashboard", "layout");
  return { status: "success", message: "Profil enregistré." };
}
