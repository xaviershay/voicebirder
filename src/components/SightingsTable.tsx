/**
 * Sightings table component with manual add functionality
 */

import { useState } from 'react';
import { format } from 'date-fns';
import type { BirdSighting } from '../types';
import './SightingsTable.css';

interface SightingsTableProps {
  sightings: BirdSighting[];
  onAddSighting: (commonName: string, count: number) => void;
  onRemoveSighting: (sightingId: string) => void;
  onUpdateSighting: (sightingId: string, count: number) => void;
}

export function SightingsTable({
  sightings,
  onAddSighting,
  onRemoveSighting,
  onUpdateSighting,
}: SightingsTableProps) {
  const [birdName, setBirdName] = useState('');
  const [count, setCount] = useState('1');
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();

    if (!birdName.trim()) {
      alert('Please enter a bird name');
      return;
    }

    const countNum = parseInt(count, 10);
    if (isNaN(countNum) || countNum < 1) {
      alert('Please enter a valid count');
      return;
    }

    onAddSighting(birdName.trim(), countNum);
    setBirdName('');
    setCount('1');
    setIsAdding(false);
  };

  const sortedSightings = [...sightings].sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
  );

  return (
    <div className="sightings-table">
      <div className="sightings-table__header">
        <h3 className="sightings-table__title">
          Sightings ({sightings.length})
        </h3>
        <button
          className="btn btn--primary btn--small"
          onClick={() => setIsAdding(!isAdding)}
        >
          {isAdding ? 'Cancel' : '+ Add Bird'}
        </button>
      </div>

      {isAdding && (
        <form className="add-sighting-form" onSubmit={handleAdd}>
          <div className="add-sighting-form__inputs">
            <input
              type="text"
              className="form-input form-input--inline"
              placeholder="Bird name (e.g., Australian Magpie)"
              value={birdName}
              onChange={(e) => setBirdName(e.target.value)}
              autoFocus
            />
            <input
              type="number"
              className="form-input form-input--inline form-input--count"
              placeholder="Count"
              value={count}
              onChange={(e) => setCount(e.target.value)}
              min="1"
            />
          </div>
          <button type="submit" className="btn btn--primary btn--small">
            Add
          </button>
        </form>
      )}

      {sortedSightings.length === 0 ? (
        <div className="sightings-table__empty">
          <p>No sightings yet. Add your first bird!</p>
        </div>
      ) : (
        <div className="sightings-list">
          {sortedSightings.map((sighting) => (
            <div key={sighting.id} className="sighting-row">
              <div className="sighting-row__main">
                <div className="sighting-row__info">
                  <span className="sighting-row__name">{sighting.commonName}</span>
                  {sighting.scientificName && (
                    <span className="sighting-row__scientific">
                      {sighting.scientificName}
                    </span>
                  )}
                </div>
                <div className="sighting-row__meta">
                  <span className="sighting-row__time">
                    {format(sighting.timestamp, 'h:mm a')}
                  </span>
                </div>
              </div>
              <div className="sighting-row__actions">
                <div className="count-control">
                  <button
                    className="count-control__btn"
                    onClick={() => onUpdateSighting(sighting.id, Math.max(1, sighting.count - 1))}
                    aria-label="Decrease count"
                  >
                    −
                  </button>
                  <span className="count-control__value">{sighting.count}</span>
                  <button
                    className="count-control__btn"
                    onClick={() => onUpdateSighting(sighting.id, sighting.count + 1)}
                    aria-label="Increase count"
                  >
                    +
                  </button>
                </div>
                <button
                  className="btn-icon btn-icon--delete"
                  onClick={() => onRemoveSighting(sighting.id)}
                  aria-label="Remove sighting"
                  title="Remove sighting"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
