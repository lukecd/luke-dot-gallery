import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
const source = readFileSync(new URL('../../app/api/contact/route.ts', import.meta.url), 'utf8');
const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
function route() {
  const exports = {}; let sowCalls = 0;
  runInNewContext(code, { exports, Response, process: { env: {} }, console, fetch, require(id) {
    if (id === 'next/server') return { NextResponse: Response };
    if (id === '@/admin-lib/sow-contact-handler') return { handleSowContact: async () => { sowCalls++; return Response.json({ ok: true }); } };
    throw Error(`Unexpected import ${id}`);
  } });
  return { post: exports.POST, getSowCalls: () => sowCalls };
}
test('multipart requests reach Sow and the existing JSON route keeps its validation', async () => {
  const { post, getSowCalls } = route();
  const form = new FormData(); form.set('reason', 'feedback');
  assert.equal((await post(new Request('https://luke.gallery/api/contact', { method: 'POST', body: form }))).status, 200);
  assert.equal(getSowCalls(), 1);
  assert.equal((await post(new Request('https://luke.gallery/api/contact', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' }))).status, 400);
  assert.equal(getSowCalls(), 1);
});
