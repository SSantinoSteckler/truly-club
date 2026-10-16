import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const requestedNext = url.searchParams.get("next") || "/dashboard";
  const next = requestedNext.startsWith("/") ? requestedNext : "/dashboard";
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, url.origin));
  }
  const roomMatch = next.match(/^\/r\/([a-z0-9-]+)(?:\/|$)/);
  const errorPath = roomMatch ? `/r/${roomMatch[1]}/auth?error=auth_callback` : "/login?error=auth_callback";
  return NextResponse.redirect(new URL(errorPath, url.origin));
}
