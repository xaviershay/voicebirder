# Voice Model Training Instructions

## Overview
You need to train two models on the Picovoice Console:
1. **Rhino Context** - Understands bird names and counts
2. **Porcupine Wake Word** - Detects the "Record" activation word

## Prerequisites
- ✅ Picovoice account (console.picovoice.ai)
- ✅ Access Key (stored in `.picovoice_key`)
- ✅ Generated `birdSighting.rhn.yaml` file

---

## Part 1: Train Rhino Context (Speech-to-Intent)

### Step 1: Upload Context
1. Go to https://console.picovoice.ai/
2. Log in with your account
3. Navigate to **"Rhino"** in the left sidebar
4. Click **"Create New Context"**

### Step 2: Configure Context
1. **Context Name**: `birdSighting`
2. **Platform**: Select **"Web (WASM)"**
3. **Upload File**: Click "Upload YAML" and select `birdSighting.rhn.yaml` from this directory

### Step 3: Train Context
1. Review the YAML structure (should show ~260 bird species)
2. Click **"Train Context"**
3. Wait for training to complete (typically 2-10 minutes)
4. You'll get an email when it's ready

### Step 4: Download Trained Files
Once training is complete:
1. Download the **context file**: `birdSighting_wasm.rhn`
2. Download the **model file**: `rhino_params.pv` (if not already downloaded)

**Save these files** - we'll integrate them in the next step.

---

## Part 2: Train Porcupine Wake Word

### Step 1: Create Wake Word
1. In Picovoice Console, navigate to **"Porcupine"** in the left sidebar
2. Click **"Train Wake Word"**

### Step 2: Configure Wake Word
1. **Wake Phrase**: Enter `Record`
2. **Platform**: Select **"Web (WASM)"**
3. Click **"Train"**

### Step 3: Wait for Training
1. Training typically takes 1-5 minutes
2. You'll get an email when ready

### Step 4: Download Trained Files
Once training is complete:
1. Download the **keyword file**: `Record_wasm.ppn`
2. Download the **model file**: `porcupine_params.pv` (if not already downloaded)

**Save these files** - we'll integrate them next.

---

## Alternative Wake Words (Optional)

If "Record" doesn't work well, you can train alternatives:
- **"Bird"** - Simple, one syllable
- **"Mark bird"** - Two syllables, more distinct
- **"Add bird"** - Clearer intent

To train an alternative, repeat Part 2 with your chosen phrase.

---

## Next Steps

Once you have all the trained files:
1. `birdSighting_wasm.rhn` (Rhino context)
2. `rhino_params.pv` (Rhino model)
3. `Record_wasm.ppn` (Porcupine keyword)
4. `porcupine_params.pv` (Porcupine model)

**Place them in this directory** and let me know. I'll integrate them into the app.

---

## Expected File Sizes (Approximate)
- `birdSighting_wasm.rhn`: ~500KB-2MB
- `rhino_params.pv`: ~1-2MB
- `Record_wasm.ppn`: ~50-100KB
- `porcupine_params.pv`: ~1-2MB

---

## Troubleshooting

### YAML Upload Fails
- Check that the file is valid YAML format
- Ensure you selected "Web (WASM)" as platform
- Try refreshing the console page

### Training Takes Too Long
- Normal training: 2-10 minutes
- If >15 minutes, check your email for completion notice
- If >30 minutes, contact Picovoice support

### Can't Download Files
- Make sure training is 100% complete
- Check your downloads folder
- Try a different browser

---

## Questions?
If you encounter any issues during training, let me know and I'll help troubleshoot!
