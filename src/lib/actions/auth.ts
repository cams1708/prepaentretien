"use server";

import { redirect } from "next/navigation";

import type { ActionFormState } from "@/lib/action-state";
import { env } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  studentRegisterSchema,
} from "@/lib/validations/auth";
import type { UserRole } from "@/types/database.types";

export type AuthActionState = ActionFormState;

const ROLE_HOME: Record<UserRole, string> = {
  student: "/dashboard/entretien",
  admin: "/staff",
  staff: "/staff",
};

export async function loginAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { status: "error", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    if (error.message.toLowerCase().includes("email not confirmed")) {
      return {
        status: "error",
        message:
          "Adresse email non confirmée. Vérifie ta boîte mail (et les spams) pour le lien de confirmation.",
      };
    }
    return { status: "error", message: "Email ou mot de passe incorrect." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  const next = formData.get("next");
  const isSafeNext = typeof next === "string" && next.startsWith("/") && !next.startsWith("//");

  redirect(isSafeNext ? next : ROLE_HOME[profile?.role ?? "student"]);
}

export async function registerStudentAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = studentRegisterSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { status: "error", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${env.siteUrl}/auth/callback`,
      data: {
        first_name: parsed.data.firstName,
        last_name: parsed.data.lastName,
      },
    },
  });

  if (error) {
    return { status: "error", message: translateSignUpError(error.message) };
  }

  if (data.session) {
    // Premier passage : on invite à compléter le profil, qui sert au coach.
    redirect("/dashboard/profil?welcome=1");
  }

  return {
    status: "success",
    message: "Compte créé ! Vérifiez votre boîte mail pour confirmer votre adresse.",
  };
}

export async function forgotPasswordAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get("email") });

  if (!parsed.success) {
    return { status: "error", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${env.siteUrl}/auth/callback?next=/reset-password`,
  });

  if (error) {
    console.error("[auth] resetPasswordForEmail failed:", error);
    if (error.status === 429) {
      return { status: "error", message: "Trop de tentatives. Réessaie dans quelques minutes." };
    }
    return {
      status: "error",
      message: "Impossible d'envoyer l'email pour le moment. Réessaie dans quelques instants.",
    };
  }

  // Toujours le même message, que l'email existe ou non.
  return {
    status: "success",
    message: "Si un compte existe pour cet email, un lien de réinitialisation vient d'être envoyé.",
  };
}

export async function resetPasswordAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = resetPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { status: "error", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });

  if (error) {
    return {
      status: "error",
      message: "Impossible de mettre à jour le mot de passe. Réessayez le lien de réinitialisation.",
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();

  redirect(ROLE_HOME[profile?.role ?? "student"]);
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

function translateSignUpError(message: string): string {
  if (message.toLowerCase().includes("already registered")) {
    return "Un compte existe déjà avec cet email.";
  }
  if (message.toLowerCase().includes("password")) {
    return "Le mot de passe ne respecte pas les critères de sécurité requis.";
  }
  return "Impossible de créer le compte. Réessayez dans quelques instants.";
}
