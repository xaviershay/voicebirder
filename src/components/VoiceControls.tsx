/**
 * Voice controls component for starting/stopping voice commands
 */

import type { VoiceInference } from '../hooks/useVoiceCommands';
import './VoiceControls.css';

interface VoiceControlsProps {
  isWakeWordActive: boolean;
  isListeningForCommand: boolean;
  lastInference: VoiceInference | null;
  onStart: () => void;
  onStop: () => void;
}

export function VoiceControls({
  isWakeWordActive,
  isListeningForCommand,
  lastInference,
  onStart,
  onStop,
}: VoiceControlsProps) {
  return (
    <div className="voice-controls">
      <div className="voice-controls__header">
        <h3 className="voice-controls__title">Voice Commands</h3>
        {isWakeWordActive ? (
          <button className="btn btn--secondary btn--small" onClick={onStop}>
            Stop Listening
          </button>
        ) : (
          <button className="btn btn--primary btn--small" onClick={onStart}>
            Start Voice Commands
          </button>
        )}
      </div>

      {isWakeWordActive && (
        <div className="voice-controls__status">
          {isListeningForCommand ? (
            <div className="voice-status voice-status--recording">
              <span className="voice-status__dot"></span>
              <span>Listening for bird name...</span>
            </div>
          ) : (
            <div className="voice-status voice-status--waiting">
              <span className="voice-status__dot"></span>
              <span>Say "Record" to start</span>
            </div>
          )}
        </div>
      )}

      {lastInference && (
        <div className="voice-controls__inference">
          {lastInference.isUnderstood ? (
            <div className="inference inference--success">
              <span className="inference__icon">✓</span>
              <div className="inference__text">
                <strong>{lastInference.ebirdCommonName || lastInference.birdName}</strong>
                {lastInference.count && lastInference.count > 1 && (
                  <span className="inference__count"> × {lastInference.count}</span>
                )}
              </div>
            </div>
          ) : (
            <div className="inference inference--error">
              <span className="inference__icon">✗</span>
              <span>Could not understand command</span>
            </div>
          )}
        </div>
      )}

      {!isWakeWordActive && (
        <div className="voice-controls__help">
          <p className="help-text">
            <strong>How to use:</strong>
          </p>
          <ol className="help-list">
            <li>Click "Start Voice Commands"</li>
            <li>Say "Record" to activate</li>
            <li>Say the bird name and optional count</li>
            <li>Examples: "Record Australian Magpie", "Record 3 Rainbow Lorikeet"</li>
          </ol>
        </div>
      )}
    </div>
  );
}
