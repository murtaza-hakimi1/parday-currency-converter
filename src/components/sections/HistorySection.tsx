import { Download, History, Trash2 } from "lucide-react";
import type { ConversionRecord } from "../../types/currency";
import { formatCurrency, formatNumber } from "../../utils/conversion";
import { downloadCsv } from "../../utils/export";

export default function HistorySection({
  records,
  onClear,
}: {
  records: ConversionRecord[];
  onClear: () => void;
}) {
  return (
    <section className="panel section-panel">
      <div className="section-heading">
        <div>
          <div className="eyebrow">YOUR ACTIVITY</div>
          <h2>
            <History size={21} /> Recent conversions
          </h2>
          <p>Saved on this device, in this browser.</p>
        </div>
        <div className="heading-actions">
          <button
            className="button button-secondary"
            onClick={() =>
              downloadCsv(
                "conversion-history.csv",
                records as unknown as Record<string, string | number>[],
              )
            }
            disabled={!records.length}
          >
            <Download size={15} /> Export CSV
          </button>
          <button
            className="icon-button"
            onClick={onClear}
            disabled={!records.length}
            title="Clear history"
            aria-label="Clear history"
          >
            <Trash2 size={17} />
          </button>
        </div>
      </div>
      {!records.length ? (
        <div className="empty-state">
          <span className="empty-icon">
            <History size={23} />
          </span>
          <strong>No saved conversions yet</strong>
          <p>Your saved calculations will appear here.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Conversion</th>
                <th>Rate</th>
                <th>Result</th>
                <th>Rate date</th>
                <th>Saved</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id}>
                  <td>
                    <strong>
                      {formatNumber(r.amount, 4)} {r.from}
                    </strong>
                    <small>to {r.to}</small>
                  </td>
                  <td>
                    1 {r.from} = {formatNumber(r.rate, 6)} {r.to}
                  </td>
                  <td className="table-result">
                    {formatCurrency(r.result, r.to)}
                  </td>
                  <td>{r.rateDate}</td>
                  <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
