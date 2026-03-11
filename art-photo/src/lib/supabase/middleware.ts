import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/", "/auth", "/services", "/products", "/photographers", "/terms", "/privacy", "/about"];
const AUTH_ROUTES = ["/auth/login", "/auth/register", "/auth/forgot-password", "/auth/reset-password"];
const ADMIN_ROUTES = ["/admin"];
const PHOTOGRAPHER_ROUTES = ["/photographer"];
const PROTECTED_ROUTES = ["/dashboard", "/profile", "/bookings", "/orders"];

function isPathMatch(pathname: string, routes: string[]) {
  return routes.some((route) => pathname === route || pathname.startsWith(route + "/"));
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;

  if (user && isPathMatch(pathname, AUTH_ROUTES)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!user && (isPathMatch(pathname, PROTECTED_ROUTES) || isPathMatch(pathname, ADMIN_ROUTES) || isPathMatch(pathname, PHOTOGRAPHER_ROUTES))) {
    const redirectUrl = new URL("/auth/login", request.url);
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (user) {
    let role = user.app_metadata?.user_role as string | undefined;

    if (!role) {
      const { data: ur } = await supabase
        .from("user_roles")
        .select("role:roles(name)")
        .eq("user_id", user.id)
        .limit(1)
        .single();
      const raw = ur as unknown as { role: { name: string } | null } | null;
      role = raw?.role?.name ?? undefined;
    }

    if (isPathMatch(pathname, ADMIN_ROUTES) && role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    if (isPathMatch(pathname, PHOTOGRAPHER_ROUTES) && role !== "photographer" && role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return supabaseResponse;
}
