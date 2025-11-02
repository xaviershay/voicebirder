/**
 * Utility for mapping between Rhino voice names and eBird species data
 */

import type { BirdReference } from '../types';

/**
 * Convert eBird common name to Rhino-compatible name (no hyphens)
 */
export function toRhinoName(ebirdName: string): string {
  return ebirdName.replace(/-/g, ' ');
}

/**
 * Mapping entry structure
 */
export interface BirdNameMapping {
  rhinoName: string;
  ebirdCommonName: string;
  scientificName: string;
  speciesCode: string;
}

/**
 * Generate mapping from eBird bird references
 */
export function generateMapping(birds: BirdReference[]): BirdNameMapping[] {
  return birds.map(bird => ({
    rhinoName: toRhinoName(bird.commonName),
    ebirdCommonName: bird.commonName,
    scientificName: bird.scientificName,
    speciesCode: bird.speciesCode,
  }));
}

/**
 * Find bird by Rhino name
 */
export function findBirdByRhinoName(
  mapping: BirdNameMapping[],
  rhinoName: string
): BirdNameMapping | undefined {
  const normalized = rhinoName.toLowerCase().trim();
  return mapping.find(m => m.rhinoName.toLowerCase() === normalized);
}

/**
 * Generate Rhino YAML content from mapping
 */
export function generateRhinoYAML(mapping: BirdNameMapping[]): string {
  const sortedBirds = [...mapping].sort((a, b) =>
    a.rhinoName.localeCompare(b.rhinoName)
  );

  const birdNamesList = sortedBirds
    .map(m => `      - ${m.rhinoName}`)
    .join('\n');

  return `context:
  expressions:
    addBird:
      - "[$pv.TwoDigitInteger:count] $birdName:birdName"
      - "$birdName:birdName [$pv.TwoDigitInteger:count]"
  slots:
    birdName:
${birdNamesList}
`;
}
