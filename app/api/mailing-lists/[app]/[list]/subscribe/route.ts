import { NextResponse } from "next/server";
import { subscribeToMailingList } from "@/admin-lib/admin/mailing-lists";
import { validateMailingSignup } from "@/admin-lib/mailing-signup";
import { mailingSignupCorsHeaders } from "@/admin-lib/mailing-signup-origins";

type SignupContext = { params: Promise<{ app: string; list: string }> };
const denied = () => NextResponse.json({ error: "Use this app's signup form to subscribe." }, { status: 403, headers: { Vary: "Origin", "Cache-Control": "no-store" } });

export async function OPTIONS(request: Request, context: SignupContext) {
  const { app } = await context.params;
  const headers = mailingSignupCorsHeaders(request, app, process.env.NODE_ENV);
  const method = request.headers.get("access-control-request-method");
  const requestedHeaders = (request.headers.get("access-control-request-headers") ?? "").split(",").map((header) => header.trim().toLowerCase()).filter(Boolean);
  if (!headers || method !== "POST" || requestedHeaders.some((header) => header !== "content-type")) return denied();
  headers.set("Access-Control-Allow-Methods", "POST");
  headers.set("Access-Control-Allow-Headers", "Content-Type");
  headers.set("Allow", "POST, OPTIONS");
  return new NextResponse(null, { status: 204, headers });
}

export async function POST(request: Request, context: SignupContext) {
  const { app, list } = await context.params;
  const headers = mailingSignupCorsHeaders(request, app, process.env.NODE_ENV);
  if (!headers) return denied();
  const reply = (body: { ok: true } | { error: string }, status = 200) => NextResponse.json(body, { status, headers });
  if (request.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase() !== "application/json") return reply({ error: "Send signup details as JSON." }, 415);
  if (Number(request.headers.get("content-length") ?? 0) > 4096) return reply({ error: "Request too large." }, 413);
  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > 4096) return reply({ error: "Request too large." }, 413);
  let raw: unknown;
  try { raw = JSON.parse(text); } catch { return reply({ error: "Invalid signup." }, 400); }
  const input = validateMailingSignup(raw);
  if (!input) return reply({ error: "Enter your email and agree to the mailing-list wording." }, 400);
  if (input.website) return reply({ ok: true });
  try {
    const source = request.headers.get("origin") === new URL(request.url).origin ? "hosted-signup" : "website-signup";
    await subscribeToMailingList({ appSlug: app, listSlug: list, email: input.email, name: input.name, source, consentCopyVersion: input.consentVersion });
    return reply({ ok: true });
  } catch {
    return reply({ error: "We could not save your signup. Please reload this page and try again." }, 503);
  }
}
