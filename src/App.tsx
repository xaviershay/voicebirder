/**
 * Main application component
 */

import { Header } from './components/Header';
import { WelcomeScreen } from './components/WelcomeScreen';
import { ActiveListView } from './components/ActiveListView';
import { SightingsTable } from './components/SightingsTable';
import { useBirdList } from './hooks/useBirdList';
import type { Location, Protocol } from './types';
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
      <Header isListening={false} isRecording={false} />

      <main className="app__main">
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
