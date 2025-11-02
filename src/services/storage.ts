/**
 * LocalStorage service for persisting application data
 * All data is stored in the browser's LocalStorage for offline functionality
 */

import type { BirdList, BirdCache, UserSettings } from '../types';

// Storage keys
const STORAGE_KEYS = {
  CURRENT_LIST: 'voicebirder_current_list',
  HISTORICAL_LISTS: 'voicebirder_historical_lists',
  BIRD_CACHE: 'voicebirder_bird_cache',
  ACCESS_KEY: 'voicebirder_access_key',
  EBIRD_API_KEY: 'voicebirder_ebird_api_key',
  SETTINGS: 'voicebirder_settings',
} as const;

/**
 * Default user settings
 */
const DEFAULT_SETTINGS: UserSettings = {
  picovoiceAccessKey: '',
  ebirdApiKey: '',
  defaultLocation: 'Melbourne, Victoria',
  defaultProtocol: 'Stationary',
  wakeWordSensitivity: 0.5,
};

/**
 * Serialize data to JSON string, handling Date objects
 */
function serialize<T>(data: T): string {
  return JSON.stringify(data);
}

/**
 * Deserialize JSON string to typed data, handling Date objects
 */
function deserialize<T>(json: string): T {
  return JSON.parse(json, (_key, value) => {
    // Convert ISO date strings back to Date objects
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
      return new Date(value);
    }
    return value;
  });
}

/**
 * Get item from LocalStorage
 */
function getItem<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(key);
    if (item === null) return null;
    return deserialize<T>(item);
  } catch (error) {
    console.error(`Error reading from localStorage (${key}):`, error);
    return null;
  }
}

/**
 * Set item in LocalStorage
 */
function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, serialize(value));
  } catch (error) {
    console.error(`Error writing to localStorage (${key}):`, error);
  }
}

/**
 * Remove item from LocalStorage
 */
function removeItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing from localStorage (${key}):`, error);
  }
}

// === Current List Management ===

export function getCurrentList(): BirdList | null {
  return getItem<BirdList>(STORAGE_KEYS.CURRENT_LIST);
}

export function saveCurrentList(list: BirdList): void {
  setItem(STORAGE_KEYS.CURRENT_LIST, list);
}

export function clearCurrentList(): void {
  removeItem(STORAGE_KEYS.CURRENT_LIST);
}

// === Historical Lists Management ===

export function getHistoricalLists(): BirdList[] {
  return getItem<BirdList[]>(STORAGE_KEYS.HISTORICAL_LISTS) || [];
}

export function saveHistoricalList(list: BirdList): void {
  const lists = getHistoricalLists();
  lists.push(list);
  setItem(STORAGE_KEYS.HISTORICAL_LISTS, lists);
}

export function saveHistoricalLists(lists: BirdList[]): void {
  setItem(STORAGE_KEYS.HISTORICAL_LISTS, lists);
}

export function deleteHistoricalList(listId: string): void {
  const lists = getHistoricalLists();
  const filtered = lists.filter(list => list.id !== listId);
  saveHistoricalLists(filtered);
}

export function clearHistoricalLists(): void {
  removeItem(STORAGE_KEYS.HISTORICAL_LISTS);
}

// === Bird Data Cache Management ===

export function getBirdCache(): BirdCache | null {
  return getItem<BirdCache>(STORAGE_KEYS.BIRD_CACHE);
}

export function saveBirdCache(cache: BirdCache): void {
  setItem(STORAGE_KEYS.BIRD_CACHE, cache);
}

export function clearBirdCache(): void {
  removeItem(STORAGE_KEYS.BIRD_CACHE);
}

// === API Keys Management ===

export function getPicovoiceAccessKey(): string {
  return getItem<string>(STORAGE_KEYS.ACCESS_KEY) || '';
}

export function savePicovoiceAccessKey(key: string): void {
  setItem(STORAGE_KEYS.ACCESS_KEY, key);
}

export function getEBirdApiKey(): string {
  return getItem<string>(STORAGE_KEYS.EBIRD_API_KEY) || '';
}

export function saveEBirdApiKey(key: string): void {
  setItem(STORAGE_KEYS.EBIRD_API_KEY, key);
}

// === Settings Management ===

export function getSettings(): UserSettings {
  const stored = getItem<UserSettings>(STORAGE_KEYS.SETTINGS);
  return stored || DEFAULT_SETTINGS;
}

export function saveSettings(settings: UserSettings): void {
  setItem(STORAGE_KEYS.SETTINGS, settings);
}

export function updateSettings(updates: Partial<UserSettings>): void {
  const current = getSettings();
  saveSettings({ ...current, ...updates });
}

// === Clear All Data ===

export function clearAllData(): void {
  Object.values(STORAGE_KEYS).forEach(key => {
    removeItem(key);
  });
}

/**
 * Get storage size estimate in bytes
 */
export function getStorageSize(): number {
  let total = 0;
  for (const key of Object.values(STORAGE_KEYS)) {
    const item = localStorage.getItem(key);
    if (item) {
      total += item.length + key.length;
    }
  }
  return total;
}

/**
 * Export all data as JSON for backup
 */
export function exportAllData(): string {
  const data = {
    currentList: getCurrentList(),
    historicalLists: getHistoricalLists(),
    birdCache: getBirdCache(),
    settings: getSettings(),
    exportDate: new Date().toISOString(),
  };
  return serialize(data);
}

/**
 * Import data from backup JSON
 */
export function importAllData(json: string): boolean {
  try {
    const data = deserialize<{
      currentList: BirdList | null;
      historicalLists: BirdList[];
      birdCache: BirdCache | null;
      settings: UserSettings;
    }>(json);

    if (data.currentList) saveCurrentList(data.currentList);
    if (data.historicalLists) saveHistoricalLists(data.historicalLists);
    if (data.birdCache) saveBirdCache(data.birdCache);
    if (data.settings) saveSettings(data.settings);

    return true;
  } catch (error) {
    console.error('Error importing data:', error);
    return false;
  }
}
