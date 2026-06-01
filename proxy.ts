import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Routes that require the user to be logged in
const PROTECTED_ROUTES = [
  "/dashboard",
  "/tasks",
  "/notes",
  "/links",
  "/chat",
  "/settings",
];

// Routes that logged-in users should not see (redirect to dashboard)
const AUTH_ROUTES = ["/login", "/register"];

export async function proxy(request: NextRequest) {
  // Start with a passthrough response so we can attach updated cookies.
  let supabaseResponse = NextResponse.next({ request });

  // Build a Supabase client that reads/writes cookies on the current response.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Mirror cookies onto the request so downstream code sees them.
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          // Rebuild the response so we can set cookies on it.
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Do NOT add logic between createServerClient and getUser().
  // A simple mistake can make it hard to debug session issues.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  // Unauthenticated user trying to access protected page → redirect to login
  if (isProtected && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated user on auth pages → redirect to dashboard
  if (isAuthRoute && user) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/dashboard";
    return NextResponse.redirect(dashboardUrl);
  }

  // IMPORTANT: Return supabaseResponse (not a new NextResponse) so the
  // refreshed auth cookies are forwarded to the browser.
  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Run on all routes except:
     * - _next/static (static assets)
     * - _next/image  (image optimisation)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - public folder files (*.png, *.svg, etc.)
     */
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
