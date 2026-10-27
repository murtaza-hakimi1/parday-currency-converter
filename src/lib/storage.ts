import { z } from "zod";

export function readStorage<T>(
  key: string,
  schema: z.ZodType<T>,
  fallback: T,
): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed: unknown = JSON.parse(raw);
    const result = schema.safeParse(parsed);
    return result.success ? result.data : fallback;
  } catch {
    return fallback;
  }
}

export function writeStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be unavailable or full; the app remains usable for this session.
  }
}

export const favoriteSchema = z.array(
  z.object({
    id: z.string(),
    from: z.string().length(3),
    to: z.string().length(3),
    label: z.string().optional(),
  }),
);
export const historySchema = z.array(
  z.object({
    id: z.string(),
    amount: z.number().nonnegative(),
    from: z.string().length(3),
    to: z.string().length(3),
    rate: z.number().positive(),
    result: z.number().nonnegative(),
    rateDate: z.string(),
    createdAt: z.string(),
    provider: z.string(),
  }),
);
export const alertSchema = z.array(
  z.object({
    id: z.string(),
    base: z.string().length(3),
    quote: z.string().length(3),
    condition: z.enum(["above", "below"]),
    targetRate: z.number().positive(),
    enabled: z.boolean(),
    lastTriggeredAt: z.string().optional(),
  }),
);
