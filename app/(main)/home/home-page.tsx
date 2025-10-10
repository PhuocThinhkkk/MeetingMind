"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FileAudio, Clock, MoreHorizontal } from "lucide-react";
import { RealtimeRecorder } from "@/components/dashboard/realtime-recorder";
import { AudioUpload } from "@/components/dashboard/audio-upload";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { TranscriptionData } from "@/types/transcription";

interface AudioFile {
  id: string;
  name: string;
  duration: number;
  transcription_status: "pending" | "processing" | "done" | "failed";
  created_at: string;
  progress?: number;
}

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
  const [selectedTranscription, setSelectedTranscription] =
    useState<TranscriptionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchAudioFiles();
    }
  }, [user]);

  const fetchAudioFiles = async () => {
    try {
      const { data, error } = await supabase
        .from("audio_files")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching audio files:", error);
      } else {
        setAudioFiles(data || []);
      }
    } catch (error) {
      console.error("Error fetching audio files:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!user) return;

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("audio-files")
        .upload(filePath, file);

      if (uploadError) {
        console.error("Error uploading file:", uploadError);
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("audio-files").getPublicUrl(filePath);

      const { data, error } = await supabase
        .from("audio_files")
        .insert([
          {
            user_id: user.id,
            name: file.name,
            url: publicUrl,
            duration: 0,
            file_size: file.size,
            mime_type: file.type,
            transcription_status: "pending",
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Error creating audio file record:", error);
      } else {
        setAudioFiles((prev) => [data, ...prev]);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const handleRealtimeTranscriptionComplete = (data: TranscriptionData) => {
    setSelectedTranscription(data);
  };

  const handleFileTranscriptionView = (file: AudioFile) => {
    const transcriptionData: TranscriptionData = {
      id: file.id,
      name: file.name,
      type: "file",
      status: file.transcription_status as any,
      duration: file.duration,
      created_at: file.created_at,
      file_url: (file as any).url,
    };
    setSelectedTranscription(transcriptionData);
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case "done":
        return "bg-green-100 text-green-800 border-green-200";
      case "processing":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "failed":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col mb-8 animate-fade-in">
              <p className="text-gray-600">
                Upload, transcribe, and analyze your meetings with AI
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <AudioUpload onUpload={handleFileUpload} />
              <RealtimeRecorder
                onTranscriptionComplete={handleRealtimeTranscriptionComplete}
              />
            </div>

            <Card className="animate-slide-up hover-lift">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileAudio className="w-5 h-5 mr-2" />
                  Recent Meetings
                </CardTitle>
                <CardDescription>
                  Your uploaded and recorded meetings
                </CardDescription>
              </CardHeader>
              <CardContent>
                {audioFiles.length === 0 ? (
                  <div className="text-center py-8">
                    <FileAudio className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                      No meetings yet. Upload your first audio file to get
                      started!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {audioFiles.map((file, index) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer animate-fade-in hover-lift"
                        style={{ animationDelay: `${index * 100}ms` }}
                        onClick={() => handleFileTranscriptionView(file)}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FileAudio className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {file.name}
                            </h4>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <Clock className="w-4 h-4" />
                              <span>{formatDuration(file.duration)}</span>
                              <span>•</span>
                              <span>
                                {new Date(file.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <Badge
                            className={`${getStatusColor(file.transcription_status)} border`}
                          >
                            {file.transcription_status}
                          </Badge>

                          {file.transcription_status === "processing" &&
                            file.progress && (
                              <div className="w-24">
                                <Progress
                                  value={file.progress}
                                  className="h-2"
                                />
                              </div>
                            )}

                          <Button
                            variant="ghost"
                            size="sm"
                            className="hover:bg-gray-100"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

