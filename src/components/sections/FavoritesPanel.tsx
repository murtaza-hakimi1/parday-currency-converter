import { ArrowRight, Star, Trash2 } from "lucide-react";
import type { FavoritePair } from "../../types/currency";

export default function FavoritesPanel({
  favorites,
  onSelect,
  onRemove,
}: {
  favorites: FavoritePair[];
  onSelect: (f: FavoritePair) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <section className="panel side-panel">
      <div className="side-heading">
        <div>
          <span className="side-icon">
            <Star size={17} />
          </span>
          <div>
            <h3>Favorite pairs</h3>
            <p>Your quick conversions</p>
          </div>
        </div>
        <span className="count-chip">{favorites.length}</span>
      </div>
      {!favorites.length ? (
        <div className="side-empty">
          Save a pair from the converter to access it here.
        </div>
      ) : (
        <div className="favorite-list">
          {favorites.map((f) => (
            <div className="favorite-row" key={f.id}>
              <button className="favorite-select" onClick={() => onSelect(f)}>
                <span className="pair-bubble">{f.from.slice(0, 2)}</span>
                <span className="pair-codes">
                  <strong>
                    {f.from} <ArrowRight size={12} /> {f.to}
                  </strong>
                  <small>Open converter</small>
                </span>
              </button>
              <button
                className="mini-icon"
                aria-label={`Remove ${f.from} to ${f.to}`}
                onClick={() => onRemove(f.id)}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
