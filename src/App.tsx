/**
 * Main application component
 */

import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { WelcomeScreen } from './components/WelcomeScreen';
import { ActiveListView } from './components/ActiveListView';
import { SightingsTable } from './components/SightingsTable';
import { SettingsModal } from './components/SettingsModal';
import { useBirdList } from './hooks/useBirdList';
import { getBirdSpecies } from './services/ebirdApi';
import { getEBirdApiKey } from './services/storage';
import type { Location, Protocol, BirdReference } from './types';
import './App.css';

function App() {
  const {
    currentList,
    startNewList,
    addSighting,
    updateSighting,
    removeSighting,
    completeList,
    cancelList,
  } = useBirdList();

  const [birds, setBirds] = useState<BirdReference[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoadingBirds, setIsLoadingBirds] = useState(false);
  const [birdDataError, setBirdDataError] = useState<string | null>(null);

  // Load bird data on mount or when API key changes
  useEffect(() => {
    const loadBirds = async () => {
      const apiKey = getEBirdApiKey();

      // If no API key, open settings on first load
      if (!apiKey || apiKey.trim() === '') {
        setIsSettingsOpen(true);
        return;
      }

      setIsLoadingBirds(true);
      setBirdDataError(null);

      try {
        const birdData = await getBirdSpecies();
        setBirds(birdData);
      } catch (error) {
        console.error('Failed to load bird data:', error);
        setBirdDataError(error instanceof Error ? error.message : 'Failed to load bird data');
        // If API key error, prompt to re-enter
        if (error instanceof Error && error.message.includes('API key')) {
          setIsSettingsOpen(true);
        }
      } finally {
        setIsLoadingBirds(false);
      }
    };

    loadBirds();
  }, []);

  const handleSettingsSave = async () => {
    // Reload bird data after saving settings
    setIsLoadingBirds(true);
    setBirdDataError(null);

    try {
      const birdData = await getBirdSpecies(true); // Force refresh
      setBirds(birdData);
    } catch (error) {
      console.error('Failed to load bird data:', error);
      setBirdDataError(error instanceof Error ? error.message : 'Failed to load bird data');
    } finally {
      setIsLoadingBirds(false);
    }
  };

  const handleStartList = (location: Location, protocol: Protocol) => {
    startNewList(location, protocol);
  };

  const handleCompleteList = () => {
    if (window.confirm('Complete this checklist? You can export it later.')) {
      completeList();
    }
  };

  const handleCancelList = () => {
    if (window.confirm('Cancel this checklist? All sightings will be lost.')) {
      cancelList();
    }
  };

  const handleUpdateSighting = (sightingId: string, count: number) => {
    updateSighting(sightingId, { count });
  };

  return (
    <div className="app">
      <Header
        isListening={false}
        isRecording={false}
        onSettingsClick={() => setIsSettingsOpen(true)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSettingsSave}
      />

      <main className="app__main">
        {birdDataError && (
          <div className="app__error">
            <p>⚠️ {birdDataError}</p>
            <button className="btn btn--primary" onClick={() => setIsSettingsOpen(true)}>
              Open Settings
            </button>
          </div>
        )}

        {isLoadingBirds && (
          <div className="app__loading">
            <p>Loading bird data...</p>
          </div>
        )}

        {!currentList ? (
          <WelcomeScreen onStartList={handleStartList} />
        ) : (
          <ActiveListView
            list={currentList}
            onComplete={handleCompleteList}
            onCancel={handleCancelList}
          >
            <SightingsTable
              sightings={currentList.sightings}
              birds={birds}
              onAddSighting={addSighting}
              onRemoveSighting={removeSighting}
              onUpdateSighting={handleUpdateSighting}
            />
          </ActiveListView>
        )}
      </main>
    </div>
  );
}

export default App;
