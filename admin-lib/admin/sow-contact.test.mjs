import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

const source = readFileSync(new URL('../sow-contact-handler.ts', import.meta.url), 'utf8');
const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true } }).outputText;
function handler() {
  const writes = [];
  const subscriptions = [];
  const query = (table) => ({
    upsert(value) { writes.push({ table, method: 'upsert', value }); return this; },
    update(value) { writes.push({ table, method: 'update', value }); return this; },
    insert(value) { writes.push({ table, method: 'insert', value }); return this; },
    select() { return this; }, eq() { return this; }, limit() { return this; },
    async single() { return { data: { id: table === 'desk_people' ? 'person' : 'submission' } }; },
    async maybeSingle() { return { data: null }; },
    then(resolve) { return Promise.resolve({ error: null }).then(resolve); },
  });
  const exports = {};
  runInNewContext(code, { exports, Response, Request, FormData, File, TextEncoder, Uint8Array, Buffer, crypto, process: { env: {} }, fetch: async () => ({ ok: true }), require(id) {
    if (id === 'next/server') return { NextResponse: Response };
    if (id === '@/admin-lib/sow-contact') return { CONTACT_EMAIL: 'luke@example.test', MARKETING_CONSENT_COPY_VERSION: 'sow-creator-updates-v1', formatContactEmail: () => ({ subject: '', text: '' }) };
    if (id === '@/admin-lib/supabase/service') return { createSupabaseServiceClient: () => ({ from: query }), isSupabaseServiceConfigured: () => true };
    if (id === '@/admin-lib/admin/mailing-lists') return { subscribeToMailingList: async (input) => { subscriptions.push(input); } };
    throw Error(`Unexpected import ${id}`);
  } });
  return { post: exports.handleSowContact, writes, subscriptions };
}
function request(fields) {
  const form = new FormData();
  for (const [key, value] of Object.entries(fields)) form.set(key, value);
  return new Request('https://luke.gallery/api/contact', { method: 'POST', body: form });
}
const feedback = { reason: 'feedback', email: 'test@example.invalid', message: 'Test feedback' };
test('blank and omitted names never overwrite the saved name', async () => {
  for (const name of [undefined, '', '  ']) {
    const { post, writes } = handler();
    const result = await post(request({ ...feedback, ...(name === undefined ? {} : { name }) }));
    assert.equal(result.status, 200); assert.equal((await result.json()).ok, true);
    assert.equal(writes.some((w) => w.table === 'desk_people' && Object.hasOwn(w.value, 'display_name')), false);
  }
});
test('newsletter consent is required and must match the displayed version', async () => {
  const { post, subscriptions } = handler();
  const base = { reason: 'updates', email: 'test@example.invalid' };
  assert.equal((await post(request(base))).status, 400);
  assert.equal((await post(request({ ...base, updatesOptIn: 'true', marketingConsentVersion: 'old' }))).status, 400);
  const success = await post(request({ ...base, updatesOptIn: 'true', marketingConsentVersion: 'sow-creator-updates-v1' }));
  assert.equal(success.status, 200); assert.equal(subscriptions.length, 1);
});
test('message-only feedback does not subscribe and malformed multipart is rejected', async () => {
  const { post, subscriptions } = handler();
  assert.equal((await post(request(feedback))).status, 200); assert.equal(subscriptions.length, 0);
  assert.equal((await post(new Request('https://luke.gallery/api/contact', { method: 'POST', headers: { 'content-type': 'multipart/form-data' }, body: 'bad' }))).status, 400);
});
