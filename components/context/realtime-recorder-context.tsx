import { 
    useState,
    useRef, 
    useCallback, 
    useEffect ,
    createContext,
    useContext 
} from "react";
  
import {
  TranscriptionWord,
  RealtimeTranscriptChunk,
  AudioChunk,
} from "@/types/transcription";

type RecorderContextType = {
  isRecording: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  clearTranscript: () => void;
  audioBlob: Blob | null;
  status: string;
  transcriptWords: TranscriptionWord[];
  sessionStartTime: Date | null;
  setSessionStartTime: React.Dispatch<React.SetStateAction<Date | null>>;
};

const RecorderContext = createContext<RecorderContextType | undefined>(undefined);

export const RecorderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  // TODO: store audio later
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)

  const {
    isRecording,
    status,
    transcriptWords,
    translateWords,
    startRecording,
    stopRecording,
    clearTranscript
  } = useRealtimeTranscription({

    onError: (error : string) => {
      console.error('Transcription error:', error);
    },

    onStatusChange: (newStatus : string) => {
      if (newStatus === 'recording' && !sessionStartTime) {
        setSessionStartTime(new Date());
      }
    }

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
        setSessionStartTime
      }}
    >
      {children}
    </RecorderContext.Provider>
  );
};

export const useRecorder = (): RecorderContextType => {
  const context = useContext(RecorderContext);
  if (!context) {
    throw new Error('useRecorder must be used within a RecorderProvider');
  }
  return context;
};



const SAMPLE_RATE = 16000;
const CHUNK_MS = 128;
const CHUNK_SIZE = (SAMPLE_RATE * 2 * CHUNK_MS) / 1000;

type ResponseType = "ready" | "transcript" | "translate"
const READY_RESPONSE: ResponseType = "ready";
const TRANSCRIPT_RESPONSE: ResponseType = "transcript";
const TRANSLATE_RESPONSE: ResponseType = "translate";

interface UseRealtimeTranscriptionProps {
  onError?: (error: string) => void;
  onStatusChange?: (
    status: "idle" | "connecting" | "recording" | "processing" | "error",
  ) => void;
}

export function useRealtimeTranscription({
  onError,
  onStatusChange,
}: UseRealtimeTranscriptionProps = {}) {

  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "connecting" | "recording" | "processing" | "error"
  >("idle");
  const [transcriptWords, setTranscriptWords] = useState<TranscriptionWord[]>(
    [],
  );
  const [translateWords, setTranslateWords] = useState<string[]>([]);

  const wsRef = useRef<WebSocket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isAssemblyReady = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const audioBufferRef = useRef<Uint8Array[]>([]);
  let totalByteLength = 0;

  const updateStatus = useCallback(
    (newStatus: typeof status) => {
      console.log("status change!", newStatus);
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

          if (res.type === READY_RESPONSE) {
            console.log("Assembly is ready!");
            isAssemblyReady.current = true;

          }else if (res.type === TRANSCRIPT_RESPONSE) {
            const data: RealtimeTranscriptChunk = res;
            if (data.words.length === 0) {
                console.warn("No words in transcription response");
                return;
            }
            const newWords: TranscriptionWord[] = data.words.map(
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
            const data: RealtimeTranscriptChunk = res;
            if (data.words.length === 0){
                console.warn("No words in translation response");
                return;
            }
            const newWord : string = data.words
            setTranslateWords((prev) => ([...prev, newWord]));

          } else {
              console.error("Unknown response :", res);
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
      console.error("System audio permission denied:", err);
    }

    try {
      micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      console.error("Microphone permission denied:", err);
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
        audioBufferRef.current.push(chunk);
        totalByteLength += chunk.byteLength;

        if (totalByteLength >= 1800) {
          const merged = new Uint8Array(totalByteLength);
          let offset = 0;
          for (const part of audioBufferRef.current) {
            if (offset + part.length <= merged.length) {
              merged.set(part, offset);
              offset += part.length;
            } else {
              console.warn("Audio chunk too large, skipping overflow data");
            }
          }

          wsRef.current.send(merged.buffer);
          console.log("Sent audio chunk of size:", merged.byteLength);
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
    console.trace("🔥 stopRecording() called");
    setIsRecording(false);
    updateStatus("processing");
    console.log("stop recording");

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

    audioBufferRef.current = [];
    totalByteLength = 0;

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
        console.log("curpit");
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
  };
}

// @ts-ignore
async function resampleTo16kHz(float32) {
  const originalSampleRate = 48000;
  const targetSampleRate = 16000;
  const audioBuffer = new AudioBuffer({
    length: float32.length,
    numberOfChannels: 1,
    sampleRate: originalSampleRate,
  });

  audioBuffer.copyToChannel(float32, 0, 0);

  const offlineContext = new OfflineAudioContext({
    numberOfChannels: 1,
    length: Math.round(
      (float32.length * targetSampleRate) / originalSampleRate,
    ),
    sampleRate: targetSampleRate,
  });

  const source = offlineContext.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(offlineContext.destination);
  source.start();

  const rendered = await offlineContext.startRendering();
  return rendered.getChannelData(0);
}

// @ts-ignore
function float32ToInt16(float32) {
  const int16 = new Int16Array(float32.length);
  for (let i = 0; i < float32.length; i++) {
    const s = Math.max(-1, Math.min(1, float32[i]));
    int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return int16;
}
