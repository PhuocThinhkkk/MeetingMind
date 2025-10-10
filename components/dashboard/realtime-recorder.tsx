"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Mic,
  MicOff,
  Square,
  Loader2,
  AlertCircle,
  Wifi,
  WifiOff,
} from "lucide-react";
import { TranscriptionData, TranscriptionWord } from "@/types/transcription";
import RealTimeTranscriptionPage from "./realtime-view-transcription";
import { useRecorder } from "@/components/context/realtime-recorder-context";

interface RealtimeRecorderProps {
  onTranscriptionComplete: (data: TranscriptionData) => void;
}

/**
 * UI component that provides controls and a live transcription view for capturing realtime audio.
 *
 * Renders a card with status, start/stop controls, a live duration indicator while recording, and an embedded
 * RealTimeTranscriptionPage that becomes visible when recording starts.
 *
 * @param onTranscriptionComplete - Callback invoked when a realtime recording finishes and at least one transcript word exists. Receives a `TranscriptionData` object describing the recording (id, name, type, status, duration, created_at, and transcript with text, words, speakers_detected, and confidence_score).
 * @returns A React element rendering the realtime recorder user interface.
 */
export function RealtimeRecorder({
  onTranscriptionComplete,
}: RealtimeRecorderProps) {
  const [showTranscription, setShowTranscription] = useState(false);
  const {
    transcriptWords,
    translateWords,
    startRecording,
    stopRecording,
    sessionStartTime,
    setSessionStartTime,
    isRecording,
    status,
    audioBlob,
  } = useRecorder();

  const handleStartRecording = async () => {
    await startRecording();
    setShowTranscription(true);
  };

  const handleStopRecording = () => {
    stopRecording();

    if (sessionStartTime && transcriptWords.length > 0) {
      const duration = Math.floor(
        (Date.now() - sessionStartTime.getTime()) / 1000,
      );
      const transcriptionData: TranscriptionData = {
        id: `realtime-${Date.now()}`,
        name: `Live Recording - ${sessionStartTime.toLocaleTimeString()}`,
        type: "realtime",
        status: "done",
        duration,
        created_at: sessionStartTime.toISOString(),
        transcript: {
          text: transcriptWords.map((w) => w.text).join(" "),
          words: transcriptWords,
          speakers_detected: 1,
          confidence_score: 0.85,
        },
      };

      onTranscriptionComplete(transcriptionData);
    }

    setSessionStartTime(null);
  };

  const getStatusColor = () => {
    switch (status) {
      case "recording":
        return "bg-red-100 text-red-800 border-red-200";
      case "connecting":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "processing":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "error":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "recording":
        return <Mic className="w-4 h-4" />;
      case "connecting":
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case "processing":
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case "error":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <MicOff className="w-4 h-4" />;
    }
  };

  const formatDuration = () => {
    if (!sessionStartTime) return "00:00";
    const elapsed = Math.floor(
      (Date.now() - sessionStartTime.getTime()) / 1000,
    );
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <>
      <Card className="group hover:shadow-lg transition-all duration-300 border-dashed border-2 border-gray-300 hover:border-red-400 animate-slide-up hover-lift">
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center space-x-4">
              <Badge
                className={`${getStatusColor()} border flex items-center space-x-1`}
              >
                {getStatusIcon()}
                <span className="capitalize">{status}</span>
              </Badge>

              {status === "recording" && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span>{formatDuration()}</span>
                </div>
              )}
            </div>

            <div>
              <div
                className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center transition-all duration-300 ${
                  isRecording
                    ? "bg-red-500 hover:bg-red-600 animate-pulse"
                    : "bg-red-100 hover:bg-red-200 group-hover:bg-red-200"
                }`}
              >
                {status === "connecting" ? (
                  <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
                ) : isRecording ? (
                  <Square className="w-8 h-8 text-white" />
                ) : (
                  <Mic className="w-8 h-8 text-red-600" />
                )}
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {!isRecording && "Real-time Recording"}
              </h3>

              <p className="text-gray-600 text-sm mb-6">
                {!isRecording && "Start recording to see live transcription"}
              </p>

              <div className="space-y-3">
                {!isRecording ? (
                  <Button
                    onClick={handleStartRecording}
                    disabled={status === "connecting"}
                    className="w-full bg-red-600 hover:bg-red-700 transition-all hover:scale-[1.02] shadow-lg hover:shadow-xl"
                  >
                    {status === "connecting" ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Mic className="w-4 h-4 mr-2" />
                        Start Recording
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={handleStopRecording}
                    variant="outline"
                    className="w-full border-red-300 text-red-700 hover:bg-red-50 transition-all hover:scale-[1.02]"
                  >
                    <Square className="w-4 h-4 mr-2" />
                    Stop & View Transcription
                  </Button>
                )}

                {status === "error" && (
                  <p className="text-sm text-red-600 flex items-center justify-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    Connection failed. Please check your settings.
                  </p>
                )}
              </div>
            </div>

            {/* Connection Status */}
            <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
              {status === "recording" || status === "connecting" ? (
                <Wifi className="w-4 h-4 text-green-500" />
              ) : (
                <WifiOff className="w-4 h-4 text-gray-400" />
              )}
              <span>
                {status === "recording"
                  ? "Connected to transcription service"
                  : "Ready to connect"}
              </span>
            </div>
          </div>
        </CardContent>
        <RealTimeTranscriptionPage
          translationWords={translateWords}
          transcriptionWords={transcriptWords}
          isVisible={showTranscription}
          onExit={() => {
            stopRecording();
            setShowTranscription(false);
          }}
          onStopRecording={() => {
            stopRecording();
            setShowTranscription(false);
          }}
        />
      </Card>
    </>
  );
}