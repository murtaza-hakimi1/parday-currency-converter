import { Globe2, ShieldCheck, Sparkles } from "lucide-react";

export default function QuickInfo() {
  return (
    <section className="panel side-panel info-panel">
      <div className="side-heading">
        <div>
          <span className="side-icon">
            <Sparkles size={17} />
          </span>
          <div>
            <h3>Built for clarity</h3>
            <p>Know what your rate means</p>
          </div>
        </div>
      </div>
      <div className="info-item">
        <span className="info-icon">
          <Globe2 size={17} />
        </span>
        <div>
          <strong>Reference data</strong>
          <p>
            Rates are sourced from a public daily reference API, not a cash
            dealer.
          </p>
        </div>
      </div>
      <div className="info-item">
        <span className="info-icon">
          <ShieldCheck size={17} />
        </span>
        <div>
          <strong>Your data stays local</strong>
          <p>
            Favorites, saved conversions and alerts are stored in this browser.
          </p>
        </div>
      </div>
      <div className="provider-note">
        <span className="provider-dot" />
        <span>Data provider: Frankfurter API</span>
        <a href="https://frankfurter.dev/" target="_blank" rel="noreferrer">
          Docs ↗
        </a>
      </div>
    </section>
  );
}
