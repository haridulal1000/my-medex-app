import rawJson from '../../data/task1-service-explorer.json';
import type { z } from 'zod';
import {
  CategoryWithChildrenSchema,
  ProviderSchema,
  ServiceSchema,
} from '../api/schemas';

const raw = rawJson as unknown as Record<string, unknown>;

const ensureArray = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);

/**
 * Parse each record independently. A single bad record should never blank
 * the whole page — it should be dropped and logged so we can see the data
 * problem. The rest of the catalogue stays usable.
 */
function parseArraySafe<T>(
  items: unknown[],
  schema: z.ZodType<T>,
  label: string,
): T[] {
  const valid: T[] = [];
  const invalid: { index: number; error: z.ZodError }[] = [];
  items.forEach((item, i) => {
    const result = schema.safeParse(item);
    if (result.success) valid.push(result.data);
    else invalid.push({ index: i, error: result.error });
  });
  if (invalid.length > 0) {
    // Logged once, not per-keystroke. Visible in DevTools console for debugging.
    console.warn(
      `[mocks/data] ${invalid.length} invalid ${label} dropped`,
      invalid.slice(0, 3),
    );
  }
  return valid;
}

export const categories = parseArraySafe(
  ensureArray(raw.categories),
  CategoryWithChildrenSchema,
  'categories',
);

export const providers = parseArraySafe(
  ensureArray(raw.providers),
  ProviderSchema,
  'providers',
);

export const services = parseArraySafe(
  ensureArray(raw.services),
  ServiceSchema,
  'services',
);

if (import.meta.env.DEV) {
  console.info(
    `[mocks/data] loaded ${categories.length} categories, ` +
      `${providers.length} providers, ${services.length} services`,
  );
}