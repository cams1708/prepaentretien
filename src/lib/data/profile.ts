import "server-only";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export async function requireProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();

  if (!profile) {
    redirect("/login");
  }

  return { supabase, profile };
}

export async function requireStudentProfile() {
  const { supabase, profile } = await requireProfile();
  if (profile.role !== "student") redirect("/staff");
  return { supabase, profile };
}

export async function requireStaffAccess() {
  const { supabase, profile } = await requireProfile();
  if (profile.role !== "staff" && profile.role !== "admin") redirect("/dashboard/entretien");
  return { supabase, profile };
}
