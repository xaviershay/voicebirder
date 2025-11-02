/**
 * Settings modal for configuring API keys and preferences
 */

import { useState, useEffect } from 'react';
import { getEBirdApiKey, saveEBirdApiKey, getPicovoiceAccessKey, savePicovoiceAccessKey } from '../services/storage';
import './SettingsModal.css';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
}

export function SettingsModal({ isOpen, onClose, onSave }: SettingsModalProps) {
  const [ebirdApiKey, setEbirdApiKey] = useState('');
  const [picovoiceAccessKey, setPicovoiceAccessKey] = useState('');

  useEffect(() => {
    if (isOpen) {
      setEbirdApiKey(getEBirdApiKey());
      setPicovoiceAccessKey(getPicovoiceAccessKey());
    }
  }, [isOpen]);

  const handleSave = () => {
    saveEBirdApiKey(ebirdApiKey.trim());
    savePicovoiceAccessKey(picovoiceAccessKey.trim());
    if (onSave) {
      onSave();
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Settings</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label htmlFor="ebird-api-key" className="form-label">
              eBird API Key
              <span className="label-required">*</span>
            </label>
            <input
              id="ebird-api-key"
              type="text"
              className="form-input"
              value={ebirdApiKey}
              onChange={(e) => setEbirdApiKey(e.target.value)}
              placeholder="Enter your eBird API key"
            />
            <p className="form-help">
              Get your free API key at{' '}
              <a
                href="https://ebird.org/api/keygen"
                target="_blank"
                rel="noopener noreferrer"
                className="form-link"
              >
                ebird.org/api/keygen
              </a>
            </p>
          </div>

          <div className="form-group">
            <label htmlFor="picovoice-access-key" className="form-label">
              Picovoice Access Key
              <span className="label-optional">(for voice features)</span>
            </label>
            <input
              id="picovoice-access-key"
              type="text"
              className="form-input"
              value={picovoiceAccessKey}
              onChange={(e) => setPicovoiceAccessKey(e.target.value)}
              placeholder="Enter your Picovoice access key"
            />
            <p className="form-help">
              Get your free access key at{' '}
              <a
                href="https://console.picovoice.ai/"
                target="_blank"
                rel="noopener noreferrer"
                className="form-link"
              >
                console.picovoice.ai
              </a>
            </p>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn--secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn--primary" onClick={handleSave}>
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
