/** Convert Prisma BigInt fields to JSON-safe numbers. */
export function toNum(value: bigint | number | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  return typeof value === 'bigint' ? Number(value) : value;
}

export function parseTags(tagsJson: unknown): string[] {
  if (Array.isArray(tagsJson)) {
    return tagsJson.map(String);
  }
  return [];
}

export function toIso(date: Date | null | undefined): string | null {
  if (!date) return null;
  return date.toISOString();
}
