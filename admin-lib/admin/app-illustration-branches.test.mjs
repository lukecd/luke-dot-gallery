import assert from 'node:assert/strict';
import test from 'node:test';
import { canCreateHandoffBranch, illustrationBatchBranch, illustrationBranch } from '../admin/app-illustration-branches.ts';

test('new illustration handoffs use approved branch prefixes', () => {
  assert.equal(illustrationBranch('echium-wildpretii', '12345678-abcd'), 'feat/garden-desk/echium-wildpretii-12345678');
  assert.equal(illustrationBatchBranch('abcdef12-1234'), 'feat/garden-desk/batch-abcdef12');
  assert.equal(canCreateHandoffBranch('garden-desk/old-branch'), false);
  assert.equal(canCreateHandoffBranch('feat/garden-desk/example'), true);
  assert.equal(canCreateHandoffBranch('fix/garden-desk/example'), true);
});
