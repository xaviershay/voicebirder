/**
 * eBird API service for fetching bird species data
 */

import type { BirdReference, BirdCache } from '../types';
import { getBirdCache, saveBirdCache, getEBirdApiKey } from './storage';

const EBIRD_API_BASE = 'https://api.ebird.org/v2';

/**
 * Fetch bird species from eBird API
 * Uses regional filter for Australia (Victoria) to get Melbourne area birds
 */
export async function fetchBirdSpecies(apiKey: string, forceRefresh = false): Promise<BirdReference[]> {
  // Check cache first unless force refresh
  if (!forceRefresh) {
    const cache = getBirdCache();
    if (cache && cache.data.length > 0) {
      console.log('Using cached bird data');
      return cache.data;
    }
  }

  if (!apiKey || apiKey.trim() === '') {
    throw new Error('eBird API key is required');
  }

  try {
    // Fetch Australia (Victoria) regional species
    // This gives us Melbourne area birds
    const response = await fetch(
      `${EBIRD_API_BASE}/product/spplist/AU-VIC`,
      {
        headers: {
          'X-eBirdApiToken': apiKey,
        },
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Invalid eBird API key. Please check your settings.');
      }
      throw new Error(`eBird API error: ${response.status} ${response.statusText}`);
    }

    const speciesCodes: string[] = await response.json();

    // Now fetch the full taxonomy to get common/scientific names
    const taxonomyResponse = await fetch(
      `${EBIRD_API_BASE}/ref/taxonomy/ebird?fmt=json&species=${speciesCodes.join(',')}`,
      {
        headers: {
          'X-eBirdApiToken': apiKey,
        },
      }
    );

    if (!taxonomyResponse.ok) {
      throw new Error(`eBird taxonomy API error: ${taxonomyResponse.status}`);
    }

    interface EBirdTaxonomyEntry {
      sciName: string;
      comName: string;
      speciesCode: string;
      category: string;
      taxonOrder: number;
    }

    const taxonomy: EBirdTaxonomyEntry[] = await taxonomyResponse.json();

    // Convert to our BirdReference format
    const birds: BirdReference[] = taxonomy
      .filter(bird => bird.category === 'species') // Only species, not subspecies/hybrids
      .map(bird => ({
        commonName: bird.comName,
        scientificName: bird.sciName,
        speciesCode: bird.speciesCode,
        category: bird.category,
        taxonOrder: bird.taxonOrder,
      }))
      .sort((a, b) => a.commonName.localeCompare(b.commonName));

    // Cache the results
    const cache: BirdCache = {
      data: birds,
      lastFetched: Date.now(),
    };
    saveBirdCache(cache);

    console.log(`Fetched ${birds.length} bird species from eBird`);
    return birds;
  } catch (error) {
    console.error('Error fetching bird species:', error);
    throw error;
  }
}

/**
 * Get bird species from cache or fetch from API
 */
export async function getBirdSpecies(forceRefresh = false): Promise<BirdReference[]> {
  const apiKey = getEBirdApiKey();
  return fetchBirdSpecies(apiKey, forceRefresh);
}

/**
 * Search birds by common name (for autocomplete)
 * Returns matches sorted by relevance
 */
export function searchBirds(birds: BirdReference[], query: string, limit = 10): BirdReference[] {
  if (!query || query.trim() === '') {
    return [];
  }

  const normalizedQuery = query.toLowerCase().trim();

  // Filter and score matches
  const matches = birds
    .filter(bird => bird.commonName.toLowerCase().includes(normalizedQuery))
    .map(bird => {
      const commonLower = bird.commonName.toLowerCase();
      let score = 0;

      // Exact match (highest priority)
      if (commonLower === normalizedQuery) {
        score = 1000;
      }
      // Starts with query (high priority)
      else if (commonLower.startsWith(normalizedQuery)) {
        score = 100;
      }
      // Word starts with query
      else if (commonLower.split(/\s+/).some(word => word.startsWith(normalizedQuery))) {
        score = 50;
      }
      // Contains query
      else {
        score = 10;
      }

      return { bird, score };
    })
    .sort((a, b) => {
      // Sort by score descending, then alphabetically
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.bird.commonName.localeCompare(b.bird.commonName);
    })
    .slice(0, limit)
    .map(match => match.bird);

  return matches;
}

/**
 * Find exact bird match by common name
 */
export function findBirdByName(birds: BirdReference[], commonName: string): BirdReference | undefined {
  const normalized = commonName.toLowerCase().trim();
  return birds.find(bird => bird.commonName.toLowerCase() === normalized);
}
