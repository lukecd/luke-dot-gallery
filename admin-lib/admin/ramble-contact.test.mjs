import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
const source = readFileSync(new URL('../../app/api/contact/ramble-patch/route.ts', import.meta.url), 'utf8');
const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
function route({ fail = false } = {}) {
  const exports = {}; const calls = [];
  runInNewContext(code, { exports, Response, Headers, Uint8Array, TextDecoder, process: { env: { NODE_ENV: 'production' } }, require(id) {
    if (id === 'next/server') return { NextResponse: Response };
    if (id === '@/admin-lib/mailing-signup-origins') return { mailingSignupCorsHeaders: (request) => request.headers.get('origin') === 'https://www.ramblepatch.com' ? new Headers({ 'Access-Control-Allow-Origin': 'https://www.ramblepatch.com' }) : null };
    if (id === '@/admin-lib/supabase/service') return { createSupabaseServiceClient: () => ({ rpc: async (name, value) => { calls.push({ name, value }); return { error: fail ? new Error('failed') : null }; } }) };
    throw Error(`Unexpected import ${id}`);
  } });
  return { ...exports, calls };
}
function request(body, origin = 'https://www.ramblepatch.com') {
  return new Request('https://luke.gallery/api/contact/ramble-patch', { method: 'POST', headers: { origin, 'content-type': 'application/json' }, body: JSON.stringify(body) });
}
const message = { name: '', email: 'Person@Example.invalid', message: 'A message', website: '' };
test('Ramble messages are saved to the app without implicit subscription', async () => {
  const { POST, calls } = route(); const response = await POST(request(message));
  assert.equal(response.status, 200); assert.equal((await response.json()).ok, true);
  assert.equal(calls.length, 1); assert.equal(calls[0].name, 'desk_add_app_message');
  assert.equal(calls[0].value.p_app_slug, 'ramble-patch'); assert.equal(calls[0].value.p_name, '');
  assert.equal(calls[0].value.p_email, 'person@example.invalid');
});
test('rejects invalid or unapproved input and silently discards honeypots', async () => {
  const { POST, calls } = route();
  assert.equal((await POST(request(message, 'https://other.example'))).status, 403);
  assert.equal((await POST(request({ ...message, email: 'bad' }))).status, 400);
  assert.equal((await POST(request({ ...message, message: '' }))).status, 400);
  assert.equal((await POST(request({ ...message, message: 'a'.repeat(9000) }))).status, 413);
  assert.equal((await POST(request({ ...message, website: 'bot.example' }))).status, 200);
  assert.equal(calls.length, 0);
});
test('database errors do not report success', async () => {
  const response = await route({ fail: true }).POST(request(message));
  assert.equal(response.status, 503); assert.equal((await response.json()).ok, undefined);
});
test('preflight permits only the Ramble origin, POST and content-type', async () => {
  const { OPTIONS } = route();
  const req = (origin, method) => new Request('https://luke.gallery/api/contact/ramble-patch', { method: 'OPTIONS', headers: { origin, 'access-control-request-method': method, 'access-control-request-headers': 'content-type' } });
  assert.equal((await OPTIONS(req('https://www.ramblepatch.com', 'POST'))).status, 204);
  assert.equal((await OPTIONS(req('https://www.ramblepatch.com', 'DELETE'))).status, 403);
  assert.equal((await OPTIONS(req('https://other.example', 'POST'))).status, 403);
});
