import { log } from "@/lib/logger";
import {
  useState,
  useRef,
  useCallback,
  useEffect,
  createContext,
  useContext,
} from "react";

import {
  RealtimeTranscriptionWord,
  RealtimeTranscriptChunk,
  RealtimeTranslateResponse,
} from "@/types/transcription.ws";

import { useAuth } from "@/hooks/use-auth";
import { resampleTo16kHz, float32ToInt16 } from "@/lib/transcription"

type RecorderContextType = {
  isRecording: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  clearTranscript: () => void;
  audioBlob: Blob | null;
  status: string;
  transcriptWords: RealtimeTranscriptionWord[];
  translateWords: string[];
  sessionStartTime: Date | null;
  setSessionStartTime: React.Dispatch<React.SetStateAction<Date | null>>;
};

const RecorderContext = createContext<RecorderContextType | undefined>(
  undefined,
);

export const RecorderProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);

  const {
    isRecording,
    status,
    transcriptWords,
    translateWords,
    startRecording,
    stopRecording,
    clearTranscript,
    audioBlob,
  } = useRealtimeTranscription({
    onError: (error: string) => {
      log.error("Transcription error:", error);
    },

    onStatusChange: (newStatus: string) => {
      if (newStatus === "recording" && !sessionStartTime) {
        setSessionStartTime(new Date());
      }
    },
  });

  useEffect(() => {
    return () => {
      if (isRecording) {
        stopRecording();
      }
    };
  }, []);

  return (
    <RecorderContext.Provider
      value={{
        isRecording,
        startRecording,
        stopRecording,
        audioBlob,
        status,
        clearTranscript,
        transcriptWords,
        translateWords,
        sessionStartTime,
        setSessionStartTime,
      }}
    >
      {children}
    </RecorderContext.Provider>
  );
};

export const useRecorder = (): RecorderContextType => {
  const context = useContext(RecorderContext);
  if (!context) {
    throw new Error("useRecorder must be used within a RecorderProvider");
  }
  return context;
};

const SAMPLE_RATE = 16000;
const CHUNK_MS = 128;
const CHUNK_SIZE = (SAMPLE_RATE * 2 * CHUNK_MS) / 1000;

type ResponseType = "ready" | "transcript" | "translate";
const READY_RESPONSE: ResponseType = "ready";
const TRANSCRIPT_RESPONSE: ResponseType = "transcript";
const TRANSLATE_RESPONSE: ResponseType = "translate";

interface UseRealtimeTranscriptionProps {
  onError?: (error: string) => void;
  onStatusChange?: (
    status: "idle" | "connecting" | "recording" | "processing" | "error",
  ) => void;
}

/**
 * Manage real-time audio capture, streaming to a transcription service, and transcript/translation state.
 *
 * @param onError - Optional callback invoked with a user-facing error message when an operational error occurs
 * @param onStatusChange - Optional callback invoked when the internal recording status changes
 *
 * @returns An object exposing the recorder state and controls:
 *  - isRecording: `true` when audio capture and streaming are active, `false` otherwise
 *  - status: Current lifecycle status: `"idle" | "connecting" | "recording" | "processing" | "error"`
 *  - transcriptWords: Array of `RealtimeTranscriptionWord` representing the current transcript (partial and final words)
 *  - translateWords: Array of translated strings received from the service
 *  - startRecording: Begins audio capture, prepares the audio pipeline and WebSocket connection
 *  - stopRecording: Stops capture and streaming, finalizes any pending audio, and marks transcript words as final
 *  - clearTranscript: Clears the in-memory transcriptWords
 *  - audioBlob: Recorded audio as a WAV `Blob` when available, or `null` otherwise
 */
export function useRealtimeTranscription({
  onError,
  onStatusChange,
}: UseRealtimeTranscriptionProps = {}) {
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "connecting" | "recording" | "processing" | "error"
  >("idle");
  const [transcriptWords, setTranscriptWords] = useState<RealtimeTranscriptionWord[]>(
    [],
  );
  const [translateWords, setTranslateWords] = useState<string[]>([]);

  const wsRef = useRef<WebSocket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isAssemblyReady = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const currentAudioBufferRef = useRef<Uint8Array[]>([]);
  const audioBufferRef = useRef<Uint8Array[]>([]);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const totalByteLengthRef = useRef<number>(0);
  const updateStatus = useCallback(
    (newStatus: typeof status) => {
      log.info("status change!", newStatus);
      setStatus(newStatus);
      onStatusChange?.(newStatus);
    },
    [onStatusChange],
  );

  const connectWebSocket = useCallback(() => {
    const wsUrl =
      process.env.NEXT_PUBLIC_WS_SERVER_URL || "ws://localhost:9090";
    try {
      wsRef.current = new WebSocket(`${wsUrl}/ws`);

      if (!wsRef?.current) {
        log.info("no ws current yet.");
        return;
      }
      wsRef.current.onopen = () => {
        log.info("WebSocket connected");
        updateStatus("recording");
      };

      wsRef.current.onmessage = (event) => {
        try {
          const res = JSON.parse(event.data);
          if (res.type === READY_RESPONSE) {
            log.info("Assembly is ready!");
            isAssemblyReady.current = true;
          } else if (res.type === TRANSCRIPT_RESPONSE) {
            const data: RealtimeTranscriptChunk = res;
            if (data.words.length === 0) {
              log.warn("No words in transcription response");
              return;
            }
            const newWords: RealtimeTranscriptionWord[] = data.words.map(
              (word, index) => ({
                text: word.text,
                word_is_final: word.word_is_final,
                start: word.start,
                end: word.end,
                confidence: word.confidence,
              }),
            );

            // TODO: handle end of turn later
            setTranscriptWords((prev) => {
              const stableCount = prev.filter((w) => w.word_is_final).length;
              const updatedWords = [...prev.slice(0, stableCount), ...newWords];
              return updatedWords;
            });
          } else if (res.type === TRANSLATE_RESPONSE) {
            log.info("Received translation response:", res);
            const data: RealtimeTranslateResponse = res;
            if (data.words === "") {
              log.warn("No words in translation response");
              return;
            }
            const newWord = data.words;
            setTranslateWords((prev) => [...prev, newWord]);
          } else {
            log.error("Unknown response :", res);
          }
        } catch (error) {
          log.error("Error parsing WebSocket message:", error);
          onError?.("Failed to parse real time data");
        }
      };

      wsRef.current.onerror = (error) => {
        log.error("WebSocket error:", error);
        updateStatus("error");
        onError?.("WebSocket connection failed");
      };

      wsRef.current.onclose = (e) => {
        log.info("WebSocket disconnected", e.reason, e.code);
        if (status === "recording") {
          updateStatus("idle");
        }
      };
    } catch (error) {
      log.error("Failed to connect WebSocket:", error);
      updateStatus("error");
      onError?.("Failed to connect to transcription service");
    }
  }, [status, updateStatus, onError]);

  const startRecording = useCallback(async () => {
    clearTranscript();
    updateStatus("connecting");
    connectWebSocket();

    const AudioContextClass =
      window.AudioContext || (window as any).webkitAudioContext;
    const audioContext = new AudioContextClass();
    audioContextRef.current = audioContext;

    let systemStream: MediaStream | null = null;
    let micStream: MediaStream | null = null;

    try {
      systemStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });
    } catch (err) {
      log.error("System audio permission denied:", err);
    }

    try {
      micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      log.error("Microphone permission denied:", err);
    }

    if (!systemStream && !micStream) {
      onError?.("Please allow at least microphone or system audio.");
      return;
    }
    const destination = audioContext.createMediaStreamDestination();

    let systemSource: MediaStreamAudioSourceNode;
    if (systemStream) {
      systemSource = audioContext.createMediaStreamSource(systemStream);
      systemSource.connect(destination);
    }

    let micSource: MediaStreamAudioSourceNode;
    if (micStream) {
      micSource = audioContext.createMediaStreamSource(micStream);
      micSource.connect(destination);
    }

    const mixedStream = destination.stream;
    streamRef.current = mixedStream;

    await audioContext.audioWorklet.addModule("/worklet-processor.js");

    const source = audioContext.createMediaStreamSource(mixedStream);
    const workletNode = new AudioWorkletNode(audioContext, "pcm-processor");

    workletNode.port.onmessage = async (event) => {
      if (
        event.data &&
        wsRef.current?.readyState === WebSocket.OPEN &&
        isAssemblyReady.current
      ) {
        const resampled = await resampleTo16kHz(event.data);
        const pcmData = float32ToInt16(resampled);

        const chunk = new Uint8Array(pcmData.buffer);
        currentAudioBufferRef.current.push(chunk);
        audioBufferRef.current.push(chunk);
        totalByteLengthRef.current += chunk.byteLength;

        if (totalByteLengthRef.current >= 1800) {
          const merged = new Uint8Array(totalByteLengthRef.current);
          let offset = 0;
          for (const part of currentAudioBufferRef.current) {
            if (offset + part.length <= merged.length) {
              merged.set(part, offset);
              offset += part.length;
            } else {
              log.warn("Audio chunk too large, skipping overflow data");
            }
          }
          if (!wsRef.current) {
            log.info("ws have been closed already");
            return;
          }

          wsRef.current.send(merged.buffer);
          log.info("Sent audio chunk of size:", merged.byteLength);
          currentAudioBufferRef.current = [];
          totalByteLengthRef.current = 0;
        }
      }
    };

    source.connect(workletNode).connect(audioContext.destination);
    workletNodeRef.current = workletNode;

    setIsRecording(true);
  }, [connectWebSocket, updateStatus, onError]);

  const stopRecording = useCallback(() => {
    console.trace("🔥 stopRecording() called");
    setIsRecording(false);
    updateStatus("processing");
    log.info("stop recording");

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

    currentAudioBufferRef.current = [];
    totalByteLengthRef.current = 0;

    workletNodeRef.current = null;

    setTimeout(() => {
      setTranscriptWords((prev) =>
        prev.map((word) => ({ ...word, word_is_final: true })),
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
        log.info("curpit");
        stopRecording();
      }
    };
  }, []);

  return {
    isRecording,
    status,
    transcriptWords,
    translateWords,
    startRecording,
    stopRecording,
    clearTranscript,
    audioBlob,
  };
}
