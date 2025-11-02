/**
 * Header component with app title and status indicators
 */

import './Header.css';

interface HeaderProps {
  isListening?: boolean;
  isRecording?: boolean;
  onSettingsClick?: () => void;
}

export function Header({ isListening = false, isRecording = false, onSettingsClick }: HeaderProps) {
  return (
    <header className="header">
      <h1 className="header__title">Voice Birder</h1>
      <div className="header__actions">
        <div className="header__status">
          {isListening && (
            <span className="status-indicator status-indicator--listening">
              Listening
            </span>
          )}
          {isRecording && (
            <span className="status-indicator status-indicator--recording">
              Recording
            </span>
          )}
        </div>
        {onSettingsClick && (
          <button
            className="header__settings-btn"
            onClick={onSettingsClick}
            aria-label="Settings"
            title="Settings"
          >
            ⚙
          </button>
        )}
      </div>
    </header>
  );
}
