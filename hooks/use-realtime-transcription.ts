'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { TranscriptionWord, RealtimeTranscriptChunk, AudioChunk, BeginMsg } from '@/types/transcription';
import { create, ConverterType } from '@alexanderolsen/libsamplerate-js';
import { convertFloat32ToInt16 } from '@/lib/utils';

const SAMPLE_RATE = 16000;
const CHUNK_MS = 128;
const CHUNK_SIZE = SAMPLE_RATE * 2 * CHUNK_MS / 1000; 

interface UseRealtimeTranscriptionProps {
  onTranscriptUpdate?: (words: TranscriptionWord[]) => void;
  onError?: (error: string) => void;
  onStatusChange?: (status: 'idle' | 'connecting' | 'recording' | 'processing' | 'error') => void;
}

export function useRealtimeTranscription({
  onTranscriptUpdate,
  onError,
  onStatusChange
}: UseRealtimeTranscriptionProps = {}) {
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'recording' | 'processing' | 'error'>('idle');
  const [transcriptWords, setTranscriptWords] = useState<TranscriptionWord[]>([]);
  
  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef< AudioWorkletNode| null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<AudioChunk[]>([]);
  const isAssemblyReady = useRef(false)
  let resampledBuffer: Float32Array[] = [];

  const updateStatus = useCallback((newStatus: typeof status) => {
    setStatus(newStatus);
    onStatusChange?.(newStatus);
  }, [onStatusChange]);

  function waitFor( timeout = 5000): Promise<void> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
    console.log("Waited 2 seconds!");
  }, 2000);
  })
}


  const connectWebSocket = useCallback(() => {
    const wsUrl =
      process.env.NEXT_PUBLIC_WS_SERVER_URL || "ws://localhost:8080";
    try {
      wsRef.current = new WebSocket(`${wsUrl}/ws`);

      if (!wsRef?.current) {
        console.log("no ws current yet.");
        return;
      }
      wsRef.current.onopen = () => {
        console.log("WebSocket connected");
        updateStatus("recording");
      };

      wsRef.current.onmessage = (event) => {
        try {
          const res = JSON.parse(event.data);
          if (res.type === "ready") {
            console.log("Assembly is ready!")
            isAssemblyReady.current = true;
          } else {
            const data: RealtimeTranscriptChunk = res;
            const newWords: TranscriptionWord[] = data.words.map(
              (word, index) => ({
                text: word,
                timestamp: Date.now() + index * 100, // Approximate timing
                isStable: data.isEndOfTurn,
                confidence: data.isEndOfTurn ? 0.9 : 0.7, // will change later
              })
            );

            setTranscriptWords((prev) => {
              if (data.isEndOfTurn) {
                const stableWords = [
                  ...prev.slice(0, -newWords.length),
                  ...newWords,
                ];
                if (onTranscriptUpdate) onTranscriptUpdate(stableWords);
                else console.error("didnt pass onTransciptUpdate into hook");
                return stableWords;
              } else {
                const stableCount = prev.filter((w) => w.isStable).length;
                const updatedWords = [
                  ...prev.slice(0, stableCount),
                  ...newWords,
                ];
                if (onTranscriptUpdate) onTranscriptUpdate(updatedWords);
                else console.error("didnt pass onTransciptUpdate into hook");
                return updatedWords;
              }
            });
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
          onError?.("Failed to parse transcription data");
        }
      };

      wsRef.current.onerror = (error) => {
        console.error("WebSocket error:", error);
        updateStatus("error");
        onError?.("WebSocket connection failed");
      };

      wsRef.current.onclose = (e) => {
        console.log("WebSocket disconnected", e.reason, e.code);
        if (status === "recording") {
          updateStatus("idle");
        }
      };
    } catch (error) {
      console.error("Failed to connect WebSocket:", error);
      updateStatus("error");
      onError?.("Failed to connect to transcription service");
    }
  }, [status, updateStatus, onError, onTranscriptUpdate]);

  const startRecording = useCallback(async () => {
    try {
      updateStatus("connecting");
      connectWebSocket();

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: { ideal: true },
          noiseSuppression: { ideal: true },
        },
      });

      streamRef.current = stream;

      // Create audio context for processing
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);

      // Create processor for chunking audio
      await audioContextRef.current.audioWorklet.addModule(
        "/audio-processor.js"
      );

      const workletNode = new AudioWorkletNode(
        audioContextRef.current,
        "pcm-processor"
      );

      const nChannels = 1; // mono audio
      const inputSampleRate = 48000; // your AudioContext rate
      const outputSampleRate = 16000; // AssemblyAI expects 16kHz

      // Create the resampler instance (async)
      const resampler = await create(
        nChannels,
        inputSampleRate,
        outputSampleRate,
        {
          converterType: ConverterType.SRC_SINC_BEST_QUALITY, // high quality resampling
        }
      );

      workletNode.port.onmessage = (event) => {
        const ws = wsRef.current;

        if (!ws) {
          console.warn("WebSocket not initialized yet");
          return;
        }

        const float32Chunk = event.data as Float32Array; // Float32Array from AudioWorklet

        // Resample (returns Float32Array at 16kHz)
        const resampledFloat32 = resampler.simple(float32Chunk);

        // Convert Float32 to Int16 PCM
        const int16 = convertFloat32ToInt16(resampledFloat32);

        if (ws.readyState === WebSocket.OPEN && isAssemblyReady.current) {
          ws.send(int16.buffer);
        } else if (ws.CONNECTING === WebSocket.CONNECTING) {
          console.log("wait for connect ws")
        } else {
          console.error("WebSocket is closed or closing—cannot send audio");
        }
      };

      source.connect(workletNode);
      workletNode.connect(audioContextRef.current.destination);
      processorRef.current = workletNode;
      setIsRecording(true);
    } catch (error) {
      console.error("Failed to start recording:", error);
      updateStatus("error");
      onError?.("Failed to access microphone");
    }
  }, [connectWebSocket, updateStatus, onError]);

  const stopRecording = useCallback(() => {
    setIsRecording(false);
    updateStatus("processing");

    // Flush any remaining samples in the processor
    if (processorRef.current instanceof AudioWorkletNode) {
      processorRef.current.port.postMessage({ type: "flush" });
    }

    // Clean up audio resources
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setTimeout(() => {
      setTranscriptWords((prev) =>
        prev.map((word) => ({ ...word, isStable: true }))
      );
      updateStatus("idle");
    }, 1000);
  }, [updateStatus]);

  const clearTranscript = useCallback(() => {
    setTranscriptWords([]);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isRecording) {
        stopRecording();
      }
    };
  }, [isRecording, stopRecording]);

  return {
    isRecording,
    status,
    transcriptWords,
    startRecording,
    stopRecording,
    clearTranscript
  };
}