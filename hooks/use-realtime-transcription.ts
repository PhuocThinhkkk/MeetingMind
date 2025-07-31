"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  TranscriptionWord,
  RealtimeTranscriptChunk,
  AudioChunk,
} from "@/types/transcription";
import RecordRTC, { StereoAudioRecorder } from 'recordrtc';

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
  const recorderRef = useRef<unknown>(null)

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
    updateStatus("connecting");
    connectWebSocket();

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true
    });
    streamRef.current = stream;

    recorderRef.current = new RecordRTC(stream, {
      type: "audio",
      mimeType: "audio/webm;codecs=pcm_s16le",
      recorderType: StereoAudioRecorder,
      desiredSampRate: SAMPLE_RATE,
      numberOfAudioChannels: 1,
      timeSlice: 50,
      bufferSize: 4096,
      ondataavailable: async (blob : unknown) => {
        if (
          wsRef.current?.readyState === WebSocket.OPEN &&
          isAssemblyReady.current
        ) {
          // @ts-ignore 
          const buffer = await blob.arrayBuffer()  
          wsRef.current.send(buffer);
          console.log("sent chunk size", buffer.byteLength);
        }
      },
    });
    // @ts-ignore 
    recorderRef.current.startRecording();   
    setIsRecording(true);
  }, [connectWebSocket, updateStatus, onError]);

  const stopRecording = useCallback(() => {
    setIsRecording(false);
    updateStatus("processing");

    isAssemblyReady.current = false;

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    recorderRef.current = null

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
