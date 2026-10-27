import { useEffect, useMemo, useState } from "react";
import {
  Download,
  FileJson,
  Printer,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Header from "./components/layout/Header";
import ConverterCard from "./components/converter/ConverterCard";
import FavoritesPanel from "./components/sections/FavoritesPanel";
import QuickInfo from "./components/sections/QuickInfo";
import HistorySection from "./components/sections/HistorySection";
import ChartsSection from "./components/sections/ChartsSection";
import AlertsSection from "./components/sections/AlertsSection";
import { useCurrencies, useExchangeRate } from "./hooks/useExchangeRate";
import { useLocalState } from "./hooks/useLocalState";
import {
  alertSchema,
  favoriteSchema,
  historySchema,
  writeStorage,
} from "./lib/storage";
import type {
  ConversionRecord,
  Currency,
  FavoritePair,
  RateAlert,
} from "./types/currency";
import { downloadCsv, downloadJson, printReport } from "./utils/export";
import StatusPill from "./components/ui/StatusPill";

const fallbackCurrencies: Currency[] = [
  { code: "AFN", name: "Afghan Afghani", symbol: "؋" },
  { code: "USD", name: "United States Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound Sterling", symbol: "£" },
  { code: "PKR", name: "Pakistani Rupee" },
  { code: "INR", name: "Indian Rupee" },
  { code: "AED", name: "United Arab Emirates Dirham" },
  { code: "SAR", name: "Saudi Riyal" },
  { code: "CAD", name: "Canadian Dollar" },
  { code: "AUD", name: "Australian Dollar" },
  { code: "TRY", name: "Turkish Lira" },
  { code: "IRR", name: "Iranian Rial" },
  { code: "CHF", name: "Swiss Franc" },
  { code: "CNY", name: "Chinese Yuan" },
  { code: "JPY", name: "Japanese Yen" },
  { code: "KWD", name: "Kuwaiti Dinar" },
];

export default function App() {
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("AFN");
  const [section, setSection] = useState("converter");
  const [dark, setDark] = useState(() => {
    try {
      return localStorage.getItem("parday-theme") !== "light";
    } catch {
      return true;
    }
  });
  const [online, setOnline] = useState(navigator.onLine);
  const [favorites, setFavorites] = useLocalState<FavoritePair[]>(
    "parday-favorites",
    favoriteSchema,
    [],
  );
  const [records, setRecords] = useLocalState<ConversionRecord[]>(
    "parday-history",
    historySchema,
    [],
  );
  const [alerts, setAlerts] = useLocalState<RateAlert[]>(
    "parday-alerts",
    alertSchema,
    [],
  );
  const currenciesQuery = useCurrencies();
  const rateQuery = useExchangeRate(from, to);
  const currencies = currenciesQuery.data?.length
    ? currenciesQuery.data
    : fallbackCurrencies;

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    try {
      localStorage.setItem("parday-theme", dark ? "dark" : "light");
    } catch {}
  }, [dark]);

  useEffect(() => {
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener("online", up);
    window.addEventListener("offline", down);
    return () => {
      window.removeEventListener("online", up);
      window.removeEventListener("offline", down);
    };
  }, []);

  useEffect(() => {
    const rate = rateQuery.data;
    if (!rate) return;
    setAlerts((current) =>
      current.map((alert) => {
        if (!alert.enabled || alert.base !== from || alert.quote !== to)
          return alert;
        const crossed =
          alert.condition === "above"
            ? rate.rate >= alert.targetRate
            : rate.rate <= alert.targetRate;
        const sameObservation =
          alert.lastTriggeredAt &&
          new Date(alert.lastTriggeredAt).toDateString() ===
            new Date().toDateString();
        if (crossed && !sameObservation) {
          const message = `${alert.base}/${alert.quote} reached ${rate.rate}`;
          if ("Notification" in window && Notification.permission === "granted")
            new Notification("Parday Exchange rate alert", { body: message });
          return { ...alert, lastTriggeredAt: new Date().toISOString() };
        }
        return alert;
      }),
    );
  }, [rateQuery.dataUpdatedAt, from, to]);

  const sortedRecords = useMemo(
    () => [...records].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [records],
  );
  const activeAlerts = alerts.filter((a) => a.enabled).length;

  function saveConversion(
    amount: number,
    result: number,
    rate: NonNullable<typeof rateQuery.data>,
  ) {
    const record: ConversionRecord = {
      id: crypto.randomUUID?.() ?? String(Date.now()),
      amount,
      from,
      to,
      rate: rate.rate,
      result,
      rateDate: rate.date,
      createdAt: new Date().toISOString(),
      provider: rate.provider,
    };
    setRecords((current) => [record, ...current].slice(0, 200));
  }

  function saveFavorites(items: FavoritePair[]) {
    setFavorites(items);
  }

  function selectFavorite(pair: FavoritePair) {
    setFrom(pair.from);
    setTo(pair.to);
    setSection("converter");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function requestNotifications() {
    if ("Notification" in window && Notification.permission === "default") {
      try {
        await Notification.requestPermission();
      } catch {}
    }
  }

  function goTo(id: string) {
    setSection(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (id === "alerts") void requestNotifications();
  }

  const rateLabel = rateQuery.data
    ? `${rateQuery.data.rate} ${to} per ${from}`
    : "No rate loaded";
  return (
    <div className="app-shell">
      <Header
        dark={dark}
        onToggleTheme={() => setDark((v) => !v)}
        active={section}
        onNavigate={goTo}
        alertCount={activeAlerts}
      />
      <main className="page-container">
        <section className="hero-row">
          <div>
            <div className="hero-kicker">
              <span className="kicker-spark">
                <Sparkles size={13} />
              </span>{" "}
              YOUR EVERYDAY CURRENCY TOOL
            </div>
            <h1>
              Make money moves
              <br />
              <span>with more clarity.</span>
            </h1>
            <p>
              Quick conversions, transparent reference rates, and useful tools —
              with a focus on USD and the Afghan Afghani.
            </p>
          </div>
          <div className="hero-aside">
            <div className="hero-aside-icon">
              <ShieldCheck size={20} />
            </div>
            <div>
              <strong>Clarity over guesswork</strong>
              <span>Rate source and observation date stay visible.</span>
            </div>
          </div>
        </section>

        <div className="top-status">
          <StatusPill
            online={online}
            stale={
              rateQuery.data
                ? Date.now() - new Date(rateQuery.data.date).getTime() >
                  3 * 86400000
                : false
            }
          />
          <span>
            Reference rates can differ from local cash-exchange quotes.
          </span>
        </div>

        {section === "converter" && (
          <div className="content-grid">
            <div className="main-column">
              <ConverterCard
                currencies={currencies}
                currenciesLoading={currenciesQuery.isLoading}
                from={from}
                to={to}
                setFrom={setFrom}
                setTo={setTo}
                rate={rateQuery.data}
                loading={rateQuery.isFetching}
                error={rateQuery.error as Error | null}
                online={online}
                onRefresh={() => void rateQuery.refetch()}
                favorites={favorites}
                onFavoritesChange={saveFavorites}
                onSave={saveConversion}
              />
              <div className="mini-feature-grid">
                <div className="mini-feature">
                  <span className="mini-feature-icon blue">
                    <ShieldCheck size={17} />
                  </span>
                  <div>
                    <strong>Transparent rates</strong>
                    <span>Provider and date are shown.</span>
                  </div>
                </div>
                <div className="mini-feature">
                  <span className="mini-feature-icon purple">
                    <Sparkles size={17} />
                  </span>
                  <div>
                    <strong>Useful by design</strong>
                    <span>History, trends and quick pairs.</span>
                  </div>
                </div>
              </div>
              <ChartsSection from={from} to={to} />
            </div>
            <aside className="side-column">
              <FavoritesPanel
                favorites={favorites}
                onSelect={selectFavorite}
                onRemove={(id) =>
                  setFavorites(favorites.filter((f) => f.id !== id))
                }
              />
              <QuickInfo />
              <div className="export-card">
                <div className="export-card-icon">
                  <Download size={18} />
                </div>
                <div>
                  <strong>Take your data with you</strong>
                  <p>Export your saved conversions or print a clean report.</p>
                </div>
                <div className="export-actions">
                  <button
                    onClick={() =>
                      downloadCsv(
                        "parday-conversions.csv",
                        sortedRecords as unknown as Record<
                          string,
                          string | number
                        >[],
                      )
                    }
                    disabled={!records.length}
                  >
                    <Download size={14} /> CSV
                  </button>
                  <button
                    onClick={() =>
                      downloadJson("parday-exchange-data.json", {
                        exportedAt: new Date().toISOString(),
                        rate: rateQuery.data,
                        history: sortedRecords,
                        favorites,
                        alerts,
                      })
                    }
                  >
                    <FileJson size={14} /> JSON
                  </button>
                  <button onClick={printReport}>
                    <Printer size={14} /> Print / PDF
                  </button>
                </div>
              </div>
            </aside>
          </div>
        )}

        {section === "history" && (
          <HistorySection
            records={sortedRecords}
            onClear={() => {
              if (window.confirm("Clear all saved conversion history?"))
                setRecords([]);
            }}
          />
        )}
        {section === "charts" && <ChartsSection from={from} to={to} />}
        {section === "alerts" && (
          <AlertsSection
            alerts={alerts}
            onChange={setAlerts}
            currentFrom={from}
            currentTo={to}
          />
        )}

        <section className="trust-strip">
          <div>
            <span className="trust-icon">
              <ShieldCheck size={17} />
            </span>
            <span>
              <strong>Informational reference data</strong>
              <small>Not a guaranteed transaction quote</small>
            </span>
          </div>
          <div>
            <span className="trust-icon">
              <Download size={17} />
            </span>
            <span>
              <strong>Local-first preferences</strong>
              <small>Your saved items stay in this browser</small>
            </span>
          </div>
          <div>
            <span className="trust-icon">
              <Sparkles size={17} />
            </span>
            <span>
              <strong>Designed for everyday use</strong>
              <small>Simple tools, clear context</small>
            </span>
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <span className="brand-mark small">
              <ArrowLeftRightIcon />
            </span>
            <strong>Parday Exchange</strong>
          </div>
          <span>
            Rates are informational. Confirm cash rates and fees before
            exchanging money.
          </span>
          <a href="https://frankfurter.dev/" target="_blank" rel="noreferrer">
            Rate source & documentation ↗
          </a>
        </div>
        <div className="footer-bottom">
          © {new Date().getFullYear()} Murtaza Hakimi · Built for clarity.
        </div>
      </footer>
    </div>
  );
}

function ArrowLeftRightIcon() {
  return <span aria-hidden="true">↔</span>;
}
