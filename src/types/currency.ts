export interface Currency {
  code: string;
  name: string;
  symbol?: string;
}

export interface ExchangeRate {
  base: string;
  quote: string;
  rate: number;
  date: string;
  provider: string;
  fetchedAt: string;
  rateType: "daily-reference" | "indicative";
}

export interface HistoricalRate {
  date: string;
  rate: number;
}

export interface ConversionRecord {
  id: string;
  amount: number;
  from: string;
  to: string;
  rate: number;
  result: number;
  rateDate: string;
  createdAt: string;
  provider: string;
}

export interface FavoritePair {
  id: string;
  from: string;
  to: string;
  label?: string;
}

export interface RateAlert {
  id: string;
  base: string;
  quote: string;
  condition: "above" | "below";
  targetRate: number;
  enabled: boolean;
  lastTriggeredAt?: string;
}

export interface RateProvider {
  getRate(
    base: string,
    quote: string,
    signal?: AbortSignal,
  ): Promise<ExchangeRate>;
  getCurrencies(signal?: AbortSignal): Promise<Currency[]>;
  getHistory(
    base: string,
    quote: string,
    start: string,
    end: string,
    signal?: AbortSignal,
  ): Promise<HistoricalRate[]>;
}
