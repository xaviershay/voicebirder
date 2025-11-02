/**
 * Custom hook for voice commands using Picovoice (Porcupine + Rhino)
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { usePorcupine } from '@picovoice/porcupine-react';
import { useRhino } from '@picovoice/rhino-react';
import { getPicovoiceAccessKey } from '../services/storage';
import { findBirdByRhinoName, type BirdNameMapping } from '../utils/birdNameMapping';

export interface VoiceInference {
  isUnderstood: boolean;
  birdName?: string;
  count?: number;
  ebirdCommonName?: string;
  scientificName?: string;
  speciesCode?: string;
}

export interface UseVoiceCommandsReturn {
  isWakeWordActive: boolean;
  isListeningForCommand: boolean;
  error: string | null;
  startVoiceCommands: () => Promise<void>;
  stopVoiceCommands: () => void;
}

// State machine states
type VoiceState = 'IDLE' | 'WAITING_FOR_WAKEWORD' | 'LISTENING_FOR_INTENT';

/**
 * Hook for managing voice commands with Porcupine + Rhino
 */
export function useVoiceCommands(
  birdMapping: BirdNameMapping[],
  onBirdDetected?: (inference: VoiceInference) => void
): UseVoiceCommandsReturn {
  const [voiceState, setVoiceState] = useState<VoiceState>('IDLE');
  const [error, setError] = useState<string | null>(null);
  const [accessKey, setAccessKey] = useState<string>('');

  // Refs to track IDs and prevent duplicate processing
  const lastWakeWordIdRef = useRef<string | null>(null);
  const listeningTimeoutRef = useRef<number | null>(null);

  // Load access key
  useEffect(() => {
    const key = getPicovoiceAccessKey();
    if (key) {
      setAccessKey(key);
    }
  }, []);

  // Porcupine wake word detection
  const {
    keywordDetection: wakeWordDetection,
    isLoaded: isPorcupineLoaded,
    isListening: isPorcupineListening,
    error: porcupineError,
    init: initPorcupine,
    start: startPorcupine,
    stop: stopPorcupine,
    release: releasePorcupine,
  } = usePorcupine();

  // Rhino speech-to-intent
  const {
    inference,
    isLoaded: isRhinoLoaded,
    error: rhinoError,
    init: initRhino,
    process: processRhino,
    release: releaseRhino,
  } = useRhino();

  // Clear listening timeout
  const clearListeningTimeout = useCallback(() => {
    if (listeningTimeoutRef.current) {
      clearTimeout(listeningTimeoutRef.current);
      listeningTimeoutRef.current = null;
    }
  }, []);

  // Reset to waiting for wake word state
  const resetToWaitingForWakeWord = useCallback(() => {
    console.log('[Voice] Resetting to WAITING_FOR_WAKEWORD state');
    clearListeningTimeout();
    setVoiceState('WAITING_FOR_WAKEWORD');

    // Start Porcupine if not already listening
    //if (isPorcupineLoaded && !isPorcupineListening) {
    //  console.log('[Porcupine] Starting...');
    //  startPorcupine();
    //}
  }, [isPorcupineLoaded, isPorcupineListening, startPorcupine, clearListeningTimeout]);


  // Handle wake word detection
  useEffect(() => {
    if (wakeWordDetection !== null && wakeWordDetection.label === 'Record') {
      console.log("[Porcupine] Wake word detected!");
      setVoiceState('LISTENING_FOR_INTENT');
      processRhino();

      clearListeningTimeout();
      listeningTimeoutRef.current = setTimeout(() => {
        console.log('[Rhino] Timeout - no intent detected');
        setLastInference({ isUnderstood: false });
        resetToWaitingForWakeWord();
      }, 5000);
      /*
      // Ignore wake words when in IDLE state
      if (voiceState === 'IDLE') {
        return;
      }

      const wakeWordId = JSON.stringify(wakeWordDetection);

      // Skip if we've already processed this exact wake word
      if (lastWakeWordIdRef.current === wakeWordId) {
        return;
      }

      console.log('[Porcupine] Wake word detected!');
      lastWakeWordIdRef.current = wakeWordId;

      if (voiceState === 'WAITING_FOR_WAKEWORD') {
        // Normal flow: start Rhino
        startRhinoListening();
      } else if (voiceState === 'LISTENING_FOR_INTENT') {
        // Wake word during Rhino: reset Rhino (stop and restart)
        console.log('[Voice] Wake word detected while listening - resetting Rhino');
        startRhinoListening();
      }
        */
    }
  }, [wakeWordDetection]);

  useEffect(() => {
    if (inference !== null) {
      clearListeningTimeout();
      setVoiceState('WAITING_FOR_WAKEWORD');
      console.log(inference);
      if (inference.isUnderstood && inference.intent === 'addBird') {
        const rhinoBirdName = inference.slots?.birdName;
        const count = inference.slots?.count ? parseInt(inference.slots.count, 10) : 1;

        if (rhinoBirdName) {
          // Map Rhino name back to eBird data
          const birdData = findBirdByRhinoName(birdMapping, rhinoBirdName);

          const voiceInference: VoiceInference = {
            isUnderstood: true,
            birdName: rhinoBirdName,
            count: isNaN(count) ? 1 : count,
            ebirdCommonName: birdData?.ebirdCommonName,
            scientificName: birdData?.scientificName,
            speciesCode: birdData?.speciesCode,
          };

          // Notify callback exactly once
          if (onBirdDetected) {
            onBirdDetected(voiceInference);
          }
        }
      } else {
        //setLastInference({ isUnderstood: false });
      }
    }
  }, [inference]);
  /*
  // Handle Rhino inference
  useEffect(() => {
    if (inference !== null && voiceState === 'LISTENING_FOR_INTENT') {
      const inferenceId = JSON.stringify(inference);

      // Skip if we've already processed this exact inference
      if (lastInferenceIdRef.current === inferenceId) {
        return;
      }

      console.log('[Rhino] Inference received:', inference);
      lastInferenceIdRef.current = inferenceId;
      clearListeningTimeout();

      if (inference.isUnderstood && inference.intent === 'addBird') {
        const rhinoBirdName = inference.slots?.birdName;
        const count = inference.slots?.count ? parseInt(inference.slots.count, 10) : 1;

        if (rhinoBirdName) {
          // Map Rhino name back to eBird data
          const birdData = findBirdByRhinoName(birdMapping, rhinoBirdName);

          const voiceInference: VoiceInference = {
            isUnderstood: true,
            birdName: rhinoBirdName,
            count: isNaN(count) ? 1 : count,
            ebirdCommonName: birdData?.ebirdCommonName,
            scientificName: birdData?.scientificName,
            speciesCode: birdData?.speciesCode,
          };

          console.log('[Voice] Processing bird:', voiceInference);
          setLastInference(voiceInference);

          // Notify callback exactly once
          if (onBirdDetected) {
            onBirdDetected(voiceInference);
          }
        }
      } else {
        setLastInference({ isUnderstood: false });
      }

      // Return to waiting for wake word
      resetToWaitingForWakeWord();
    }
  }, [inference, voiceState, birdMapping, onBirdDetected, clearListeningTimeout, resetToWaitingForWakeWord]);
*/

  // Handle errors
  useEffect(() => {
    if (porcupineError) {
      console.error('[Porcupine] Error:', porcupineError);
      setError(`Wake word error: ${porcupineError}`);
    }
  }, [porcupineError]);

  useEffect(() => {
    if (rhinoError) {
      console.error('[Rhino] Error:', rhinoError);
      setError(`Speech recognition error: ${rhinoError}`);
    }
  }, [rhinoError]);

  // Start voice commands
  const startVoiceCommands = useCallback(async () => {
    if (!accessKey) {
      setError('Picovoice access key not set. Please configure in settings.');
      return;
    }

    try {
      console.log('[Voice] Starting voice commands...');

      // Reset all speech-related state
      setError(null);
      lastWakeWordIdRef.current = null;
      clearListeningTimeout();

      // Initialize Porcupine (wake word)
      await initPorcupine(
        accessKey,
        { publicPath: '/models/Record_en_wasm_v3_0_0.ppn', label: 'Record' },
        { publicPath: '/models/porcupine_params.pv' }
      );

      // Initialize Rhino (speech-to-intent)
      await initRhino(
        accessKey,
        { publicPath: '/models/Birds_en_wasm_v3_0_0.rhn' },
        { publicPath: '/models/rhino_params.pv' }
      );

      // Start listening for wake word
      console.log('[Porcupine] Starting...');
      await startPorcupine();
      setVoiceState('WAITING_FOR_WAKEWORD');

      console.log('[Voice] Voice commands started - waiting for wake word');
    } catch (err) {
      console.error('[Voice] Failed to start:', err);
      setError(`Failed to start: ${err instanceof Error ? err.message : String(err)}`);
      setVoiceState('IDLE');
    }
  }, [accessKey, initPorcupine, initRhino, startPorcupine, clearListeningTimeout, isRhinoLoaded]);

  // Stop voice commands
  const stopVoiceCommands = useCallback(() => {
    console.log('[Voice] Stopping voice commands...');

    // Reset all speech-related state
    clearListeningTimeout();
    lastWakeWordIdRef.current = null;

    // Stop and release both engines
    if (isPorcupineListening) {
      console.log('[Porcupine] Stopping...');
      stopPorcupine();
    }
    releasePorcupine();
    releaseRhino();

    setVoiceState('IDLE');
    console.log('[Voice] Voice commands stopped');
  }, [isPorcupineListening, stopPorcupine, releasePorcupine, releaseRhino, clearListeningTimeout]);

  return {
    isWakeWordActive: voiceState !== 'IDLE',
    isListeningForCommand: voiceState === 'LISTENING_FOR_INTENT',
    error,
    startVoiceCommands,
    stopVoiceCommands,
  };
}
