import { BellRing, Plus, Trash2, TriangleAlert } from "lucide-react";
import { useState } from "react";
import type { RateAlert } from "../../types/currency";
import { formatNumber } from "../../utils/conversion";

export default function AlertsSection({
  alerts,
  onChange,
  currentFrom,
  currentTo,
}: {
  alerts: RateAlert[];
  onChange: (v: RateAlert[]) => void;
  currentFrom: string;
  currentTo: string;
}) {
  const [condition, setCondition] = useState<"above" | "below">("above");
  const [target, setTarget] = useState("");
  function addAlert() {
    const n = Number(target);
    if (!Number.isFinite(n) || n <= 0) return;
    onChange(
      [
        {
          id: crypto.randomUUID?.() ?? String(Date.now()),
          base: currentFrom,
          quote: currentTo,
          condition,
          targetRate: n,
          enabled: true,
        },
        ...alerts,
      ].slice(0, 50),
    );
    setTarget("");
  }
  return (
    <section className="panel section-panel">
      <div className="section-heading">
        <div>
          <div className="eyebrow">PERSONAL WATCHLIST</div>
          <h2>
            <BellRing size={21} /> Rate alerts
          </h2>
          <p>Create a local threshold for the currently selected pair.</p>
        </div>
      </div>
      <div className="alert-notice">
        <TriangleAlert size={18} />
        <p>
          <strong>Browser-only alerts:</strong> this frontend checks thresholds
          when a rate is fetched while the app is open. It cannot guarantee
          notifications when the browser is closed or suspended.
        </p>
      </div>
      <div className="alert-builder">
        <div className="alert-pair">
          <span className="field-label">Pair</span>
          <strong>
            {currentFrom} <span>→</span> {currentTo}
          </strong>
        </div>
        <label className="form-control">
          <span className="field-label">Condition</span>
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value as "above" | "below")}
          >
            <option value="above">Rate rises above</option>
            <option value="below">Rate falls below</option>
          </select>
        </label>
        <label className="form-control">
          <span className="field-label">Target rate ({currentTo})</span>
          <input
            inputMode="decimal"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="e.g. 72.00"
          />
        </label>
        <button
          className="button button-primary"
          onClick={addAlert}
          disabled={!Number.isFinite(Number(target)) || Number(target) <= 0}
        >
          <Plus size={16} /> Add alert
        </button>
      </div>
      {!alerts.length ? (
        <div className="empty-state compact">
          <span className="empty-icon">
            <BellRing size={22} />
          </span>
          <strong>No rate alerts yet</strong>
          <p>Add a threshold above to start monitoring.</p>
        </div>
      ) : (
        <div className="alert-list">
          {alerts.map((a) => (
            <div className="alert-item" key={a.id}>
              <span className="alert-icon">
                <BellRing size={18} />
              </span>
              <div className="alert-copy">
                <strong>
                  {a.base} / {a.quote}
                </strong>
                <span>
                  {a.condition === "above" ? "Rises above" : "Falls below"}{" "}
                  {formatNumber(a.targetRate, 6)} {a.quote}
                </span>
                <small>
                  {a.enabled ? "Enabled · checks when a rate loads" : "Paused"}
                  {a.lastTriggeredAt
                    ? ` · Last triggered ${new Date(a.lastTriggeredAt).toLocaleString()}`
                    : ""}
                </small>
              </div>
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={a.enabled}
                  onChange={(e) =>
                    onChange(
                      alerts.map((x) =>
                        x.id === a.id ? { ...x, enabled: e.target.checked } : x,
                      ),
                    )
                  }
                />
                <span>{a.enabled ? "On" : "Off"}</span>
              </label>
              <button
                className="icon-button danger-icon"
                aria-label="Delete alert"
                onClick={() => onChange(alerts.filter((x) => x.id !== a.id))}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
