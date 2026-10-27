import { useQuery } from "@tanstack/react-query";
import { frankfurterProvider } from "../lib/api/frankfurter";

export function useExchangeRate(base: string, quote: string) {
  return useQuery({
    queryKey: ["rate", base, quote],
    queryFn: ({ signal }) => frankfurterProvider.getRate(base, quote, signal),
    enabled: /^[A-Z]{3}$/.test(base) && /^[A-Z]{3}$/.test(quote),
    staleTime: 15 * 60 * 1000,
    retry: 1,
  });
}

export function useCurrencies() {
  return useQuery({
    queryKey: ["currencies"],
    queryFn: ({ signal }) => frankfurterProvider.getCurrencies(signal),
    staleTime: 24 * 60 * 60 * 1000,
    retry: 1,
  });
}

export function useHistory(base: string, quote: string, days: number) {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);
  const startDate = start.toISOString().slice(0, 10);
  const endDate = end.toISOString().slice(0, 10);
  return useQuery({
    queryKey: ["history", base, quote, startDate, endDate],
    queryFn: ({ signal }) =>
      frankfurterProvider.getHistory(base, quote, startDate, endDate, signal),
    enabled: base !== quote,
    staleTime: 60 * 60 * 1000,
    retry: 1,
  });
}
