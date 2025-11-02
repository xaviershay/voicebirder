/**
 * Welcome screen shown when no active list
 */

import { useState } from 'react';
import type { Location, Protocol } from '../types';
import './WelcomeScreen.css';

interface WelcomeScreenProps {
  onStartList: (location: Location, protocol: Protocol) => void;
  defaultLocation?: string;
}

export function WelcomeScreen({ onStartList, defaultLocation = 'Melbourne, Victoria' }: WelcomeScreenProps) {
  const [locationName, setLocationName] = useState(defaultLocation);
  const [protocol, setProtocol] = useState<Protocol>('Stationary');

  const handleStart = () => {
    if (!locationName.trim()) {
      alert('Please enter a location name');
      return;
    }

    onStartList(
      { name: locationName.trim() },
      protocol
    );
  };

  return (
    <div className="welcome">
      <div className="welcome__content">
        <h2 className="welcome__title">Start Birding</h2>
        <p className="welcome__description">
          Create a new checklist to start recording bird sightings
        </p>

        <div className="welcome__form">
          <div className="form-group">
            <label htmlFor="location" className="form-label">
              Location
            </label>
            <input
              id="location"
              type="text"
              className="form-input"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="Enter location name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="protocol" className="form-label">
              Protocol
            </label>
            <select
              id="protocol"
              className="form-select"
              value={protocol}
              onChange={(e) => setProtocol(e.target.value as Protocol)}
            >
              <option value="Stationary">Stationary</option>
              <option value="Traveling">Traveling</option>
              <option value="Casual">Casual</option>
            </select>
          </div>

          <button className="btn btn--primary btn--large" onClick={handleStart}>
            Start New List
          </button>
        </div>

        <div className="welcome__info">
          <h3 className="info__title">How it works</h3>
          <ol className="info__list">
            <li>Start a new checklist</li>
            <li>Add birds manually or use voice commands (coming soon)</li>
            <li>Complete your list and export to eBird</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
