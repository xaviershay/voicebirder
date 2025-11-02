# Picovoice Model Files

This directory contains the trained Picovoice model files needed for voice recognition.

## Files

### Context Files (User-trained)
- `Birds_en_wasm_v3_0_0.rhn` - Rhino context for bird names (trained from birdSighting.rhn.yaml)
- `Record_en_wasm_v3_0_0.ppn` - Porcupine wake word "Record" (trained on Picovoice Console)

### Base Model Files (Picovoice Standard)
- `rhino_params.pv` - Rhino base model (downloaded from https://github.com/Picovoice/rhino/raw/master/lib/common/rhino_params.pv)
- `porcupine_params.pv` - Porcupine base model (downloaded from https://github.com/Picovoice/porcupine/raw/master/lib/common/porcupine_params.pv)

## Regenerating Model Files

### To update base models:
```bash
curl -L -o public/models/rhino_params.pv https://github.com/Picovoice/rhino/raw/master/lib/common/rhino_params.pv
curl -L -o public/models/porcupine_params.pv https://github.com/Picovoice/porcupine/raw/master/lib/common/porcupine_params.pv
```

### To regenerate context files:
1. Run: `npx tsx scripts/generateRhinoContext.ts` to create updated YAML
2. Upload `birdSighting.rhn.yaml` to https://console.picovoice.ai/
3. Train for Web (WASM) platform
4. Download and replace `Birds_en_wasm_v3_0_0.rhn`

### To regenerate wake word:
1. Go to https://console.picovoice.ai/ (Porcupine section)
2. Train wake word "Record" for Web (WASM)
3. Download and replace `Record_en_wasm_v3_0_0.ppn`

## File Sizes
- rhino_params.pv: ~2.1 MB
- porcupine_params.pv: ~962 KB
- Birds context: ~48 KB
- Record wake word: ~4.4 KB

**Total: ~3.1 MB**
