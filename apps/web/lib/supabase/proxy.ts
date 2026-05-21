import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getSupabaseEnv } from "./env";

const protectedRoutes = ["/dashboard", "/boards"];
const authRoutes = ["/auth/login", "/auth/register"];

function isProtectedRoute(pathname: string) {
  return protectedRoutes.some((route) => pathname.startsWith(route));
}

function isAuthRoute(pathname: string) {
  return authRoutes.includes(pathname);
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });
  const { supabaseUrl, supabasePublishableKey } = getSupabaseEnv();

  const supabase = createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        response = NextResponse.next({
          request,
        });

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;

  if (isProtectedRoute(pathname) && !user) {
    const redirectUrl = request.nextUrl.clone();
    const redirectTo = `${request.nextUrl.pathname}${request.nextUrl.search}`;

    redirectUrl.pathname = "/auth/login";
    redirectUrl.search = "";
    redirectUrl.searchParams.set("redirectTo", redirectTo);

    return NextResponse.redirect(redirectUrl);
  }

  if (isAuthRoute(pathname) && user) {
    const redirectUrl = request.nextUrl.clone();

    redirectUrl.pathname = "/dashboard";
    redirectUrl.search = "";

    return NextResponse.redirect(redirectUrl);
  }

  return response;
}
