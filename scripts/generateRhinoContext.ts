/**
 * Script to generate Rhino context YAML and mapping from eBird API
 *
 * Usage: npx tsx scripts/generateRhinoContext.ts
 */

import * as fs from 'fs';
import * as path from 'path';

interface BirdReference {
  commonName: string;
  scientificName: string;
  speciesCode: string;
}

interface BirdNameMapping {
  rhinoName: string;
  ebirdCommonName: string;
  scientificName: string;
  speciesCode: string;
}

const EBIRD_API_BASE = 'https://api.ebird.org/v2';

/**
 * Convert eBird name to Rhino-compatible name
 */
function toRhinoName(ebirdName: string): string {
  return ebirdName.replace(/-/g, ' ');
}

/**
 * Fetch bird species from eBird API
 */
async function fetchMelbourneBirds(apiKey: string): Promise<BirdReference[]> {
  try {
    console.log('Fetching species list for Victoria, Australia...');

    // Fetch Victoria species codes
    const speciesResponse = await fetch(
      `${EBIRD_API_BASE}/product/spplist/AU-VIC`,
      {
        headers: {
          'X-eBirdApiToken': apiKey,
        },
      }
    );

    if (!speciesResponse.ok) {
      throw new Error(`Failed to fetch species list: ${speciesResponse.status}`);
    }

    const speciesCodes: string[] = await speciesResponse.json();
    console.log(`Found ${speciesCodes.length} species codes`);

    // Fetch taxonomy details
    console.log('Fetching taxonomy details...');
    const taxonomyResponse = await fetch(
      `${EBIRD_API_BASE}/ref/taxonomy/ebird?fmt=json&species=${speciesCodes.join(',')}`,
      {
        headers: {
          'X-eBirdApiToken': apiKey,
        },
      }
    );

    if (!taxonomyResponse.ok) {
      throw new Error(`Failed to fetch taxonomy: ${taxonomyResponse.status}`);
    }

    interface EBirdTaxonomyEntry {
      sciName: string;
      comName: string;
      speciesCode: string;
      category: string;
    }

    const taxonomy: EBirdTaxonomyEntry[] = await taxonomyResponse.json();

    // Filter to species only (no subspecies/hybrids)
    const birds: BirdReference[] = taxonomy
      .filter(bird => bird.category === 'species')
      .map(bird => ({
        commonName: bird.comName,
        scientificName: bird.sciName,
        speciesCode: bird.speciesCode,
      }))
      .sort((a, b) => a.commonName.localeCompare(b.commonName));

    console.log(`Processed ${birds.length} species`);
    return birds;
  } catch (error) {
    console.error('Error fetching birds:', error);
    throw error;
  }
}

/**
 * Generate mapping from bird references
 */
function generateMapping(birds: BirdReference[]): BirdNameMapping[] {
  return birds.map(bird => ({
    rhinoName: toRhinoName(bird.commonName),
    ebirdCommonName: bird.commonName,
    scientificName: bird.scientificName,
    speciesCode: bird.speciesCode,
  }));
}

/**
 * Generate Rhino YAML
 */
function generateRhinoYAML(mapping: BirdNameMapping[]): string {
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

/**
 * Main execution
 */
async function main() {
  // Read eBird API key from file
  const apiKeyPath = path.join(process.cwd(), '.ebird_api_key');
  let apiKey = '';

  try {
    apiKey = fs.readFileSync(apiKeyPath, 'utf-8').trim();
    console.log('✓ Loaded eBird API key from .ebird_api_key');
  } catch (error) {
    console.error('Error: Could not read .ebird_api_key file');
    console.log('Please create a .ebird_api_key file with your eBird API key');
    process.exit(1);
  }

  if (!apiKey) {
    console.error('Error: .ebird_api_key file is empty');
    process.exit(1);
  }

  try {
    // Fetch bird data
    const birds = await fetchMelbourneBirds(apiKey);

    // Generate mapping
    const mapping = generateMapping(birds);

    // Save mapping to JSON
    const mappingPath = path.join(process.cwd(), 'bird-name-mapping.json');
    fs.writeFileSync(mappingPath, JSON.stringify(mapping, null, 2));
    console.log(`✓ Saved mapping to ${mappingPath}`);

    // Generate and save Rhino YAML
    const yaml = generateRhinoYAML(mapping);
    const yamlPath = path.join(process.cwd(), 'birdSighting.rhn.yaml');
    fs.writeFileSync(yamlPath, yaml);
    console.log(`✓ Saved Rhino YAML to ${yamlPath}`);

    console.log(`\n✅ Generated files for ${birds.length} bird species`);
    console.log('\nNext steps:');
    console.log('1. Upload birdSighting.rhn.yaml to Picovoice Console');
    console.log('2. Train the context for Web (WASM)');
    console.log('3. Download the trained files');
  } catch (error) {
    console.error('Failed to generate Rhino context:', error);
    process.exit(1);
  }
}

main();
