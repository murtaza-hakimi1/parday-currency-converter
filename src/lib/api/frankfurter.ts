import type {
  Currency,
  ExchangeRate,
  HistoricalRate,
  RateProvider,
} from "../../types/currency";

const API_BASE = "https://api.frankfurter.dev/v2";

async function getJson(url: string, signal?: AbortSignal): Promise<unknown> {
  const response = await fetch(url, {
    signal,
    headers: { Accept: "application/json" },
  });
  if (!response.ok) {
    if (response.status === 404)
      throw new Error("This currency pair is not available from Frankfurter.");
    if (response.status === 429)
      throw new Error(
        "Rate provider is busy. Please wait before trying again.",
      );
    throw new Error(`Rate provider request failed (${response.status}).`);
  }
  return response.json();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export const frankfurterProvider: RateProvider = {
  async getRate(base, quote, signal): Promise<ExchangeRate> {
    if (base === quote) {
      return {
        base,
        quote,
        rate: 1,
        date: new Date().toISOString().slice(0, 10),
        provider: "Calculated",
        fetchedAt: new Date().toISOString(),
        rateType: "daily-reference",
      };
    }
    const cacheKey = `parday-rate-${base}-${quote}`;
    try {
      const data = await getJson(
        `${API_BASE}/rate/${encodeURIComponent(base.toLowerCase())}/${encodeURIComponent(quote.toLowerCase())}`,
        signal,
      );
      if (
        !isRecord(data) ||
        typeof data.rate !== "number" ||
        !Number.isFinite(data.rate) ||
        data.rate <= 0 ||
        typeof data.date !== "string" ||
        typeof data.base !== "string" ||
        typeof data.quote !== "string"
      ) {
        throw new Error("The rate provider returned an invalid response.");
      }
      if (
        data.base.toUpperCase() !== base ||
        data.quote.toUpperCase() !== quote
      ) {
        throw new Error(
          "The provider returned a different currency pair than requested.",
        );
      }
      const normalized: ExchangeRate = {
        base,
        quote,
        rate: data.rate,
        date: data.date,
        provider: "Frankfurter",
        fetchedAt: new Date().toISOString(),
        rateType: "daily-reference",
      };
      try {
        localStorage.setItem(cacheKey, JSON.stringify(normalized));
      } catch {}
      return normalized;
    } catch (error) {
      if (signal?.aborted) throw error;
      try {
        const raw = localStorage.getItem(cacheKey);
        if (raw) {
          const cached: unknown = JSON.parse(raw);
          if (
            isRecord(cached) &&
            cached.base === base &&
            cached.quote === quote &&
            typeof cached.rate === "number" &&
            Number.isFinite(cached.rate) &&
            cached.rate > 0 &&
            typeof cached.date === "string" &&
            typeof cached.fetchedAt === "string"
          ) {
            return {
              base,
              quote,
              rate: cached.rate,
              date: cached.date,
              provider: "Frankfurter (cached)",
              fetchedAt: cached.fetchedAt,
              rateType: "daily-reference",
            };
          }
        }
      } catch {}
      throw error;
    }
  },

  async getCurrencies(signal): Promise<Currency[]> {
    const data = await getJson(`${API_BASE}/currencies`, signal);
    if (!Array.isArray(data))
      throw new Error("The currency list response was invalid.");
    return data
      .flatMap((item): Currency[] => {
        if (
          !isRecord(item) ||
          typeof item.iso_code !== "string" ||
          typeof item.name !== "string"
        )
          return [];
        return [
          {
            code: item.iso_code.toUpperCase(),
            name: item.name,
            symbol: typeof item.symbol === "string" ? item.symbol : undefined,
          },
        ];
      })
      .sort((a, b) => a.code.localeCompare(b.code));
  },

  async getHistory(base, quote, start, end, signal): Promise<HistoricalRate[]> {
    const url = `${API_BASE}/rates?base=${encodeURIComponent(base)}&quotes=${encodeURIComponent(quote)}&from=${encodeURIComponent(start)}&to=${encodeURIComponent(end)}`;
    const data = await getJson(url, signal);
    if (!Array.isArray(data))
      throw new Error("Historical rate response was invalid.");
    return data
      .flatMap((item): HistoricalRate[] => {
        if (
          !isRecord(item) ||
          typeof item.date !== "string" ||
          typeof item.rate !== "number" ||
          !Number.isFinite(item.rate) ||
          item.rate <= 0
        )
          return [];
        return [{ date: item.date, rate: item.rate }];
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  },
};
