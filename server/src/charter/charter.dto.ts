export type CharterSort = 'recommend' | 'priceAsc' | 'soldDesc';

export const CHARTER_TRIP_TYPES = ['半日游', '1日游', '2日游'] as const;
export const CHARTER_SORTS: CharterSort[] = [
  'recommend',
  'priceAsc',
  'soldDesc',
];
