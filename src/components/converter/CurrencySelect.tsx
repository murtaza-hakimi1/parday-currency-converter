import { Search, ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";
import type { Currency } from "../../types/currency";

interface Props {
  value: string;
  currencies: Currency[];
  onChange: (value: string) => void;
  label: string;
  loading?: boolean;
}

const preferred = [
  "AFN",
  "USD",
  "EUR",
  "GBP",
  "PKR",
  "INR",
  "AED",
  "SAR",
  "CAD",
  "AUD",
  "TRY",
  "IRR",
];

export default function CurrencySelect({
  value,
  currencies,
  onChange,
  label,
  loading,
}: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const selected = currencies.find((c) => c.code === value) ?? {
    code: value,
    name: value,
  };
  const options = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = currencies.filter(
      (c) =>
        !q ||
        c.code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q),
    );
    return filtered.sort((a, b) => {
      const ai = preferred.indexOf(a.code),
        bi = preferred.indexOf(b.code);
      if (ai !== -1 || bi !== -1)
        return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
      return a.code.localeCompare(b.code);
    });
  }, [currencies, search]);

  return (
    <div className="currency-select-wrap">
      <button
        className={`currency-select ${open ? "opened" : ""}`}
        onClick={() => {
          setOpen((v) => !v);
          setSearch("");
        }}
        aria-label={`${label}: ${selected.code}`}
        aria-expanded={open}
      >
        <span className={`currency-flag flag-${value}`}>
          {value.slice(0, 2)}
        </span>
        <span className="currency-selected">
          <strong>{selected.code}</strong>
          <small>{selected.name}</small>
        </span>
        <ChevronDown size={17} className="select-chevron" />
      </button>
      {open && (
        <>
          <button
            className="dropdown-backdrop"
            aria-label="Close currency menu"
            onClick={() => setOpen(false)}
          />
          <div className="currency-dropdown">
            <div className="currency-search">
              <Search size={16} />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search currency..."
                aria-label="Search currencies"
              />
            </div>
            <div className="currency-options">
              {loading && (
                <div className="dropdown-message">Loading currencies…</div>
              )}
              {!loading && options.length === 0 && (
                <div className="dropdown-message">No matching currencies</div>
              )}
              {options.map((c) => (
                <button
                  key={c.code}
                  className={`currency-option ${c.code === value ? "selected" : ""}`}
                  onClick={() => {
                    onChange(c.code);
                    setOpen(false);
                  }}
                >
                  <span className={`currency-flag flag-${c.code}`}>
                    {c.code.slice(0, 2)}
                  </span>
                  <span>
                    <strong>{c.code}</strong>
                    <small>{c.name}</small>
                  </span>
                  {c.code === value && <span className="option-check">✓</span>}
                </button>
              ))}
            </div>
            <div className="dropdown-footer">
              {options.length} supported currencies in this provider
            </div>
          </div>
        </>
      )}
    </div>
  );
}
