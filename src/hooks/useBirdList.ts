/**
 * Custom hook for managing bird list state and operations
 */

import { useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { BirdList, BirdSighting, Location, Protocol } from '../types';
import {
  getCurrentList,
  saveCurrentList,
  clearCurrentList,
  saveHistoricalList,
  getHistoricalLists,
} from '../services/storage';

export interface UseBirdListReturn {
  currentList: BirdList | null;
  historicalLists: BirdList[];
  startNewList: (location: Location, protocol?: Protocol) => void;
  addSighting: (commonName: string, count: number, speciesCode?: string, scientificName?: string) => void;
  updateSighting: (sightingId: string, updates: Partial<BirdSighting>) => void;
  removeSighting: (sightingId: string) => void;
  incrementSighting: (commonName: string) => void;
  completeList: (notes?: string) => void;
  cancelList: () => void;
  refreshHistoricalLists: () => void;
}

/**
 * Hook for managing the current bird list and historical lists
 */
export function useBirdList(): UseBirdListReturn {
  const [currentList, setCurrentList] = useState<BirdList | null>(() => getCurrentList());
  const [historicalLists, setHistoricalLists] = useState<BirdList[]>(() => getHistoricalLists());

  // Sync to localStorage whenever currentList changes
  useEffect(() => {
    if (currentList) {
      saveCurrentList(currentList);
    } else {
      clearCurrentList();
    }
  }, [currentList]);

  /**
   * Start a new bird list
   */
  const startNewList = useCallback((location: Location, protocol: Protocol = 'Stationary') => {
    const newList: BirdList = {
      id: uuidv4(),
      startDate: new Date(),
      location,
      sightings: [],
      protocol,
      isActive: true,
      allObsReported: false,
    };
    setCurrentList(newList);
  }, []);

  /**
   * Add a new bird sighting to the current list
   */
  const addSighting = useCallback(
    (commonName: string, count: number, speciesCode?: string, scientificName?: string) => {
      if (!currentList) {
        console.warn('Cannot add sighting: no active list');
        return;
      }

      const newSighting: BirdSighting = {
        id: uuidv4(),
        commonName,
        scientificName,
        speciesCode,
        count,
        timestamp: new Date(),
      };

      setCurrentList({
        ...currentList,
        sightings: [...currentList.sightings, newSighting],
      });
    },
    [currentList]
  );

  /**
   * Update an existing sighting
   */
  const updateSighting = useCallback(
    (sightingId: string, updates: Partial<BirdSighting>) => {
      if (!currentList) return;

      setCurrentList({
        ...currentList,
        sightings: currentList.sightings.map(sighting =>
          sighting.id === sightingId ? { ...sighting, ...updates } : sighting
        ),
      });
    },
    [currentList]
  );

  /**
   * Remove a sighting from the current list
   */
  const removeSighting = useCallback(
    (sightingId: string) => {
      if (!currentList) return;

      setCurrentList({
        ...currentList,
        sightings: currentList.sightings.filter(sighting => sighting.id !== sightingId),
      });
    },
    [currentList]
  );

  /**
   * Increment the count of an existing sighting or add a new one
   * This is useful for voice commands like "Another magpie"
   */
  const incrementSighting = useCallback(
    (commonName: string) => {
      if (!currentList) return;

      const normalizedName = commonName.toLowerCase().trim();
      const existingSighting = currentList.sightings.find(
        s => s.commonName.toLowerCase() === normalizedName
      );

      if (existingSighting) {
        updateSighting(existingSighting.id, { count: existingSighting.count + 1 });
      } else {
        addSighting(commonName, 1);
      }
    },
    [currentList, updateSighting, addSighting]
  );

  /**
   * Complete the current list and save it to history
   */
  const completeList = useCallback(
    (notes?: string) => {
      if (!currentList) return;

      const completedList: BirdList = {
        ...currentList,
        endDate: new Date(),
        isActive: false,
        notes,
        durationMinutes: currentList.endDate
          ? Math.round((new Date().getTime() - currentList.startDate.getTime()) / 60000)
          : undefined,
      };

      // Save to historical lists
      saveHistoricalList(completedList);
      setHistoricalLists(prev => [...prev, completedList]);

      // Clear current list
      setCurrentList(null);
      clearCurrentList();
    },
    [currentList]
  );

  /**
   * Cancel the current list without saving
   */
  const cancelList = useCallback(() => {
    setCurrentList(null);
    clearCurrentList();
  }, []);

  /**
   * Refresh historical lists from storage
   */
  const refreshHistoricalLists = useCallback(() => {
    setHistoricalLists(getHistoricalLists());
  }, []);

  return {
    currentList,
    historicalLists,
    startNewList,
    addSighting,
    updateSighting,
    removeSighting,
    incrementSighting,
    completeList,
    cancelList,
    refreshHistoricalLists,
  };
}
