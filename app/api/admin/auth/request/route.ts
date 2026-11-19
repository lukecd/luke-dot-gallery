import { NextResponse } from "next/server";

import { createSupabaseServiceClient } from "@/admin-lib/supabase/service";
import { site } from "@/app/lib/site";

function ownerEmail() {
  return process.env.SOW_ADMIN_EMAIL?.trim().toLowerCase();
}

function callbackOrigin(request: Request) {
  const url = new URL(request.url);
  const isLocalLoopback =
    url.protocol === "http:" &&
    (url.hostname === "localhost" || url.hostname === "127.0.0.1" || url.hostname === "::1");

  return isLocalLoopback ? url.origin : site.url;
}

function signInEmail({ callbackUrl }: { callbackUrl: string }) {
  return {
    subject: "Sign in to Garden Desk",
    text: [
      "Sign in to Garden Desk",
      "",
      "Use this one-time link to open Sow’s private workspace:",
      callbackUrl,
      "",
      "This link expires in one hour. If you did not request it, you can safely ignore this email.",
    ].join("\n"),
    html: `<h2>Sign in to Garden Desk</h2><p>Use this one-time link to open Sow’s private workspace.</p><p><a href="${callbackUrl}">Sign in to Garden Desk</a></p><p>This link expires in one hour. If you did not request it, you can safely ignore this email.</p>`,
  };
}

export async function POST(request: Request) {
  const { email } = await request.json().catch(() => ({ email: "" }));
  const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
  const allowedEmail = ownerEmail();

  // Keep the response intentionally neutral: this endpoint must not reveal
  // whether an address is approved for the private Garden Desk.
  if (!allowedEmail || normalizedEmail !== allowedEmail) {
    return NextResponse.json({ ok: true });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL;
  const replyTo = process.env.CONTACT_REPLY_TO?.trim();
  if (!apiKey || !from) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  const service = createSupabaseServiceClient();
  const origin = callbackOrigin(request);
  const redirectTo = new URL("/auth/callback?next=/admin", origin).toString();
  const { data, error } = await service.auth.admin.generateLink({
    type: "magiclink",
    email: normalizedEmail,
    options: { redirectTo },
  });

  if (error || !data) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  const callbackUrl = new URL("/auth/callback", origin);
  callbackUrl.searchParams.set("next", "/admin");
  callbackUrl.searchParams.set("token_hash", data.properties.hashed_token);
  callbackUrl.searchParams.set("type", data.properties.verification_type);
  const message = signInEmail({ callbackUrl: callbackUrl.toString() });

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: normalizedEmail,
      ...(replyTo ? { reply_to: replyTo } : {}),
      ...message,
    }),
  });

  if (!response.ok) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
