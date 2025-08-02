import { TranscriptionWord } from '@/types/transcription';
import { useRealtimeTranscription } from '@/hooks/use-realtime-transcription';
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react';

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
