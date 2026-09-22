import { Prisma } from '@prisma/client';
import { toIso, toNum } from '../common/utils/serialize';

export type Details = {
  completed?: boolean;
  completedAt?: string;
  [key: string]: unknown;
};

export function readDetails(raw: unknown): Details {
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    return { ...(raw as Details) };
  }
  return {};
}

export function isCompleted(raw: unknown): boolean {
  return readDetails(raw).completed === true;
}

export function parseImages(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.map(String).filter(Boolean);
  }
  return [];
}

export function tripPhase(
  start: Date | null | undefined,
  end: Date | null | undefined,
  now = new Date(),
): 'before' | 'during' | 'after' | 'unknown' {
  if (!start && !end) return 'unknown';
  if (end && now > end) return 'after';
  if (start && now < start) return 'before';
  return 'during';
}

export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const r = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * r * Math.asin(Math.sqrt(a));
}

export function toPlainItem(item: {
  id: bigint;
  sortOrder: number;
  type: string | null;
  timeSlot: number | null;
  exactStartTime: Date | null;
  exactEndTime: Date | null;
  name: string | null;
  photoUrl: string | null;
  latitude: Prisma.Decimal | null;
  longitude: Prisma.Decimal | null;
  poiId: bigint | null;
  details: Prisma.JsonValue;
  poi?: {
    id: bigint;
    name: string;
    coverUrl: string | null;
    imagesJson: Prisma.JsonValue;
    address: string | null;
    category: string;
  } | null;
}) {
  const details = readDetails(item.details);
  const cover = item.photoUrl || item.poi?.coverUrl || null;
  return {
    id: toNum(item.id),
    sortOrder: item.sortOrder,
    type: item.type,
    timeSlot: item.timeSlot,
    exactStartTime: toIso(item.exactStartTime),
    exactEndTime: toIso(item.exactEndTime),
    name: item.name,
    photoUrl: cover,
    images: parseImages(item.poi?.imagesJson),
    latitude: item.latitude == null ? null : Number(item.latitude),
    longitude: item.longitude == null ? null : Number(item.longitude),
    poiId: toNum(item.poiId),
    poiName: item.poi?.name ?? null,
    poiAddress: item.poi?.address ?? null,
    poiCategory: item.poi?.category ?? null,
    completed: details.completed === true,
    completedAt: details.completedAt ?? null,
    details,
  };
}
