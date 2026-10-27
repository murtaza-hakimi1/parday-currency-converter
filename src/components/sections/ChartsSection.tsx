import { useMemo, useState } from "react";
import { Activity, TrendingDown, TrendingUp } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useHistory } from "../../hooks/useExchangeRate";
import { formatNumber } from "../../utils/conversion";

export default function ChartsSection({
  from,
  to,
}: {
  from: string;
  to: string;
}) {
  const [days, setDays] = useState(30);
  const query = useHistory(from, to, days);
  const stats = useMemo(() => {
    const values = query.data ?? [];
    if (!values.length) return null;
    const rates = values.map((v) => v.rate);
    return {
      low: Math.min(...rates),
      high: Math.max(...rates),
      average: rates.reduce((a, b) => a + b, 0) / rates.length,
      change: (rates[rates.length - 1] / rates[0] - 1) * 100,
    };
  }, [query.data]);

  return (
    <section className="panel section-panel">
      <div className="section-heading">
        <div>
          <div className="eyebrow">RATE EXPLORER</div>
          <h2>
            <Activity size={21} /> Historical trends
          </h2>
          <p>
            {from} to {to} · dated reference observations
          </p>
        </div>
        <div className="range-switch">
          {[
            { n: 7, l: "7D" },
            { n: 30, l: "30D" },
            { n: 90, l: "90D" },
            { n: 365, l: "1Y" },
          ].map((x) => (
            <button
              key={x.n}
              className={days === x.n ? "selected" : ""}
              onClick={() => setDays(x.n)}
            >
              {x.l}
            </button>
          ))}
        </div>
      </div>
      {query.isLoading ? (
        <div className="empty-state">
          <span className="spinner large-spinner" />
          <strong>Loading historical rates</strong>
          <p>Fetching dated observations from the reference provider.</p>
        </div>
      ) : query.error ? (
        <div className="empty-state">
          <span className="empty-icon">
            <Activity size={23} />
          </span>
          <strong>History is unavailable for this pair</strong>
          <p>
            {(query.error as Error).message} The provider may not support this
            currency pair or date range.
          </p>
        </div>
      ) : !query.data?.length ? (
        <div className="empty-state">
          <span className="empty-icon">
            <Activity size={23} />
          </span>
          <strong>No historical observations</strong>
          <p>
            No data was returned for this pair and date range. No values have
            been invented.
          </p>
        </div>
      ) : (
        <>
          <div className="chart-stats">
            <div>
              <span>Period high</span>
              <strong>{formatNumber(stats!.high, 5)}</strong>
            </div>
            <div>
              <span>Period average</span>
              <strong>{formatNumber(stats!.average, 5)}</strong>
            </div>
            <div>
              <span>Period low</span>
              <strong>{formatNumber(stats!.low, 5)}</strong>
            </div>
            <div>
              <span>Period change</span>
              <strong className={stats!.change >= 0 ? "positive" : "negative"}>
                {stats!.change >= 0 ? (
                  <TrendingUp size={15} />
                ) : (
                  <TrendingDown size={15} />
                )}{" "}
                {stats!.change >= 0 ? "+" : ""}
                {stats!.change.toFixed(2)}%
              </strong>
            </div>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={query.data}
                margin={{ top: 10, right: 18, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--chart-grid)"
                />
                <XAxis
                  dataKey="date"
                  tickFormatter={(v) => String(v).slice(5)}
                  tickLine={false}
                  axisLine={false}
                  minTickGap={28}
                  tick={{ fill: "var(--muted)", fontSize: 11 }}
                />
                <YAxis
                  domain={["auto", "auto"]}
                  tickLine={false}
                  axisLine={false}
                  width={66}
                  tick={{ fill: "var(--muted)", fontSize: 11 }}
                  tickFormatter={(v) => Number(v).toFixed(2)}
                />
                <Tooltip
                  formatter={(v) => [
                    `${formatNumber(Number(v), 6)} ${to}`,
                    `AFN per ${from}`,
                  ]}
                  labelFormatter={(v) => `Rate date: ${v}`}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--border)",
                    background: "var(--surface)",
                    color: "var(--text)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke="#4f7cff"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{
                    r: 5,
                    fill: "#4f7cff",
                    stroke: "var(--surface)",
                    strokeWidth: 2,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-footnote">
            Source: Frankfurter daily reference data. The most recent
            observation may not be today. Chart values are not guaranteed
            cash-exchange quotes.
          </div>
        </>
      )}
    </section>
  );
}
