'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { TranscriptionWord, RealtimeTranscriptChunk, AudioChunk } from '@/types/transcription';

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
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<AudioChunk[]>([]);

  const updateStatus = useCallback((newStatus: typeof status) => {
    setStatus(newStatus);
    onStatusChange?.(newStatus);
  }, [onStatusChange]);

  const connectWebSocket = useCallback(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_SERVER_URL || 'ws://localhost:8080';
    try {
      wsRef.current = new WebSocket(`${wsUrl}/ws`);
      
      if (!wsRef?.current) {
        console.log("no ws current yet.")
        return
      }
      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        updateStatus('recording');
      };
      
      wsRef.current.onmessage = (event) => {
        try {
          const data: RealtimeTranscriptChunk = JSON.parse(event.data);
          
          const newWords: TranscriptionWord[] = data.words.map((word, index) => ({
            text: word,
            timestamp: Date.now() + index * 100, // Approximate timing
            isStable: data.isEndOfTurn,
            confidence: data.isEndOfTurn ? 0.9 : 0.7  // will change later
          }));
          
          setTranscriptWords(prev => {
            if (data.isEndOfTurn) {
              const stableWords = [...prev.slice(0, -newWords.length), ...newWords];
              if (onTranscriptUpdate) onTranscriptUpdate(stableWords)
              else console.error("didnt pass onTransciptUpdate into hook")
              return stableWords;
            } else {
              const stableCount = prev.filter(w => w.isStable).length;
              const updatedWords = [...prev.slice(0, stableCount), ...newWords];
              if (onTranscriptUpdate) onTranscriptUpdate(updatedWords)
              else console.error("didnt pass onTransciptUpdate into hook")
              return updatedWords;
            }
          });
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
          onError?.('Failed to parse transcription data');
        }
      };
      
      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        updateStatus('error');
        onError?.('WebSocket connection failed');
      };
      
      wsRef.current.onclose = (e) => {
        console.log('WebSocket disconnected', e.reason, e.code);
        if (status === 'recording') {
          updateStatus('idle');
        }
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      updateStatus('error');
      onError?.('Failed to connect to transcription service');
    }
  }, [status, updateStatus, onError, onTranscriptUpdate]);

  const startRecording = useCallback(async () => {
    try {
      updateStatus('connecting');
      connectWebSocket();
      
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: SAMPLE_RATE,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      });
      
      streamRef.current = stream;
      
      // Create audio context for processing
      audioContextRef.current = new AudioContext({ sampleRate: SAMPLE_RATE });
      const source = audioContextRef.current.createMediaStreamSource(stream);
      
      // Create processor for chunking audio
      processorRef.current = audioContextRef.current.createScriptProcessor(CHUNK_SIZE / 2, 1, 1);
      
      processorRef.current.onaudioprocess = (event) => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
        
        const inputBuffer = event.inputBuffer;
        const inputData = inputBuffer.getChannelData(0);
        
        // Convert float32 to int16
        const int16Array = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          int16Array[i] = Math.max(-32768, Math.min(32767, inputData[i] * 32768));
        }
        
        // Send audio chunk via WebSocket
        if (int16Array.length === CHUNK_SIZE / 2) {
          wsRef.current.send(int16Array.buffer);
        }
      };

      source.connect(processorRef.current);
      processorRef.current.connect(audioContextRef.current.destination);
      
      setIsRecording(true);
      
    } catch (error) {
      console.error('Failed to start recording:', error);
      updateStatus('error');
      onError?.('Failed to access microphone');
    }
  }, [connectWebSocket, updateStatus, onError]);

  const stopRecording = useCallback(() => {
    setIsRecording(false);
    updateStatus('processing');
    
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
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    // Close WebSocket
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    // Finalize transcript
    setTimeout(() => {
      setTranscriptWords(prev => prev.map(word => ({ ...word, isStable: true })));
      updateStatus('idle');
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