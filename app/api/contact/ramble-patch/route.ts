import { NextResponse } from "next/server";
import { mailingSignupCorsHeaders } from "@/admin-lib/mailing-signup-origins";
import { createSupabaseServiceClient } from "@/admin-lib/supabase/service";

const MAX_BYTES = 8192;
const denied = () => NextResponse.json({ error: "Use the Ramble Patch website to send a message." }, { status: 403, headers: { Vary: "Origin", "Cache-Control": "no-store" } });

export async function OPTIONS(request: Request) {
  const headers = mailingSignupCorsHeaders(request, "ramble-patch", process.env.NODE_ENV);
  const requested = (request.headers.get("access-control-request-headers") ?? "").split(",").map((value) => value.trim().toLowerCase()).filter(Boolean);
  if (!headers || request.headers.get("access-control-request-method") !== "POST" || requested.some((value) => value !== "content-type")) return denied();
  headers.set("Access-Control-Allow-Methods", "POST");
  headers.set("Access-Control-Allow-Headers", "Content-Type");
  headers.set("Allow", "POST, OPTIONS");
  return new NextResponse(null, { status: 204, headers });
}

export async function POST(request: Request) {
  const headers = mailingSignupCorsHeaders(request, "ramble-patch", process.env.NODE_ENV);
  if (!headers) return denied();
  const reply = (body: { ok: true } | { error: string }, status = 200) => NextResponse.json(body, { status, headers });
  if (request.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase() !== "application/json") return reply({ error: "Send message details as JSON." }, 415);
  if (Number(request.headers.get("content-length") ?? 0) > MAX_BYTES) return reply({ error: "Request too large." }, 413);
  let value: unknown;
  try {
    const reader = request.body?.getReader();
    if (!reader) throw new Error("Missing body");
    const chunks: Uint8Array[] = []; let length = 0;
    while (true) {
      const part = await reader.read();
      if (part.done) break;
      length += part.value.byteLength;
      if (length > MAX_BYTES) { await reader.cancel(); return reply({ error: "Request too large." }, 413); }
      chunks.push(part.value);
    }
    const bytes = new Uint8Array(length); let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    value = JSON.parse(new TextDecoder().decode(bytes));
  } catch { return reply({ error: "Invalid message." }, 400); }
  if (!value || typeof value !== "object" || Array.isArray(value)) return reply({ error: "Invalid message." }, 400);
  const input = value as Record<string, unknown>;
  if (typeof input.website === "string" && input.website.trim()) return reply({ ok: true });
  const name = typeof input.name === "string" ? input.name.trim() : "";
  const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
  const message = typeof input.message === "string" ? input.message.trim() : "";
  if (name.length > 100 || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !message || message.length > 5000) return reply({ error: "Enter a valid email and message." }, 400);
  try {
    const { error } = await createSupabaseServiceClient().rpc("desk_add_app_message", { p_app_slug: "ramble-patch", p_email: email, p_name: name, p_message: message });
    if (error) throw error;
    return reply({ ok: true });
  } catch { return reply({ error: "We could not save your message. Please try again." }, 503); }
}
