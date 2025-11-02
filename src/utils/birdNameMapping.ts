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
  rhinoNames: string[];
  ebirdCommonName: string;
  scientificName: string;
  speciesCode: string;
}

/**
 * Generate mapping from eBird bird references
 */
export function generateMapping(birds: BirdReference[]): BirdNameMapping[] {
  return birds.map(bird => ({
    rhinoNames: [toRhinoName(bird.commonName)],
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
  return mapping.find(m => 
    m.rhinoNames.some(name => name.toLowerCase() === normalized)
  );
}

/**
 * Generate Rhino YAML content from mapping
 */
export function generateRhinoYAML(mapping: BirdNameMapping[]): string {
  // Collect all unique rhino names
  const allRhinoNames: string[] = [];
  
  for (const bird of mapping) {
    allRhinoNames.push(...bird.rhinoNames);
  }
  
  // Sort all rhino names alphabetically
  const sortedNames = [...new Set(allRhinoNames)].sort((a, b) =>
    a.localeCompare(b)
  );

  const birdNamesList = sortedNames
    .map(name => `      - ${name}`)
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
