export function illustrationBranch(key: string, id: string) {
  return `feat/garden-desk/${key}-${id.slice(0, 8)}`;
}

export function illustrationBatchBranch(id: string) {
  return `feat/garden-desk/batch-${id.slice(0, 8)}`;
}

export function canCreateHandoffBranch(branch: string) {
  return /^(feat|fix)\/.+/.test(branch);
}
