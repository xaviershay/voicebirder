# Voice Birder

A mobile-first web application for recording bird sightings using voice commands. Built with React, TypeScript, and Picovoice voice processing.

## Current Status: Phase 1 Complete ✅

### Completed Features

- ✅ React + TypeScript + Vite project setup
- ✅ Complete directory structure with TypeScript types
- ✅ LocalStorage service for offline data persistence
- ✅ Custom hooks for state management (`useBirdList`, `useLocalStorage`)
- ✅ Mobile-first responsive UI components:
  - Header with status indicators
  - Welcome screen with checklist creation
  - Active list view with session details
  - Sightings table with manual bird entry
- ✅ Core functionality:
  - Start new bird lists
  - Add bird sightings manually
  - Update sighting counts
  - Remove sightings
  - Complete and save lists to history
  - Cancel active lists

### Project Structure

```
src/
├── components/         # React UI components
│   ├── Header.tsx
│   ├── WelcomeScreen.tsx
│   ├── ActiveListView.tsx
│   └── SightingsTable.tsx
├── hooks/             # Custom React hooks
│   ├── useLocalStorage.ts
│   └── useBirdList.ts
├── services/          # Business logic services
│   └── storage.ts
├── types/             # TypeScript type definitions
│   └── index.ts
├── utils/             # Utility functions (empty for now)
├── App.tsx            # Main application component
└── main.tsx           # Application entry point
```

## Getting Started

### Prerequisites

- Node.js v18.19.0 or higher
- npm 9.2.0 or higher

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at http://localhost:5173/

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## How to Use (Current Phase 1)

1. **Start a New List**
   - Enter a location name (default: Melbourne, Victoria)
   - Select a protocol (Stationary, Traveling, or Casual)
   - Click "Start New List"

2. **Add Bird Sightings**
   - Click "+ Add Bird" button
   - Enter the bird's common name
   - Enter the count (number of individuals)
   - Click "Add"

3. **Manage Sightings**
   - Use +/- buttons to adjust counts
   - Click × to remove a sighting
   - View sightings sorted by time (newest first)

4. **Complete the List**
   - Click "Complete List" when done birding
   - The list is saved to browser LocalStorage
   - You can start a new list

5. **Cancel a List**
   - Click "Cancel" to discard the current list without saving

## Next Steps: Phase 2 - Bird Data & eBird Integration

Before proceeding with Phase 2, you'll need:

### 🛑 REQUIRED: eBird API Key

1. Visit https://ebird.org/api/keygen
2. Register or log in to your eBird account
3. Request an API key (free for personal use)
4. Save the key for the next phase

### Phase 2 Tasks (Not Yet Started)

- Fetch Melbourne bird species from eBird API
- Create bird data fetching service
- Implement bird name normalization and fuzzy matching
- Cache bird data in LocalStorage
- Add autocomplete/suggestions for bird names

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 5
- **Styling**: CSS Modules with mobile-first design
- **Date Handling**: date-fns
- **Unique IDs**: uuid
- **Voice Processing** (upcoming): Picovoice (Porcupine + Rhino)

## Features Roadmap

### ✅ Phase 1: Project Setup & Basic UI (Complete)
- Basic UI and manual bird entry
- LocalStorage persistence
- Mobile-responsive design

### 📋 Phase 2: Bird Data & eBird Integration
- Fetch Melbourne bird species
- Bird name validation and suggestions

### 📋 Phase 3: Rhino Context Creation
- Create custom speech-to-intent context
- Train Rhino model with Melbourne birds

### 📋 Phase 4: Porcupine Wake Word Setup
- Train "Record" wake word

### 📋 Phase 5: Voice Command Integration
- Implement wake word detection
- Add voice-based bird recording

### 📋 Phase 6: eBird Export Functionality
- Export checklists as eBird-compatible CSV

### 📋 Phase 7: UI/UX Polish
- Voice interaction animations
- Accessibility improvements
- Performance optimization

### 📋 Phase 8: Testing & Documentation
- Real-world testing
- User documentation
- Deployment preparation

## Browser Compatibility

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

Required browser features:
- LocalStorage
- ES2020 support
- (Future) IndexedDB for Picovoice
- (Future) Web Audio API for microphone access

## Privacy

All data is stored locally in your browser:
- Bird lists stored in LocalStorage
- No data sent to external servers (except eBird API for bird species list)
- Voice processing will run entirely client-side when implemented

## License

Private project - all rights reserved.

## Contributing

This is a personal project. For questions or issues, please contact the project owner.

---

**Last Updated**: November 1, 2025
**Phase**: 1 of 8 Complete
**Next Milestone**: Obtain eBird API Key for Phase 2
