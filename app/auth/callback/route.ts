import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

import { createSupabaseServiceClient } from "@/admin-lib/supabase/service";

function safeNext(value: string | null) {
  return value?.startsWith("/admin") ? value : "/admin";
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type");
  const next = safeNext(requestUrl.searchParams.get("next"));
  const response = NextResponse.redirect(new URL(next, requestUrl.origin));
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if ((!code && !(tokenHash && type === "magiclink")) || !url || !key) {
    return NextResponse.redirect(new URL("/admin/login?error=expired-link", requestUrl.origin));
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.headers
          .get("cookie")
          ?.split(";")
          .map((part) => {
            const [name, ...rest] = part.trim().split("=");
            return { name, value: rest.join("=") };
          }) ?? [];
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const { data, error } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : await supabase.auth.verifyOtp({ token_hash: tokenHash!, type: "magiclink" });
  const allowedEmail = process.env.SOW_ADMIN_EMAIL?.trim().toLowerCase();
  const email = data.user?.email?.toLowerCase();

  if (error || !data.user || !allowedEmail || email !== allowedEmail) {
    return NextResponse.redirect(new URL("/admin/login?error=not-authorized", requestUrl.origin));
  }

  const service = createSupabaseServiceClient();
  const { error: profileError } = await service
    .from("desk_admin_profiles")
    .upsert({ user_id: data.user.id, role: "owner" }, { onConflict: "user_id" });

  if (profileError) {
    return NextResponse.redirect(new URL("/admin/login?error=setup", requestUrl.origin));
  }

  return response;
}
