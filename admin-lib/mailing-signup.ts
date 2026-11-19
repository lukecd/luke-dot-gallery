export function validateMailingSignup(value: unknown): { email: string; name: string; consentVersion: string; website: string } | null {
  if (!value || typeof value !== "object") return null;
  const input = value as Record<string, unknown>;
  if (typeof input.email !== "string" || input.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim()) || input.consent !== true || typeof input.consentVersion !== "string" || input.consentVersion.length > 120) return null;
  if (input.name !== undefined && (typeof input.name !== "string" || input.name.length > 100)) return null;
  return { email: input.email.trim().toLowerCase(), name: (input.name as string | undefined)?.trim() ?? "", consentVersion: input.consentVersion, website: typeof input.website === "string" ? input.website : "" };
}
