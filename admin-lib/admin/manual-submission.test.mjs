import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
import sharp from 'sharp';

// Exercise the actual route with isolated auth/storage adapters; never use live data.
const require = createRequire(import.meta.url);
const source = readFileSync(new URL('../../app/api/admin/submissions/route.ts', import.meta.url), 'utf8');
const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true } }).outputText;
function route(options = {}) {
  const calls = [];
  const service = {
    from(table) {
      const query = {
        upsert() { return query; },
        insert(value) { calls.push({ table, value }); return query; },
        select() { return query; },
        async single() {
          if (table === 'desk_people') return { data: { id: 'person', email: 'tester@example.com', display_name: 'Test' } };
          if (table === 'desk_submissions') return { data: { id: 'report', kind: 'bug_report', status: 'new' } };
          return options.attachmentError ? { error: new Error('attachment failed') } : { data: { id: 'attachment' } };
        },
      };
      return query;
    },
    storage: { from() { return {
      async upload(path, bytes, config) { calls.push({ upload: path, bytes, config }); return { error: options.uploadError ? new Error('upload failed') : null }; },
      async remove(paths) { calls.push({ remove: paths }); return {}; },
    }; } },
  };
  class GardenDeskAccessError extends Error { status = 403; }
  const exports = {};
  runInNewContext(code, { exports, Buffer, File, crypto, require(id) {
    if (id === 'next/server') return { NextResponse: Response };
    if (id === '@/admin-lib/admin/auth') return { GardenDeskAccessError, async requireGardenDeskApiAdmin(feature) { assert.equal(feature, 'feedback'); if (options.denied) throw new GardenDeskAccessError('Denied'); return { user: { id: 'admin', email: 'tester@example.com' } }; } };
    if (id === '@/admin-lib/supabase/service') return { createSupabaseServiceClient: () => service };
    if (id === '@/admin-lib/admin/submissions') return { isDeskSubmissionType: () => true };
    if (id === '@/admin-lib/admin/submission-attachments') return { serializeSubmissionAttachments: async () => { if (options.previewThrows) throw new Error("preview failed"); return options.previewError ? [] : [{ id: 'attachment', signedUrl: 'https://example.test/private' }]; } };
    return require(id);
  } });
  return { post: exports.POST, calls };
}
async function multipart({ type = 'bug_report', image = null } = {}) {
  const body = new FormData();
  body.set('type', type); body.set('title', 'Example'); body.set('message', 'Details');
  if (image) body.set('image', image);
  return new Request('http://localhost/api/admin/submissions', { method: 'POST', body });
}
const png = await sharp({ create: { width: 4, height: 4, channels: 3, background: '#3d5939' } }).png().toBuffer();
const screenshot = () => new File([png], 'example.png', { type: 'image/png' });
test('existing JSON clients can create reports without a screenshot', async () => {
  const r = route();
  const response = await r.post(new Request('http://localhost/api/admin/submissions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'feature_request', title: 'Idea', message: 'Details' }) }));
  assert.equal(response.status, 201); assert.equal(r.calls[0].value.kind, 'feature_request');
});
test('feedback permission is checked before processing an upload', async () => {
  const r = route({ denied: true }); assert.equal((await r.post(await multipart({ image: screenshot() }))).status, 403); assert.equal(r.calls.length, 0);
});
test('screenshots are decoded and stored as private JPEG attachments', async () => {
  const r = route(); const response = await r.post(await multipart({ image: screenshot() }));
  assert.equal(response.status, 201); assert.equal((await response.json()).submission.attachments.length, 1);
  const upload = r.calls.find(c => c.upload); assert.equal(upload.config.contentType, 'image/jpeg');
  assert.equal((await sharp(upload.bytes).metadata()).format, 'jpeg');
});
test('invalid, oversized, non-raster and feature-request attachments create no report', async () => {
  for (const input of [
    { type: 'feature_request', image: screenshot() },
    { image: new File(['not an image'], 'fake.jpg', { type: 'image/jpeg' }) },
    { image: new File(['<svg/>'], 'vector.svg', { type: 'image/svg+xml' }) },
    { image: new File([new Uint8Array(500001)], 'large.jpg', { type: 'image/jpeg' }) },
  ]) { const r = route(); assert.equal((await r.post(await multipart(input))).status, 400); assert.equal(r.calls.length, 0); }
});
test('upload failure returns the saved report with a warning, avoiding duplicate retries', async () => {
  const r = route({ uploadError: true }); const response = await r.post(await multipart({ image: screenshot() }));
  assert.equal(response.status, 201); assert.match((await response.json()).warning, /report saved/i); assert.equal(r.calls.filter(c => c.table === 'desk_submissions').length, 1);
});
test('attachment-row failure cleans the uploaded object and reports partial success', async () => {
  const r = route({ attachmentError: true }); const response = await r.post(await multipart({ image: screenshot() }));
  assert.equal(response.status, 201); assert.match((await response.json()).warning, /could not be attached/); assert.ok(r.calls.some(c => c.remove));
});
test('unavailable signed preview is distinguished from a failed attachment', async () => {
  const r = route({ previewError: true }); const response = await r.post(await multipart({ image: screenshot() }));
  assert.match((await response.json()).warning, /preview is temporarily unavailable/); assert.ok(!r.calls.some(c => c.remove));
});
test('malformed JSON is rejected without writes', async () => {
  const r = route(); const response = await r.post(new Request('http://localhost/api/admin/submissions', { method: 'POST', body: '{' }));
  assert.equal(response.status, 400); assert.equal(r.calls.length, 0);
});

test('throwing preview service does not misreport a saved attachment', async () => {
  const r = route({ previewThrows: true }); const response = await r.post(await multipart({ image: screenshot() }));
  assert.equal(response.status, 201); assert.match((await response.json()).warning, /preview is temporarily unavailable/);
  assert.ok(!r.calls.some(c => c.remove));
});
