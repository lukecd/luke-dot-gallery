import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
const source = readFileSync(new URL('../../app/api/admin/app-messages/route.ts', import.meta.url), 'utf8');
const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
function route({ denied = false, enabled = true } = {}) {
  const exports = {}; const filters = [];
  class AccessError extends Error { constructor() { super('Denied'); this.status = 401; } }
  const query = { select() { return this; }, eq(key, value) { filters.push([key, value]); return this; }, async order() { return { data: [], error: null }; } };
  runInNewContext(code, { exports, URL, require(id) {
    if (id === 'next/server') return { NextResponse: Response };
    if (id === '@/admin-lib/admin/auth') return { GardenDeskAccessError: AccessError, requireGardenDeskApiAdmin: async () => { if (denied) throw new AccessError(); } };
    if (id === '@/admin-lib/admin/apps') return { getAdminApp: async () => enabled ? { id: 'ramble-id', features: ['feedback'] } : null };
    if (id === '@/admin-lib/admin/app-model') return { hasFeature: (app, feature) => app.features.includes(feature) };
    if (id === '@/admin-lib/supabase/service') return { createSupabaseServiceClient: () => ({ from: () => query }) };
    throw Error(`Unexpected import ${id}`);
  } });
  return { get: exports.GET, filters };
}
const req = (app) => new Request(`https://luke.gallery/api/admin/app-messages?app=${app}`);
test('messages require an authorized admin and enabled Ramble app', async () => {
  assert.equal((await route({ denied: true }).get(req('ramble-patch'))).status, 401);
  assert.equal((await route({ enabled: false }).get(req('ramble-patch'))).status, 404);
  assert.equal((await route().get(req('sow'))).status, 404);
});
test('message query is limited to the selected app', async () => {
  const { get, filters } = route(); assert.equal((await get(req('ramble-patch'))).status, 200);
  assert.deepEqual(filters, [['app_id', 'ramble-id']]);
});
