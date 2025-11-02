/**
 * Autocomplete input component for bird names
 */

import { useState, useRef, useEffect } from 'react';
import type { BirdReference } from '../types';
import { searchBirds } from '../services/ebirdApi';
import './BirdAutocomplete.css';

interface BirdAutocompleteProps {
  birds: BirdReference[];
  value: string;
  onChange: (value: string) => void;
  onSelect?: (bird: BirdReference) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export function BirdAutocomplete({
  birds,
  value,
  onChange,
  onSelect,
  placeholder = 'Bird name (e.g., Australian Magpie)',
  autoFocus = false,
}: BirdAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<BirdReference[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value.trim().length >= 2) {
      const matches = searchBirds(birds, value, 8);
      setSuggestions(matches);
      setShowSuggestions(matches.length > 0);
      setSelectedIndex(-1);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  }, [value, birds]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleSelectBird = (bird: BirdReference) => {
    onChange(bird.commonName);
    setShowSuggestions(false);
    setSuggestions([]);
    setSelectedIndex(-1);
    if (onSelect) {
      onSelect(bird);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelectBird(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleBlur = () => {
    // Delay to allow click on suggestion
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }, 200);
  };

  return (
    <div className="bird-autocomplete">
      <input
        ref={inputRef}
        type="text"
        className="form-input form-input--inline"
        placeholder={placeholder}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        onFocus={() => {
          if (suggestions.length > 0) {
            setShowSuggestions(true);
          }
        }}
        autoFocus={autoFocus}
        autoComplete="off"
      />
      {showSuggestions && suggestions.length > 0 && (
        <div ref={suggestionsRef} className="suggestions-dropdown">
          {suggestions.map((bird, index) => (
            <div
              key={bird.speciesCode}
              className={`suggestion-item ${index === selectedIndex ? 'suggestion-item--selected' : ''}`}
              onClick={() => handleSelectBird(bird)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div className="suggestion-item__main">
                <span className="suggestion-item__common">{bird.commonName}</span>
                <span className="suggestion-item__scientific">{bird.scientificName}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
