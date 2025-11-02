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
  rhinoNames: string[];
  ebirdCommonName: string;
  scientificName: string;
  speciesCode: string;
}

const EBIRD_API_BASE = 'https://api.ebird.org/v2';

/**
 * Map of specific word replacements for phonetic spelling
 */
const WORD_REPLACEMENTS: Record<string, string> = {
  "Horsfield's": "Horse field's",
  "Fiordland": "Fiord land",
  "Weebill": "Wee bill",
  "Nativehen": "Native hen",
  "Buttonquail": "Button quail",
  "Bassian": "Bass Ian",
  "Baillon's": "Bail on's",
  "Cisticola": "Cyst e cola",
  "Salvin's": "Sell vin's",
  "Myzomela": "My zo mela",
  "Sahul": "Sa Hool",
  "Treecreeper": "Tree creeper",
  "Shrikethrush": "Shrike thrush",
  "Guineafowl": "Guinea fowl",
  "Lewin's": "Lou Inn's",
  "Nanday": "Nan day",
  "Pycroft's": "Pie croft's",
  "Radjah": "Rad jar",
  "Needletail": "Needle tail",
};

/**
 * Suffixes that should be split from compound words
 */
const WORD_SUFFIXES_TO_SPLIT = ['wren', 'lark', 'bird', 'fowl'];

/**
 * Prefixes that should be split from compound words
 */
const WORD_PREFIXES_TO_SPLIT = ['Cuckoo'];

/**
 * Convert eBird name to Rhino-compatible name
 */
function toRhinoName(ebirdName: string): string {
  let name = ebirdName.replace(/-/g, ' ');
  
  // Apply specific word replacements
  for (const [original, replacement] of Object.entries(WORD_REPLACEMENTS)) {
    const regex = new RegExp(`\\b${original}\\b`, 'g');
    name = name.replace(regex, replacement);
  }
  
  // Split single words ending in specific suffixes
  for (const suffix of WORD_SUFFIXES_TO_SPLIT) {
    const regex = new RegExp(`\\b(\\w+${suffix})\\b`, 'gi');
    name = name.replace(regex, (match) => {
      // Only split if it's a single word (no spaces)
      if (!match.includes(' ')) {
        const suffixRegex = new RegExp(`${suffix}$`, 'i');
        return match.replace(suffixRegex, ` ${suffix}`);
      }
      return match;
    });
  }
  
  // Split single words starting with specific prefixes
  for (const prefix of WORD_PREFIXES_TO_SPLIT) {
    const regex = new RegExp(`\\b(${prefix}\\w+)\\b`, 'g');
    name = name.replace(regex, (match) => {
      // Only split if it's a single word (no spaces)
      if (!match.includes(' ')) {
        const prefixRegex = new RegExp(`^${prefix}`, 'i');
        return match.replace(prefixRegex, `${prefix} `);
      }
      return match;
    });
  }
  
  return name;
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
  const possiblyRedundantWords = ['Australian', 'Australasian', 'Eurasian', 'European'];
  
  // First pass: generate base rhino names
  const baseMapping = birds.map(bird => ({
    baseRhinoName: toRhinoName(bird.commonName),
    ebirdCommonName: bird.commonName,
    scientificName: bird.scientificName,
    speciesCode: bird.speciesCode,
  }));
  
  // For each possibly redundant word, check if we can create alternative names
  const alternativeNames = new Map<string, Set<string>>();
  
  for (const word of possiblyRedundantWords) {
    // Find all birds that start with this word
    const birdsWithWord = baseMapping.filter(b => 
      b.baseRhinoName.startsWith(word + ' ')
    );
    
    if (birdsWithWord.length === 0) continue;
    
    // Create alternative names by removing the prefix
    const alternatives = birdsWithWord.map(b => ({
      original: b.baseRhinoName,
      alternative: b.baseRhinoName.substring(word.length + 1), // +1 for the space
      speciesCode: b.speciesCode,
    }));
    
    // Check if all alternatives are unique (no collisions)
    const alternativeSet = new Set(alternatives.map(a => a.alternative.toLowerCase()));
    const allOriginalNames = new Set(baseMapping.map(b => b.baseRhinoName.toLowerCase()));
    
    // Check for collisions with existing bird names
    let hasCollision = false;
    for (const alt of alternatives) {
      const altLower = alt.alternative.toLowerCase();
      // Check if alternative collides with any existing bird name
      if (allOriginalNames.has(altLower)) {
        hasCollision = true;
        break;
      }
    }
    
    // Only add alternatives if they're unique and don't collide
    if (alternativeSet.size === alternatives.length && !hasCollision) {
      for (const alt of alternatives) {
        if (!alternativeNames.has(alt.speciesCode)) {
          alternativeNames.set(alt.speciesCode, new Set());
        }
        alternativeNames.get(alt.speciesCode)!.add(alt.alternative);
      }
    }
  }
  
  // Final mapping with all rhino names (base + alternatives)
  return baseMapping.map(bird => {
    const rhinoNames = [bird.baseRhinoName];
    const alternatives = alternativeNames.get(bird.speciesCode);
    if (alternatives) {
      rhinoNames.push(...Array.from(alternatives));
    }
    
    return {
      rhinoNames,
      ebirdCommonName: bird.ebirdCommonName,
      scientificName: bird.scientificName,
      speciesCode: bird.speciesCode,
    };
  });
}

/**
 * Generate Rhino YAML
 */
function generateRhinoYAML(mapping: BirdNameMapping[]): string {
  // Collect all unique rhino names with their associated bird data
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
