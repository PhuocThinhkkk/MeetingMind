"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  TranscriptionWord,
  RealtimeTranscriptChunk,
  AudioChunk,
} from "@/types/transcription";

const SAMPLE_RATE = 16000;
const CHUNK_MS = 128;
const CHUNK_SIZE = (SAMPLE_RATE * 2 * CHUNK_MS) / 1000;

interface UseRealtimeTranscriptionProps {
  onTranscriptUpdate?: (words: TranscriptionWord[]) => void;
  onError?: (error: string) => void;
  onStatusChange?: (
    status: "idle" | "connecting" | "recording" | "processing" | "error"
  ) => void;
}

export function useRealtimeTranscription({
  onTranscriptUpdate,
  onError,
  onStatusChange,
}: UseRealtimeTranscriptionProps = {}) {
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "connecting" | "recording" | "processing" | "error"
  >("idle");
  const [transcriptWords, setTranscriptWords] = useState<TranscriptionWord[]>(
    []
  );

  const wsRef = useRef<WebSocket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isAssemblyReady = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const audioBufferRef = useRef<Uint8Array[]>([]);
  let totalByteLength = 0;

  const updateStatus = useCallback(
    (newStatus: typeof status) => {
      setStatus(newStatus);
      onStatusChange?.(newStatus);
    },
    [onStatusChange]
  );

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
            console.log("Assembly is ready!");
            isAssemblyReady.current = true;
          } else {
            const data: RealtimeTranscriptChunk = res;
            const newWords: TranscriptionWord[] = data.words.map(
              (word, index) => ({
                text: word.text,
                word_is_final: word.word_is_final,
                start: word.start,
                end: word.end,
                confidence: word.confidence
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
                const stableCount = prev.filter((w) => w.word_is_final).length;
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
    clearTranscript();
    updateStatus("connecting");
    connectWebSocket();

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;
    
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const audioContext = new AudioContextClass();
    audioContextRef.current = audioContext;

    await audioContext.audioWorklet.addModule("/worklet-processor.js");

    const source = audioContext.createMediaStreamSource(stream);
    const workletNode = new AudioWorkletNode(audioContext, "pcm-processor");

    
    workletNode.port.onmessage = (event) => {
      if (
        event.data instanceof ArrayBuffer &&
        wsRef.current?.readyState === WebSocket.OPEN &&
        isAssemblyReady.current
      ) {
        const chunk = new Uint8Array(event.data);
        audioBufferRef.current.push(chunk);
        totalByteLength += chunk.byteLength;

        if (totalByteLength >= 1800) {
          const merged = new Uint8Array(totalByteLength);
          let offset = 0;
          for (const part of audioBufferRef.current) {
            merged.set(part, offset);
            offset += part.length;
          }

          // Send to Assembly
          wsRef.current.send(merged.buffer);
          console.log("Sent merged chunk:", merged.byteLength);

          // Reset buffer
          audioBufferRef.current = [];
          totalByteLength = 0;
        }
      }
    };

    source.connect(workletNode).connect(audioContext.destination);
    workletNodeRef.current = workletNode;

    setIsRecording(true);
  }, [connectWebSocket, updateStatus, onError]);

  const stopRecording = useCallback(() => {
    setIsRecording(false);
    updateStatus("processing");
    console.log("stop recording")

    isAssemblyReady.current = false;

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    workletNodeRef.current = null


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

  useEffect(() => {
    return () => {
      if (isRecording) {
        console.log("curpit")
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
    clearTranscript,
  };
}
