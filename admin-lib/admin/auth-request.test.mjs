import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

const require = createRequire(import.meta.url);
const source = readFileSync(new URL('../../app/api/admin/auth/request/route.ts', import.meta.url), 'utf8');
const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true } }).outputText;

function makeRoute({ linkError = null, emailStatus = 200 } = {}) {
  const sent = [];
  const generated = [];
  const errors = [];
  const exports = {};
  const env = { SOW_ADMIN_EMAIL: 'owner@example.test', RESEND_API_KEY: 'test-key', CONTACT_FROM_EMAIL: 'sender@example.test' };
  runInNewContext(code, { exports, URL, process: { env }, console: { error: (...values) => errors.push(values) }, fetch: async (_url, options) => {
    sent.push(JSON.parse(options.body));
    return { ok: emailStatus === 200, status: emailStatus };
  }, require(id) {
    if (id === 'next/server') return { NextResponse: Response };
    if (id === '@/app/lib/site') return { site: { url: 'https://luke.gallery' } };
    if (id === '@/admin-lib/supabase/service') return { createSupabaseServiceClient: () => ({ auth: { admin: { async generateLink(input) {
      generated.push(input);
      if (linkError) return { data: null, error: linkError };
      return { data: { properties: { hashed_token: 'test-hash', verification_type: 'magiclink' } } };
    } } } }) };
    return require(id);
  } });
  return { post: exports.POST, sent, generated, errors };
}

test('admin sign-in links use the canonical portfolio origin, not a supplied host', async () => {
  const { post, sent, generated } = makeRoute();
  const response = await post(new Request('https://attacker.example/api/admin/auth/request', { method: 'POST', body: JSON.stringify({ email: 'owner@example.test' }) }));
  assert.equal(response.status, 200);
  assert.equal(generated[0].options.redirectTo, 'https://luke.gallery/auth/callback?next=/admin');
  assert.match(sent[0].text, /https:\/\/luke\.gallery\/auth\/callback\?/);
  assert.doesNotMatch(sent[0].text, /attacker\.example/);
});

test('local sign-in links use the local preview and unknown owners get a neutral response', async () => {
  const { post, sent } = makeRoute();
  await post(new Request('http://127.0.0.1:3135/api/admin/auth/request', { method: 'POST', body: JSON.stringify({ email: 'owner@example.test' }) }));
  assert.match(sent[0].text, /http:\/\/127\.0\.0\.1:3135\/auth\/callback\?/);
  const response = await post(new Request('https://luke.gallery/api/admin/auth/request', { method: 'POST', body: JSON.stringify({ email: 'other@example.test' }) }));
  assert.equal(response.status, 200);
  assert.equal(sent.length, 1);
});

test('sign-in diagnostics distinguish link and email failures without logging sensitive data', async () => {
  const request = () => new Request('https://luke.gallery/api/admin/auth/request', { method: 'POST', body: JSON.stringify({ email: 'owner@example.test' }) });
  const linkFailure = makeRoute({ linkError: { status: 403, code: 'link_denied', message: 'private detail' } });
  assert.equal((await linkFailure.post(request())).status, 500);
  assert.match(JSON.stringify(linkFailure.errors), /link generation failed/);
  assert.doesNotMatch(JSON.stringify(linkFailure.errors), /private detail|owner@example.test|test-key/);
  const emailFailure = makeRoute({ emailStatus: 403 });
  assert.equal((await emailFailure.post(request())).status, 500);
  assert.match(JSON.stringify(emailFailure.errors), /email provider rejected/);
  assert.doesNotMatch(JSON.stringify(emailFailure.errors), /owner@example.test|test-key|test-hash/);
});
