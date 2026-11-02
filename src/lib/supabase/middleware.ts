import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { env } from "@/lib/env";
import type { Database, UserRole } from "@/types/database.types";

const ROLE_HOME: Record<UserRole, string> = {
  student: "/dashboard/entretien",
  admin: "/staff",
  staff: "/staff",
};

// Préfixes autorisés pour chaque rôle — même logique que la Plateforme des
// Compétences : l'étudiant·e reste dans /dashboard, le CREE / la direction
// (et l'admin) dans /staff.
const ROLE_ALLOWED_PREFIXES: Record<UserRole, string[]> = {
  student: ["/dashboard"],
  admin: ["/staff"],
  staff: ["/staff"],
};

const ALL_PROTECTED_PREFIXES = ["/dashboard", "/staff"];

function isProtectedPath(pathname: string) {
  return ALL_PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function isAuthPath(pathname: string) {
  return ["/login", "/register", "/forgot-password"].some((prefix) => pathname.startsWith(prefix));
}

// Déconnexion automatique après 24h d'inactivité (cf. plateforme).
const INACTIVITY_LIMIT_MS = 24 * 60 * 60 * 1000;
const LAST_ACTIVITY_COOKIE = "last_activity";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (!user && isProtectedPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (user) {
    const lastActivityRaw = request.cookies.get(LAST_ACTIVITY_COOKIE)?.value;
    const lastActivity = lastActivityRaw ? Number(lastActivityRaw) : NaN;
    const now = Date.now();

    if (!Number.isNaN(lastActivity) && now - lastActivity > INACTIVITY_LIMIT_MS) {
      await supabase.auth.signOut();
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      const redirectResponse = NextResponse.redirect(url);
      supabaseResponse.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie));
      redirectResponse.cookies.delete(LAST_ACTIVITY_COOKIE);
      return redirectResponse;
    }

    supabaseResponse.cookies.set(LAST_ACTIVITY_COOKIE, now.toString(), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: INACTIVITY_LIMIT_MS / 1000,
    });

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role;

    if (role && (isProtectedPath(pathname) || isAuthPath(pathname) || pathname === "/")) {
      const allowedPrefixes = ROLE_ALLOWED_PREFIXES[role];

      if (
        pathname === "/" ||
        isAuthPath(pathname) ||
        !allowedPrefixes.some((prefix) => pathname.startsWith(prefix))
      ) {
        const url = request.nextUrl.clone();
        url.pathname = ROLE_HOME[role];
        url.search = "";
        return NextResponse.redirect(url);
      }
    }
  }

  return supabaseResponse;
}
