import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/onboarding?error=missing_code", origin));
  }

  // La response viene costruita prima così possiamo scriverci i cookie della sessione
  const response = NextResponse.redirect(new URL("/home", origin));

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !session) {
    return NextResponse.redirect(new URL("/onboarding?error=auth", origin));
  }

  const user = session.user;
  const meta = user.user_metadata ?? {};

  // Crea profilo solo se non esiste ancora (nuovo utente)
  const { data: existing } = await supabase
    .from("users")
    .select("id")
    .eq("id", user.id)
    .single();

  if (!existing) {
    await supabase.from("users").insert({
      id: user.id,
      nome: meta.nome ?? "Utente",
      telefono: meta.telefono ?? null,
      email: user.email ?? null,
      canale_notifica: meta.canale_notifica ?? "email",
      orario_notifica: meta.orario_notifica ?? "09:00",
      consenso_notifiche: meta.consenso_notifiche ?? false,
      current_streak: 0,
      last_activity_date: null,
    });

    const categorie = ["memoria", "attenzione", "linguaggio", "esecutive", "visuospaziali"];
    await supabase.from("user_levels").insert(
      categorie.map((cat) => ({
        user_id: user.id,
        categoria_id: cat,
        livello_corrente: 1,
      }))
    );
  }

  return response;
}
