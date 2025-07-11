'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Mic, 
  Upload, 
  FileAudio, 
  Clock, 
  MessageSquare, 
  Calendar,
  MoreHorizontal,
  Play,
  Pause,
  Download
} from 'lucide-react';
import { Sidebar } from '@/components/dashboard/sidebar';
import { AudioUpload } from '@/components/dashboard/audio-upload';
import { TranscriptionView } from '@/components/dashboard/transcription-view';

interface AudioFile {
  id: string;
  name: string;
  duration: number;
  status: 'pending' | 'processing' | 'done' | 'failed';
  createdAt: string;
  progress?: number;
}

export default function DashboardPage() {
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([
    {
      id: '1',
      name: 'Team Meeting - Q1 Planning',
      duration: 3420,
      status: 'done',
      createdAt: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      name: 'Client Call - Project Discussion',
      duration: 1800,
      status: 'processing',
      createdAt: '2024-01-15T14:00:00Z',
      progress: 65
    },
    {
      id: '3',
      name: 'Weekly Standup',
      duration: 900,
      status: 'pending',
      createdAt: '2024-01-15T16:00:00Z'
    }
  ]);

  const [selectedFile, setSelectedFile] = useState<AudioFile | null>(null);

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8 animate-fade-in">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Meeting Transcriptions</h1>
              <p className="text-gray-600">Upload, transcribe, and analyze your meetings with AI</p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <AudioUpload onUpload={(file) => {
                const newFile: AudioFile = {
                  id: Date.now().toString(),
                  name: file.name,
                  duration: 0,
                  status: 'pending',
                  createdAt: new Date().toISOString()
                };
                setAudioFiles(prev => [newFile, ...prev]);
              }} />
              
              <Card className="group hover:shadow-lg transition-all duration-300 border-dashed border-2 border-gray-300 hover:border-blue-400 cursor-pointer animate-slide-up">
                <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-red-200 transition-colors">
                    <Mic className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Record Meeting</h3>
                  <p className="text-gray-600 text-sm mb-4">Start recording directly from your browser</p>
                  <Button variant="outline" className="w-full">
                    <Mic className="w-4 h-4 mr-2" />
                    Start Recording
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Recent Files */}
            <Card className="animate-slide-up">
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
                <div className="space-y-4">
                  {audioFiles.map((file, index) => (
                    <div 
                      key={file.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer animate-fade-in"
                      style={{ animationDelay: `${index * 100}ms` }}
                      onClick={() => setSelectedFile(file)}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FileAudio className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{file.name}</h4>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <Clock className="w-4 h-4" />
                            <span>{formatDuration(file.duration)}</span>
                            <span>•</span>
                            <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Badge className={getStatusColor(file.status)}>
                          {file.status}
                        </Badge>
                        
                        {file.status === 'processing' && file.progress && (
                          <div className="w-24">
                            <Progress value={file.progress} className="h-2" />
                          </div>
                        )}
                        
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Sidebar */}
        <Sidebar 
          selectedFile={selectedFile}
          onFileSelect={setSelectedFile}
        />
      </div>

      {/* Transcription Modal/View */}
      {selectedFile && (
        <TranscriptionView 
          file={selectedFile}
          onClose={() => setSelectedFile(null)}
        />
      )}
    </div>
  );
}