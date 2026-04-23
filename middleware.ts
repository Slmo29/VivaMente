import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const ROUTE_PROTETTE = ["/home", "/esercizi", "/progressi", "/profilo", "/messaggi", "/famiglia"];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request: { headers: request.headers } });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Aggiorna la sessione Supabase (necessario per SSR con cookie)
  const { data: { user } } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isProtetta = ROUTE_PROTETTE.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
  const isGuest = request.cookies.get("vm_guest")?.value === "1";

  // Rotta protetta senza sessione né cookie guest → onboarding
  if (isProtetta && !user && !isGuest) {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  // Utente autenticato sulla landing → home
  if (pathname === "/onboarding" && user) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|icons|manifest|sw\\.js|.*\\.svg$).*)",
  ],
};
