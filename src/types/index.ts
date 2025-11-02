/**
 * Core type definitions for Voice Birder application
 */

/**
 * Represents a single bird sighting observation
 */
export interface BirdSighting {
  /** Unique identifier for this sighting */
  id: string;
  /** Common name of the bird species */
  commonName: string;
  /** Scientific name of the bird species (optional) */
  scientificName?: string;
  /** eBird species code (4-6 letter code) */
  speciesCode?: string;
  /** Number of individuals observed */
  count: number;
  /** When the sighting was recorded */
  timestamp: Date;
}

/**
 * Reference data for a bird species from eBird
 */
export interface BirdReference {
  /** Common name of the species */
  commonName: string;
  /** Scientific name of the species */
  scientificName: string;
  /** eBird species code */
  speciesCode: string;
  /** Taxonomic category */
  category?: string;
  /** Taxonomic order for sorting */
  taxonOrder?: number;
}

/**
 * Location information for a checklist
 */
export interface Location {
  /** Human-readable location name */
  name: string;
  /** Latitude coordinate (optional) */
  latitude?: number;
  /** Longitude coordinate (optional) */
  longitude?: number;
}

/**
 * eBird observation protocol types
 */
export type Protocol = 'Stationary' | 'Traveling' | 'Casual';

/**
 * Represents a complete bird watching checklist
 */
export interface BirdList {
  /** Unique identifier for this list */
  id: string;
  /** When the birding session started */
  startDate: Date;
  /** When the birding session ended (optional if still active) */
  endDate?: Date;
  /** Location information */
  location: Location;
  /** Array of bird sightings in this list */
  sightings: BirdSighting[];
  /** eBird protocol type */
  protocol: Protocol;
  /** Whether this list is currently active/being recorded */
  isActive: boolean;
  /** Optional notes about the checklist */
  notes?: string;
  /** Duration in minutes (calculated from start/end dates) */
  durationMinutes?: number;
  /** Distance traveled in kilometers (for Traveling protocol) */
  distanceKm?: number;
  /** Whether all species observed were reported */
  allObsReported: boolean;
}

/**
 * Application-wide state
 */
export interface AppState {
  /** The currently active bird list (if any) */
  currentList: BirdList | null;
  /** Historical/completed bird lists */
  historicalLists: BirdList[];
  /** Available bird species for the area (Melbourne) */
  availableBirds: BirdReference[];
  /** Whether the app is actively listening for voice commands */
  isListening: boolean;
  /** Picovoice access key for voice processing */
  picovoiceAccessKey: string;
  /** eBird API key for fetching bird data */
  ebirdApiKey: string;
}

/**
 * User settings and preferences
 */
export interface UserSettings {
  /** Picovoice access key */
  picovoiceAccessKey: string;
  /** eBird API key */
  ebirdApiKey: string;
  /** Default location name */
  defaultLocation: string;
  /** Default protocol for new lists */
  defaultProtocol: Protocol;
  /** Wake word sensitivity (0.0 - 1.0) */
  wakeWordSensitivity: number;
}

/**
 * Voice command inference result from Rhino
 */
export interface VoiceInference {
  /** Whether the inference was understood */
  isUnderstood: boolean;
  /** The intent that was detected */
  intent?: string;
  /** Slots/parameters extracted from the command */
  slots?: {
    birdName?: string;
    count?: string;
  };
}

/**
 * CSV export format for eBird checklist
 */
export interface EBirdCSVRow {
  'Common Name': string;
  'Species Code': string;
  'Count': string;
  'Location Name': string;
  'Date': string; // MM/DD/YYYY
  'Time': string; // HH:MM AM/PM
  'Protocol': string;
  'Duration (Min)': string;
  'All Obs Reported': 'Y' | 'N';
  'Distance Traveled (km)': string;
  'Comments': string;
}

/**
 * Bird data cache structure
 */
export interface BirdCache {
  /** Cached bird reference data */
  data: BirdReference[];
  /** Timestamp when data was last fetched (no auto expiry) */
  lastFetched: number;
}
