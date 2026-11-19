import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

const source = readFileSync(new URL('../../app/api/internal/plant-generation/route.ts', import.meta.url), 'utf8');
const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;

function route(enabled) {
  const exports = {};
  let calls = 0;
  runInNewContext(code, { exports, process: { env: { CRON_SECRET: 'test-secret', PLANT_WORKER_ENABLED: enabled } }, require(id) {
    if (id === 'next/server') return { NextResponse: Response };
    if (id === '@/admin-lib/admin/workflows') return { runNextPlantGeneration: async () => { calls++; return { processed: true }; } };
    throw new Error(`Unexpected import ${id}`);
  } });
  return { GET: exports.GET, calls: () => calls };
}

test('the scheduled worker remains in standby until explicitly enabled', async () => {
  const worker = route(undefined);
  const response = await worker.GET(new Request('https://example.test', { headers: { authorization: 'Bearer test-secret' } }));
  assert.equal(response.status, 200);
  assert.equal((await response.json()).enabled, false);
  assert.equal(worker.calls(), 0);
});

test('only an authenticated request can run an enabled worker', async () => {
  const worker = route('true');
  assert.equal((await worker.GET(new Request('https://example.test'))).status, 401);
  assert.equal(worker.calls(), 0);
  const response = await worker.GET(new Request('https://example.test', { headers: { authorization: 'Bearer test-secret' } }));
  assert.equal((await response.json()).processed, true);
  assert.equal(worker.calls(), 1);
});
