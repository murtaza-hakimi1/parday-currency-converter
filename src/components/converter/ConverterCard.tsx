import {
  ArrowDownUp,
  ArrowLeftRight,
  Bookmark,
  Check,
  Copy,
  RefreshCw,
  Star,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type {
  Currency,
  ExchangeRate,
  FavoritePair,
} from "../../types/currency";
import CurrencySelect from "./CurrencySelect";
import {
  formatCurrency,
  formatNumber,
  parseAmount,
} from "../../utils/conversion";
import StatusPill from "../ui/StatusPill";

interface Props {
  currencies: Currency[];
  currenciesLoading: boolean;
  from: string;
  to: string;
  setFrom: (value: string) => void;
  setTo: (value: string) => void;
  rate?: ExchangeRate;
  loading: boolean;
  error?: Error | null;
  online: boolean;
  onRefresh: () => void;
  favorites: FavoritePair[];
  onFavoritesChange: (items: FavoritePair[]) => void;
  onSave: (amount: number, result: number, rate: ExchangeRate) => void;
}

export default function ConverterCard(props: Props) {
  const {
    currencies,
    currenciesLoading,
    from,
    to,
    setFrom,
    setTo,
    rate,
    loading,
    error,
    online,
    onRefresh,
    favorites,
    onFavoritesChange,
    onSave,
  } = props;
  const [amountText, setAmountText] = useState("100");
  const [copied, setCopied] = useState(false);
  const amount = parseAmount(amountText);
  const result = useMemo(
    () => (amount !== null && rate ? amount * rate.rate : null),
    [amount, rate],
  );
  const favorite = favorites.some((f) => f.from === from && f.to === to);

  useEffect(() => {
    setCopied(false);
  }, [result, from, to]);

  function swap() {
    setFrom(to);
    setTo(from);
  }

  function toggleFavorite() {
    if (favorite)
      onFavoritesChange(
        favorites.filter((f) => !(f.from === from && f.to === to)),
      );
    else
      onFavoritesChange(
        [{ id: `${from}-${to}-${Date.now()}`, from, to }, ...favorites].slice(
          0,
          30,
        ),
      );
  }

  async function copyResult() {
    if (result === null) return;
    const text = `${formatNumber(result, 6)} ${to}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  const rateIsOld = rate
    ? Date.now() - new Date(rate.date).getTime() > 3 * 24 * 60 * 60 * 1000
    : false;

  return (
    <section className="panel converter-panel">
      <div className="panel-heading">
        <div>
          <div className="eyebrow">CURRENCY CONVERTER</div>
          <h2>Make every rate count.</h2>
          <p>Convert with transparent reference-rate data.</p>
        </div>
        <StatusPill online={online} stale={rateIsOld} />
      </div>

      <div className="amount-field">
        <label htmlFor="amount">You send</label>
        <div className="amount-row">
          <input
            id="amount"
            className="amount-input"
            inputMode="decimal"
            value={amountText}
            onChange={(e) => setAmountText(e.target.value)}
            aria-describedby="amount-help"
          />
          <CurrencySelect
            value={from}
            currencies={currencies}
            onChange={setFrom}
            label="Source currency"
            loading={currenciesLoading}
          />
        </div>
        <div id="amount-help" className="field-hint">
          Enter the amount you want to convert
        </div>
      </div>

      <div className="swap-row">
        <span className="swap-line" />
        <button
          className="swap-button"
          onClick={swap}
          aria-label="Swap currencies"
          title="Swap currencies"
        >
          <ArrowDownUp size={19} />
        </button>
        <span className="swap-line" />
      </div>

      <div className="amount-field receive-field">
        <label>They receive</label>
        <div className="amount-row">
          <output className="result-output" aria-live="polite">
            {result === null ? "—" : formatNumber(result, 2)}
          </output>
          <CurrencySelect
            value={to}
            currencies={currencies}
            onChange={setTo}
            label="Target currency"
            loading={currenciesLoading}
          />
        </div>
        <div className="field-hint">
          {result === null
            ? "Enter a valid amount and load a rate"
            : formatCurrency(result, to)}
        </div>
      </div>

      {error && !rate && (
        <div className="inline-alert error">
          <span className="alert-dot" />
          <div>
            <strong>We couldn’t load this rate</strong>
            <p>{error.message} Check your connection or choose another pair.</p>
          </div>
          <button className="text-button" onClick={onRefresh}>
            Try again
          </button>
        </div>
      )}
      {error && rate && (
        <div className="inline-alert warning">
          <span className="alert-dot" />
          <div>
            <strong>Showing the last available rate</strong>
            <p>
              The latest refresh failed. Verify the rate date below before
              relying on this result.
            </p>
          </div>
        </div>
      )}
      {!error && loading && (
        <div className="loading-line">
          <span className="spinner" /> Fetching reference rate…
        </div>
      )}

      <div className="rate-summary">
        <div className="rate-equation">
          <span className="rate-equals">1 {from}</span>
          <ArrowLeftRight size={15} />
          <strong>
            {rate ? `${formatNumber(rate.rate, 6)} ${to}` : "Rate unavailable"}
          </strong>
        </div>
        <div className="rate-meta">
          <span>
            {rate
              ? `${rate.provider} · ${rate.rateType === "daily-reference" ? "Daily reference" : "Indicative rate"}`
              : "Waiting for rate data"}
          </span>
          <span>
            {rate ? `Rate date: ${rate.date}` : "No verified rate loaded"}
          </span>
        </div>
      </div>

      <div className="converter-actions">
        <button
          className="button button-primary"
          disabled={result === null || !rate}
          onClick={() =>
            rate && amount !== null && onSave(amount, result!, rate)
          }
        >
          <Bookmark size={16} /> Save conversion
        </button>
        <button
          className={`button button-secondary ${favorite ? "is-favorite" : ""}`}
          onClick={toggleFavorite}
        >
          <Star size={16} fill={favorite ? "currentColor" : "none"} />{" "}
          {favorite ? "Saved pair" : "Favorite pair"}
        </button>
        <button
          className="button button-ghost"
          disabled={result === null}
          onClick={copyResult}
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? "Copied" : "Copy result"}
        </button>
        <button
          className="button button-ghost refresh-button"
          onClick={onRefresh}
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? "spin" : ""} /> Refresh
        </button>
      </div>
      <p className="disclaimer">
        Reference rates are informational and may differ from cash-exchange or
        bank rates. Always confirm the rate and fees with your provider before a
        transaction.
      </p>
    </section>
  );
}
