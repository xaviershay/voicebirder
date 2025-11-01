# Voice Birder - Implementation Plan

## Project Overview
Voice Birder is a mobile-first web application that allows birders to record bird sightings using voice commands. It uses Picovoice's Porcupine (wake word detection) and Rhino (speech-to-intent) engines to provide an offline, hands-free eBird checklist creation experience.

## Technology Stack

### Core Technologies
- **Frontend Framework**: React 18+ with TypeScript
- **Voice Processing**: 
  - `@picovoice/porcupine-react` - Wake word detection
  - `@picovoice/rhino-react` - Speech-to-intent processing
  - `@picovoice/web-voice-processor` - Audio processing
- **Storage**: Browser LocalStorage for offline data persistence
- **Styling**: CSS Modules or Tailwind CSS for mobile-first responsive design
- **Build Tool**: Vite for fast development and optimized production builds

### Browser Requirements
- Chrome/Edge, Firefox, Safari (all modern versions)
- IndexedDB support (required by Picovoice)
- WebWorkers support (required by Picovoice)
- Microphone access via Web Audio API

## API Research Summary

### Picovoice APIs

#### Porcupine (Wake Word Detection)
- **Purpose**: Detect the wake word "Record" to activate voice command listening
- **Key Features**:
  - Runs entirely client-side/offline
  - Custom wake words can be trained via Picovoice Console
  - Returns detection events when wake word is heard
- **Implementation**: Uses `usePorcupine()` React hook
- **Access**: Requires free Picovoice Access Key from console.picovoice.ai

#### Rhino (Speech-to-Intent)
- **Purpose**: Parse bird name + count from spoken commands
- **Key Features**:
  - Directly infers intent from speech (no intermediate text conversion)
  - Custom contexts defined via YAML and trained in Picovoice Console
  - Supports slots (variables) in context definitions
  - 97%+ accuracy, works offline
- **Implementation**: Uses `useRhino()` React hook
- **Context Structure**: Will define slots for bird names and optional counts

### eBird API

#### Getting Bird Lists
- **API**: eBird API 2.0 (https://documenter.getpostman.com/view/664302/S1ENwy59)
- **Endpoint**: `/ref/taxonomy/ebird` - Get full taxonomy
- **Regional Filter**: Can filter by region code (e.g., `AU` for Australia, `AU-VIC` for Victoria)
- **Endpoint**: `/data/obs/geo/recent` - Get recent observations by location
- **API Key**: Free but requires registration at ebird.org
- **Rate Limits**: Reasonable limits for personal use

#### eBird Checklist Format
Based on eBird documentation, checklists can be created in CSV format with these fields:
- Common Name (required)
- Species Code (4-6 letter code)
- Count (number or 'X' for present)
- Location Name
- Date
- Time
- Duration (minutes)
- All Obs Reported (Y/N)
- Distance Traveled (km)
- Area Covered (hectares)
- Protocol (e.g., "Traveling", "Stationary")
- Comments

**Note**: For import into eBird, the format should follow their CSV template which can be downloaded from: https://ebird.org/submit (Record Format options)

## Architecture & Data Flow

### Application State Structure

```typescript
interface BirdSighting {
  id: string;
  commonName: string;
  scientificName?: string;
  speciesCode?: string;
  count: number;
  timestamp: Date;
}

interface BirdList {
  id: string;
  startDate: Date;
  endDate?: Date;
  location: {
    name: string;
    latitude?: number;
    longitude?: number;
  };
  sightings: BirdSighting[];
  protocol: 'Stationary' | 'Traveling' | 'Casual';
  isActive: boolean;
}

interface AppState {
  currentList: BirdList | null;
  historicalLists: BirdList[];
  availableBirds: BirdReference[]; // Melbourne area birds
  isListening: boolean;
  picovoiceAccessKey: string;
}
```

### Component Hierarchy

```
App
├── Header
│   └── Status indicators (listening, recording)
├── WelcomeScreen (if no active list)
│   └── StartListButton
├── ActiveListView (if list active)
│   ├── ListHeader (date, time, location)
│   ├── SightingsTable
│   │   └── SightingRow[] (species, count, time)
│   ├── VoiceControls
│   │   ├── WakeWordStatus
│   │   └── InferenceDisplay
│   └── CompleteListButton
├── SettingsPanel (collapsible)
│   ├── AccessKeyInput
│   ├── LocationSelector
│   ├── RefreshBirdDataButton
│   └── BirdListManager
└── DownloadModal
    └── Export checklist as CSV
```

## Implementation Phases

> **Note for AI Implementation**: This plan includes clearly marked **🛑 HUMAN REQUIRED** interruption points where human assistance is needed for API keys, account creation, or model training that cannot be automated. The AI should pause at these points and request the necessary information or files from the human before proceeding.

### Phase 1: Project Setup & Basic UI (Week 1)
**Goal**: Create project structure and basic UI without voice features

**AI Automation Level**: ✅ Fully Automated

#### Tasks:
1. **Initialize React + TypeScript + Vite project**
   ```bash
   npm create vite@latest voice-birder -- --template react-ts
   cd voice-birder
   npm install
   ```

2. **Install dependencies**
   ```bash
   npm install @picovoice/porcupine-react @picovoice/rhino-react @picovoice/web-voice-processor
   npm install date-fns uuid
   npm install -D @types/uuid
   ```

3. **Create directory structure**
   ```
   src/
   ├── components/
   │   ├── Header.tsx
   │   ├── WelcomeScreen.tsx
   │   ├── ActiveListView.tsx
   │   ├── SightingsTable.tsx
   │   ├── VoiceControls.tsx
   │   └── DownloadModal.tsx
   ├── hooks/
   │   ├── useLocalStorage.ts
   │   ├── useBirdList.ts
   │   └── useVoiceCommands.ts
   ├── services/
   │   ├── storage.ts
   │   ├── ebirdApi.ts
   │   └── csvExport.ts
   ├── types/
   │   └── index.ts
   ├── utils/
   │   └── birdData.ts
   └── App.tsx
   ```

4. **Implement basic UI components**
   - Start List button with date/time capture
   - Sightings table with manual add functionality (for testing)
   - Complete List button
   - Mobile-first responsive layout

5. **Implement LocalStorage service**
   - Save/load current list
   - Save/load historical lists
   - Clear storage utility

**Deliverable**: Working app that can create lists and add birds manually

---

### Phase 2: Bird Data & eBird Integration (Week 1-2)
**Goal**: Fetch and manage Melbourne bird species data

**AI Automation Level**: ⚠️ Requires Human Input

#### 🛑 HUMAN REQUIRED - Before Phase 2
**What's needed**: eBird API Key
**Instructions for human**:
1. Go to https://ebird.org/api/keygen
2. Register or log in to your eBird account
3. Request an API key (free for personal use)
4. Provide the API key to the AI when prompted

**AI Action**: Once API key is received, store it securely in environment variables and proceed with implementation.

#### Tasks:
1. **Research and obtain eBird API access**
   - ✅ AI will test API endpoints once key is provided
   - Test endpoint: `/ref/taxonomy/ebird?fmt=json` for full species list
   - Test endpoint: `/data/obs/AU-VIC/recent` for Melbourne area birds
   
2. **Create bird data fetching service**
   - Endpoint: `/ref/taxonomy/ebird?fmt=json` for full species list
   - Endpoint: `/data/obs/AU-VIC/recent` for Melbourne area birds
   - Cache results in LocalStorage permanently (no expiry)
   - Only refresh when user explicitly requests via "Refresh Bird Data" button
   - Handle offline scenarios with cached data

3. **Create Melbourne bird database**
   - Extract common names, scientific names, species codes
   - Filter to ~200-300 most common Melbourne birds
   - Store as JSON fallback if API unavailable
   - Consider frequency data to prioritize common species

4. **Implement bird name normalization**
   - Handle variations (e.g., "magpie" vs "Australian Magpie")
   - Create mapping for common abbreviations
   - Fuzzy matching for voice recognition errors

**Deliverable**: App with Melbourne bird data ready for voice commands

---

### Phase 3: Rhino Context Creation (Week 2)
**Goal**: Create and train custom Rhino context for bird sightings

**AI Automation Level**: ⚠️ Requires Human Input

#### 🛑 HUMAN REQUIRED - Before Phase 3
**What's needed**: Picovoice Account & Access Key
**Instructions for human**:
1. Go to https://console.picovoice.ai/signup
2. Create a free account
3. Navigate to the Dashboard and copy your **Access Key**
4. Provide the Access Key to the AI

**AI Action**: Store the Access Key for later use in the application.

---

#### 🛑 HUMAN REQUIRED - During Phase 3 (Context Training)
**What's needed**: Trained Rhino Context Files
**AI will provide**: Complete YAML context definition with all Melbourne bird species

**Instructions for human**:
1. AI will generate a complete `birdSighting.rhn.yaml` file with ~200-300 Melbourne birds
2. Go to https://console.picovoice.ai/
3. Navigate to Rhino Speech-to-Intent
4. Click "Create New Context"
5. Upload the YAML file provided by AI
6. Set platform to: **Web (WASM)**
7. Click "Train Context"
8. Wait for training to complete (~2-10 minutes)
9. Download the trained `.rhn` context file
10. Also download the `rhino_params.pv` model file (if not already available)
11. Provide both files back to the AI

**AI Action**: Once files are received, the AI will:
- Place files in `public/models/` directory OR
- Convert to base64 using `npx pvbase64` and integrate into the codebase

#### Tasks:
1. **✅ AI will design complete Rhino context YAML**
   
   **Context Name**: `birdSighting`
   
   **Intents**:
   - `addBird`: Add a bird sighting
   
   **Slots**:
   - `$count`: Optional number (one, two, three, 1, 2, 3, etc.)
   - `$birdName`: Required bird species name
   
   **YAML structure** (AI will generate complete file):
   ```yaml
   context:
     expressions:
       addBird:
         - "[I saw] [$count:count] $birdName:birdName"
         - "[$count:count] $birdName:birdName"
         - "$birdName:birdName [$count:count]"
         - "add $birdName:birdName [$count:count]"
     slots:
       count:
         - one
         - two
         - three
         - four
         - five
         - (1..100) # numeric range
       birdName:
         # AI will populate with ~200-300 Melbourne birds
         - Australian Magpie
         - Magpie Lark
         - Rainbow Lorikeet
         - Sulphur-crested Cockatoo
         # ... (full list generated by AI)
   ```

2. **✅ AI will convert model files once received**
   ```bash
   # Convert to base64 for easier deployment
   npx pvbase64 -i birdSighting.rhn -o src/models/birdContext.js
   npx pvbase64 -i rhino_params.pv -o src/models/rhinoModel.js
   ```
   
   Or use publicPath method (copy files to `public/models/`)

**Deliverable**: Trained Rhino context ready for integration

---

### Phase 4: Porcupine Wake Word Setup (Week 2)
**Goal**: Train and integrate "Record" wake word

**AI Automation Level**: ⚠️ Requires Human Input

#### 🛑 HUMAN REQUIRED - During Phase 4 (Wake Word Training)
**What's needed**: Trained Porcupine Wake Word Files
**Prerequisites**: Same Picovoice account from Phase 3

**Instructions for human**:
1. Go to https://console.picovoice.ai/
2. Navigate to Porcupine Wake Word
3. Click "Train Wake Word"
4. Enter wake phrase: **"Record"** (or suggest alternative)
5. Set platform to: **Web (WASM)**
6. Click "Train"
7. Wait for training to complete (~1-5 minutes)
8. Download the `.ppn` keyword file (e.g., `Record_wasm.ppn`)
9. Also download `porcupine_params.pv` model file (if not already available)
10. Provide both files back to the AI

**Optional - Test Alternative Wake Words**:
If "Record" has accuracy issues, the human can train alternatives:
- "Bird" (simpler, one syllable)
- "Mark bird" (two syllables, distinct)
- "Add bird" (clearer intent)

**AI Action**: Once files are received, the AI will:
- Convert to base64 or place in public directory
- Integrate into voice command workflow
- Set initial sensitivity to 0.5 (adjustable later)

#### Tasks:
1. **✅ AI will integrate wake word files once received**

2. **✅ AI will convert wake word model**
   ```bash
   npx pvbase64 -i Record_wasm.ppn -o src/models/recordKeyword.js
   npx pvbase64 -i porcupine_params.pv -o src/models/porcupineModel.js
   ```

3. **⚠️ Test wake word sensitivity (requires human testing)**
   - Adjust sensitivity setting (0.0 - 1.0)
   - Test in various noise conditions
   - Balance false positives vs false negatives

**Deliverable**: Custom "Record" wake word ready for integration

---

### Phase 5: Voice Command Integration (Week 3)
**Goal**: Integrate Porcupine + Rhino for voice bird recording

**AI Automation Level**: ✅ Fully Automated (after Phase 3 & 4 models are provided)

**Prerequisites**: 
- ✅ Picovoice Access Key from Phase 3
- ✅ Rhino context files from Phase 3
- ✅ Porcupine wake word files from Phase 4

#### Tasks:
1. **Create `useVoiceCommands` custom hook**
   ```typescript
   interface VoiceCommandsHook {
     isWakeWordActive: boolean;
     isListeningForCommand: boolean;
     lastInference: RhinoInference | null;
     error: string | null;
     startWakeWordDetection: () => Promise<void>;
     stopWakeWordDetection: () => Promise<void>;
     processInference: () => Promise<void>;
   }
   ```

2. **Implement wake word detection flow**
   - Initialize Porcupine when list is started
   - Listen continuously for "Record" wake word
   - Show visual indicator when wake word detected
   - Automatically trigger Rhino processing

3. **Implement speech-to-intent flow**
   - Initialize Rhino on wake word detection
   - Process audio until endpoint detected
   - Extract bird name and count from inference
   - Stop Rhino, return to wake word listening

4. **Connect voice commands to bird list**
   - Parse Rhino inference results
   - Add/increment bird sighting in current list
   - Show confirmation UI
   - Handle errors and unclear commands

5. **Handle edge cases**
   - Unknown bird names
   - Unclear audio
   - Multiple wake words in quick succession
   - Browser permission issues

**Deliverable**: Fully functional voice bird recording

---

### Phase 6: eBird Export Functionality (Week 3)
**Goal**: Export completed lists in eBird-compatible format

**AI Automation Level**: ✅ Fully Automated

#### Tasks:
1. **Research eBird CSV import format**
   - Download example from eBird website
   - Identify required vs optional fields
   - Test import manually

2. **Implement CSV export service**
   ```typescript
   interface EBirdCSVRow {
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
   ```

3. **Create download functionality**
   - Generate CSV from bird list
   - Create Blob with proper encoding
   - Trigger browser download
   - Filename format: `ebird_checklist_YYYYMMDD_HHMMSS.csv`

4. **Add metadata collection**
   - Location name input
   - Protocol selection (Stationary/Traveling/Casual)
   - Duration calculation (auto from start/end time)
   - "Complete checklist" checkbox

**Deliverable**: Export checklists to eBird-compatible CSV

---

### Phase 7: UI/UX Polish (Week 4)
**Goal**: Improve user experience and mobile optimization

**AI Automation Level**: ✅ Mostly Automated (human testing recommended)

#### Tasks:
1. **Mobile-first responsive design**
   - Test on various screen sizes
   - Optimize touch targets (minimum 44x44px)
   - Implement swipe gestures for common actions
   - Ensure landscape mode works

2. **Visual feedback for voice interactions**
   - Animated microphone icon when listening
   - Wake word detection pulse animation
   - Speech processing indicator
   - Success/error toasts for commands

3. **Accessibility improvements**
   - ARIA labels for voice status
   - Keyboard navigation support
   - Screen reader announcements
   - High contrast mode support

4. **Performance optimization**
   - Lazy load Picovoice models
   - Minimize re-renders
   - Optimize IndexedDB usage
   - Add loading states

5. **Error handling & user guidance**
   - Microphone permission flow
   - Clear error messages
   - Onboarding tutorial
   - Voice command examples

**Deliverable**: Polished, mobile-ready application

---

### Phase 8: Testing & Documentation (Week 4)
**Goal**: Ensure reliability and provide user documentation

**AI Automation Level**: ⚠️ Requires Human Testing

#### 🛑 HUMAN REQUIRED - Testing Phase
**What's needed**: Real-world testing and feedback

**Instructions for human**:
1. Test the application on actual mobile devices:
   - iOS Safari (if available)
   - Android Chrome (if available)
   - Desktop browsers
2. Test voice recognition with your actual voice:
   - Say the wake word "Record" multiple times
   - Try various bird name pronunciations
   - Test with different counts
3. Test in different environments:
   - Quiet indoor space
   - Outdoor with background noise
   - While walking (if testing mobile)
4. Report any issues to AI:
   - Wake word false positives/negatives
   - Misrecognized bird names
   - UI problems on mobile
   - Battery drain concerns

**AI Action**: Based on feedback, AI will adjust:
- Wake word sensitivity settings
- Bird name matching fuzzy logic
- UI responsive breakpoints
- Error handling for edge cases

#### Tasks:
1. **⚠️ Testing (requires human)**
   - Test on real mobile devices (iOS Safari, Android Chrome)
   - Test offline functionality
   - Test with various accents
   - Test in noisy environments
   - Test battery usage during extended recording

2. **✅ Documentation (AI automated)**
   - User guide (how to use voice commands)
   - Setup guide (Picovoice Access Key)
   - Common bird names reference
   - Troubleshooting guide
   - Privacy policy (data stays local)

3. **✅ Code quality (AI automated)**
   - Add TypeScript types everywhere
   - Add JSDoc comments
   - Code review and refactoring
   - Remove console.logs

4. **⚠️ Deployment preparation (human decision required)**
   - ✅ AI will configure for production build
   - ✅ AI will optimize bundle size
   - ⚠️ Human chooses hosting platform (Vercel, Netlify, GitHub Pages, etc.)
   - ⚠️ Human sets up HTTPS (required for microphone access)
   - ⚠️ Human deploys to chosen platform

**Deliverable**: Production-ready application with documentation

---

## Technical Considerations

### Picovoice Model Management

**Option 1: Base64 (Recommended for small deployment)**
- Pros: Works without server, easier deployment
- Cons: ~33% larger file size, embedded in JS bundle
- Use Case: When models + contexts < 5MB total

**Option 2: Public Directory**
- Pros: Smaller initial bundle, models cached separately
- Cons: Requires web server (no file:// URLs)
- Use Case: Larger contexts with many bird species

### LocalStorage Structure

```javascript
// Keys
{
  "voicebirder_current_list": BirdList | null,
  "voicebirder_historical_lists": BirdList[],
  "voicebirder_bird_cache": {
    data: BirdReference[],
    lastFetched: number // timestamp, no expiry
  },
  "voicebirder_access_key": string,
  "voicebirder_settings": UserSettings
}
```

### Bird Name Matching Strategy

1. **Exact match**: Compare lowercase common name
2. **Species code match**: Use eBird 4-6 letter codes
3. **Fuzzy match**: Levenshtein distance < 2 for typos
4. **Keyword match**: "cockatoo" matches "Sulphur-crested Cockatoo"
5. **Confirmation UI**: Show top 3 matches if uncertain

### Offline-First Considerations

- Pre-load all Picovoice models on first use
- Cache Melbourne bird list permanently (no automatic expiry)
- User can manually refresh bird data via settings if needed
- Store historical lists indefinitely
- Show network status indicator
- Warn before clearing cache

### Performance Targets

- Initial load: < 3 seconds
- Wake word detection latency: < 100ms
- Speech processing: < 1 second after endpoint
- Max memory usage: < 100MB
- Battery impact: Minimal (use Web Audio API efficiently)

## Security & Privacy

### Privacy Guarantees
- All voice processing happens locally (zero network calls)
- No audio is recorded or transmitted
- Bird lists stored only in browser LocalStorage
- User can export and delete all data

### Access Key Management
- Picovoice Access Key stored in LocalStorage (not sensitive data)
- No server-side API keys needed
- eBird API key only used for fetching public bird data

## Future Enhancements (Post-MVP)

1. **GPS Integration**: Auto-detect location for accurate eBird submissions
2. **Photo Attachments**: Add photos to sightings (Macaulay Library integration)
3. **Voice Notes**: Allow voice memos for specific sightings
4. **Rare Bird Alerts**: Highlight unusual species for the area
5. **Multi-language Support**: Support Spanish, French, etc.
6. **PWA Features**: Install as app, background sync
7. **BirdNET Integration**: Automated species identification from recordings
8. **Custom Checklists**: Support different birding protocols
9. **Social Features**: Share lists with birding groups
10. **Statistics Dashboard**: Personal birding stats and charts

## Risk Mitigation

### Technical Risks

1. **Risk**: Voice recognition accuracy in noisy environments
   - **Mitigation**: Clearly document best usage conditions, add noise reduction tips

2. **Risk**: Limited bird species in Rhino context (~500 slot limit)
   - **Mitigation**: Focus on Melbourne's 200-300 most common species, allow manual entry fallback

3. **Risk**: Browser compatibility issues
   - **Mitigation**: Test on all major browsers, provide compatibility checker

4. **Risk**: Large model files affecting load time
   - **Mitigation**: Use lazy loading, show progress indicator, optimize with base64 vs public path

### User Experience Risks

1. **Risk**: Confusion about voice command format
   - **Mitigation**: Clear onboarding, example commands, visual feedback

2. **Risk**: Battery drain on mobile
   - **Mitigation**: Pause wake word detection when app backgrounded, optimize audio processing

3. **Risk**: Loss of data if LocalStorage cleared
   - **Mitigation**: Frequent export reminders, backup to device storage option

## Development Timeline Summary

- **Week 1**: Project setup, basic UI, LocalStorage
- **Week 2**: Bird data, Picovoice model training
- **Week 3**: Voice integration, CSV export
- **Week 4**: Polish, testing, documentation

**Total Estimated Time**: 4 weeks (assuming part-time ~20 hrs/week)

## Success Criteria

1. User can start a new bird list with one button press
2. User can say "Record" to activate voice listening
3. User can say bird names with counts and they're accurately logged
4. User can complete a list and download eBird-compatible CSV
5. App works entirely offline after initial load
6. App is responsive and usable on mobile phones
7. Voice recognition accuracy > 85% in quiet conditions

## Resources & Links

### Picovoice
- Console: https://console.picovoice.ai/
- Porcupine React Docs: https://github.com/Picovoice/porcupine/tree/master/binding/react
- Rhino React Docs: https://github.com/Picovoice/rhino/tree/master/binding/react
- Web Voice Processor: https://github.com/Picovoice/web-voice-processor

### eBird
- API Documentation: https://documenter.getpostman.com/view/664302/S1ENwy59
- eBird Australia: https://ebird.org/australia/home
- Taxonomy API: https://ebird.org/ws2.0/ref/taxonomy/ebird
- Regional data: https://ebird.org/data/download

### Development Tools
- React + TypeScript: https://react.dev/
- Vite: https://vitejs.dev/
- TypeScript: https://www.typescriptlang.org/

### Melbourne Bird Resources
- BirdLife Australia: https://birdlife.org.au/
- eBird Melbourne hotspots: https://ebird.org/hotspots?env.minX=144&env.minY=-38&env.maxX=145.5&env.maxY=-37.5

## Quick Reference: Human Intervention Points

| Phase | What Human Provides | When Needed | Estimated Time |
|-------|-------------------|-------------|----------------|
| **Phase 2** | eBird API Key | Before starting Phase 2 | 5 minutes |
| **Phase 3** | Picovoice Access Key | Before starting Phase 3 | 5 minutes |
| **Phase 3** | Trained Rhino `.rhn` + `.pv` files | After AI provides YAML | 15-20 minutes |
| **Phase 4** | Trained Porcupine `.ppn` + `.pv` files | During Phase 4 | 10-15 minutes |
| **Phase 8** | Real-world testing & feedback | Testing phase | 1-2 hours |
| **Phase 8** | Deployment platform & hosting setup | Final deployment | 30-60 minutes |

**Total Human Time Required**: ~3-4 hours spread across development

---

## AI Implementation Workflow

### Step 1: Begin Phase 1 (Fully Automated)
AI will create the complete project structure, install dependencies, and implement basic UI.

### Step 2: Pause for eBird API Key
AI will pause before Phase 2 and request:
```
🛑 HUMAN REQUIRED: Please provide your eBird API key.
Get it from: https://ebird.org/api/keygen
Reply with: EBIRD_API_KEY=your_key_here
```

### Step 3: Continue Phase 2 (Automated)
AI will test API, fetch Melbourne bird data, and prepare bird database.

### Step 4: Pause for Picovoice Access Key
AI will pause before Phase 3 and request:
```
🛑 HUMAN REQUIRED: Please provide your Picovoice Access Key.
1. Sign up at: https://console.picovoice.ai/signup
2. Copy your Access Key from the dashboard
Reply with: PICOVOICE_ACCESS_KEY=your_key_here
```

### Step 5: Generate Rhino Context YAML
AI will create complete `birdSighting.rhn.yaml` file and request:
```
🛑 HUMAN REQUIRED: Please train the Rhino context.
1. I've generated: birdSighting.rhn.yaml
2. Upload it to: https://console.picovoice.ai/ (Rhino section)
3. Platform: Web (WASM)
4. Train and download the .rhn file
5. Also download: rhino_params.pv
Reply with file paths or upload the files.
```

### Step 6: Train Porcupine Wake Word
AI will request:
```
🛑 HUMAN REQUIRED: Please train the wake word.
1. Go to: https://console.picovoice.ai/ (Porcupine section)
2. Wake phrase: "Record"
3. Platform: Web (WASM)
4. Train and download the .ppn file
5. Also download: porcupine_params.pv (if not already available)
Reply with file paths or upload the files.
```

### Step 7: Continue Phases 5-7 (Mostly Automated)
AI will integrate everything and create the complete application.

### Step 8: Request Testing & Deployment
AI will request human testing and gather feedback, then prepare for deployment.

---

## Next Steps for AI

1. ✅ **Start Phase 1** - Set up project structure (no human input needed)
2. 🛑 **Pause** - Request eBird API key from human
3. ✅ **Continue Phase 2** - Fetch bird data
4. 🛑 **Pause** - Request Picovoice Access Key
5. ✅ **Generate YAML** - Create complete Rhino context definition
6. 🛑 **Pause** - Wait for human to train & provide Rhino models
7. 🛑 **Pause** - Wait for human to train & provide Porcupine models
8. ✅ **Integrate** - Complete voice command functionality
9. 🛑 **Pause** - Request human testing & feedback
10. ✅ **Finalize** - Polish and prepare for deployment

---

**Document Version**: 2.0  
**Last Updated**: November 1, 2025  
**Changes**: Added human interruption points and AI workflow guidance  
**Author**: Implementation Plan for Voice Birder Application
