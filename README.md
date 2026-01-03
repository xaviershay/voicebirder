# Voice Birder

A proof-of-concept mobile-first web application for recording bird sightings using voice commands. Built with React, TypeScript, and Picovoice voice processing.

While the core birding loop works well, it's not going to work because:

* Need to be able to maintain microphone recording even when phone is locked, which doesn't appear to be possible.
* Can't submit automatically to eBird, no API.
* While Picovoice worked well, their licensing doesn't and they were completely
  unresponsive when I tried to contact them. Tried using more open source models
  (see `sherpa` branch) but didn't get very far.

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
bin/dev
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

### 🛑 REQUIRED: eBird API Key

1. Visit https://ebird.org/api/keygen
2. Register or log in to your eBird account
3. Request an API key (free for personal use)