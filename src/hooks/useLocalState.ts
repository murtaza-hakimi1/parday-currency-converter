import { useEffect, useState } from "react";
import { readStorage, writeStorage } from "../lib/storage";
import type { z } from "zod";

export function useLocalState<T>(
  key: string,
  schema: z.ZodType<T>,
  fallback: T,
) {
  const [value, setValue] = useState<T>(() =>
    readStorage(key, schema, fallback),
  );
  useEffect(() => writeStorage(key, value), [key, value]);
  return [value, setValue] as const;
}
