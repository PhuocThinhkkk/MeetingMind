'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  FileText, 
  MessageSquare, 
  Calendar, 
  Download, 
  Share,
  Clock,
  User,
  Send,
  CheckCircle,
  AlertCircle,
  Loader2,
  Mic,
  FileAudio,
  Wifi
} from 'lucide-react';
import { TranscriptionData, TranscriptionWord } from '@/types/transcription';
import { supabase } from '@/lib/supabase';

interface SharedTranscriptionViewProps {
  data: TranscriptionData;
  onClose: () => void;
}

export function SharedTranscriptionView({ data, onClose }: SharedTranscriptionViewProps) {
  const [question, setQuestion] = useState('');
  const [qaHistory, setQaHistory] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [askingQuestion, setAskingQuestion] = useState(false);

  useEffect(() => {
    if (data.type === 'file') {
      fetchTranscriptionData();
    } else {
      // For real-time transcriptions, generate summary
      generateRealtimeSummary();
    }
  }, [data.id]);

  const fetchTranscriptionData = async () => {
    if (data.type !== 'file') return;
    
    setLoading(true);
    try {
      // Fetch summary for file-based transcriptions
      const { data: summaryData } = await supabase
        .from('summaries')
        .select('*')
        .eq('audio_id', data.id)
        .single();

      // Fetch events
      const { data: eventsData } = await supabase
        .from('events')
        .select('*')
        .eq('audio_id', data.id);

      // Fetch Q&A history
      const { data: qaData } = await supabase
        .from('qa_logs')
        .select('*')
        .eq('audio_id', data.id)
        .order('created_at', { ascending: true });

      setSummary(summaryData);
      setEvents(eventsData || []);
      setQaHistory(qaData || []);
    } catch (error) {
      console.error('Error fetching transcription data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateRealtimeSummary = () => {
    // Generate a basic summary for real-time transcriptions
    if (data.summary) {
      setSummary(data.summary);
    } else {
      const transcript = data.transcript?.text || '';
      const words = transcript.split(' ');
      
      setSummary({
        text: transcript.length > 200 
          ? `${transcript.substring(0, 200)}...` 
          : transcript,
        highlights: [
          `Recording duration: ${formatDuration(data.duration || 0)}`,
          `Word count: ${words.length}`,
          'Real-time transcription completed'
        ],
        todo: [],
        key_topics: []
      });
    }
  };

  const handleAskQuestion = async () => {
    if (!question.trim()) return;

    setAskingQuestion(true);
    try {
      // Simulate AI response (replace with actual AI integration)
      const simulatedAnswer = `Based on the ${data.type === 'realtime' ? 'live recording' : 'uploaded file'}, I can provide you with relevant information. This is a simulated AI response that would analyze the content and provide accurate answers.`;

      if (data.type === 'file') {
        const { data: qaData, error } = await supabase
          .from('qa_logs')
          .insert([
            {
              audio_id: data.id,
              user_id: (await supabase.auth.getUser()).data.user?.id,
              question,
              answer: simulatedAnswer,
              confidence_score: 0.85
            }
          ])
          .select()
          .single();

        if (!error && qaData) {
          setQaHistory(prev => [...prev, qaData]);
        }
      } else {
        // For real-time, just add to local state
        const qaEntry = {
          id: `temp-${Date.now()}`,
          question,
          answer: simulatedAnswer,
          created_at: new Date().toISOString(),
          confidence_score: 0.85
        };
        setQaHistory(prev => [...prev, qaEntry]);
      }
      
      setQuestion('');
    } catch (error) {
      console.error('Error asking question:', error);
    } finally {
      setAskingQuestion(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done': return 'bg-green-100 text-green-800 border-green-200';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'recording': return 'bg-red-100 text-red-800 border-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const renderTranscriptWords = () => {
    if (!data.transcript?.words) {
      return (
        <div className="space-y-4 text-sm">
          {(data.transcript?.text || '').split('\n').filter(line => line.trim()).map((line, index) => (
            <div key={index} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              {line}
            </div>
          ))}
        </div>
      );
    }

    // Render word-by-word for real-time transcriptions
    return (
      <div className="space-y-2 text-sm leading-relaxed">
        <div className="p-4 bg-gray-50 rounded-lg">
          {data.transcript.words.map((word, index) => (
            <span 
              key={index}
              className={`${
                word.isStable 
                  ? 'text-gray-900' 
                  : 'text-gray-600 italic bg-yellow-100 px-1 rounded'
              } ${word.confidence && word.confidence < 0.7 ? 'text-orange-600' : ''}`}
              title={`Confidence: ${((word.confidence || 0) * 100).toFixed(0)}%`}
            >
              {word.text}{' '}
            </span>
          ))}
        </div>
        
        {data.type === 'realtime' && (
          <div className="text-xs text-gray-500 flex items-center space-x-2">
            <Wifi className="w-3 h-3" />
            <span>Real-time transcription • Words in yellow are being refined</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-6xl h-[90vh] animate-scale-in">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {data.type === 'realtime' ? (
              <Mic className="w-5 h-5 text-red-600" />
            ) : (
              <FileText className="w-5 h-5" />
            )}
            <span>{data.name}</span>
            <Badge className={`${getStatusColor(data.status)} border`}>
              {data.status}
            </Badge>
            {data.type === 'realtime' && (
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                Live Recording
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center h-96">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="flex h-full space-x-6">
            {/* Main Content */}
            <div className="flex-1">
              <Tabs defaultValue="transcript" className="h-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="transcript">Transcript</TabsTrigger>
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                  <TabsTrigger value="qa">Q&A</TabsTrigger>
                  <TabsTrigger value="events">Events</TabsTrigger>
                </TabsList>

                <TabsContent value="transcript" className="h-[calc(100%-40px)]">
                  <Card className="h-full hover-lift">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <span>Full Transcript</span>
                        {data.type === 'realtime' && (
                          <Badge variant="outline" className="text-xs">
                            Real-time
                          </Badge>
                        )}
                      </CardTitle>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          Duration: {formatDuration(data.duration || 0)}
                        </span>
                        <span className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          {data.transcript?.speakers_detected || 1} Speaker{(data.transcript?.speakers_detected || 1) > 1 ? 's' : ''}
                        </span>
                        {data.transcript?.confidence_score && (
                          <span className="flex items-center">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            {Math.round(data.transcript.confidence_score * 100)}% Confidence
                          </span>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="h-[calc(100%-120px)]">
                      <ScrollArea className="h-full">
                        {renderTranscriptWords()}
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="summary" className="h-[calc(100%-40px)]">
                  <div className="space-y-4 h-full">
                    <Card className="hover-lift">
                      <CardHeader>
                        <CardTitle>AI Summary</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700 leading-relaxed">
                          {summary?.text || 'No summary available yet.'}
                        </p>
                      </CardContent>
                    </Card>

                    {summary?.highlights && summary.highlights.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="hover-lift">
                          <CardHeader>
                            <CardTitle className="text-lg">Key Highlights</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-2">
                              {summary.highlights.map((highlight: string, index: number) => (
                                <li key={index} className="flex items-start">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                  <span className="text-sm">{highlight}</span>
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>

                        {summary.todo && summary.todo.length > 0 && (
                          <Card className="hover-lift">
                            <CardHeader>
                              <CardTitle className="text-lg">Action Items</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <ul className="space-y-2">
                                {summary.todo.map((item: string, index: number) => (
                                  <li key={index} className="flex items-start">
                                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                                    <span className="text-sm">{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="qa" className="h-[calc(100%-40px)]">
                  <Card className="h-full flex flex-col hover-lift">
                    <CardHeader>
                      <CardTitle>Ask Questions</CardTitle>
                      <CardDescription>
                        Ask AI anything about this {data.type === 'realtime' ? 'recording' : 'meeting'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col">
                      <ScrollArea className="flex-1 mb-4">
                        <div className="space-y-4">
                          {qaHistory.map((qa, index) => (
                            <div key={index} className="space-y-2 animate-fade-in">
                              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                <p className="text-sm font-medium text-blue-900">Q: {qa.question}</p>
                              </div>
                              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                <p className="text-sm text-gray-700">A: {qa.answer}</p>
                                <p className="text-xs text-gray-500 mt-2">
                                  {new Date(qa.created_at).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                      <div className="flex space-x-2">
                        <Input
                          placeholder={`Ask a question about this ${data.type === 'realtime' ? 'recording' : 'meeting'}...`}
                          value={question}
                          onChange={(e) => setQuestion(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && !askingQuestion && handleAskQuestion()}
                          disabled={askingQuestion}
                        />
                        <Button onClick={handleAskQuestion} disabled={askingQuestion || !question.trim()}>
                          {askingQuestion ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="events" className="h-[calc(100%-40px)]">
                  <Card className="h-full hover-lift">
                    <CardHeader>
                      <CardTitle>Extracted Events</CardTitle>
                      <CardDescription>
                        AI-detected meetings and deadlines
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {events.length === 0 ? (
                          <div className="text-center py-8">
                            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">
                              No events detected in this {data.type === 'realtime' ? 'recording' : 'meeting'}.
                            </p>
                          </div>
                        ) : (
                          events.map((event, index) => (
                            <div key={index} className="p-4 border rounded-lg hover-lift">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="font-medium text-gray-900">{event.title}</h4>
                                  <p className="text-sm text-gray-500 mt-1">
                                    {new Date(event.start_time).toLocaleString()}
                                  </p>
                                  <p className="text-sm text-gray-500">{event.location}</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                  {event.added_to_google_calendar ? (
                                    <Badge className="bg-green-100 text-green-800 border-green-200">
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                      Added
                                    </Badge>
                                  ) : (
                                    <Button size="sm" variant="outline" className="transition-all hover:scale-[1.02]">
                                      <Calendar className="w-4 h-4 mr-1" />
                                      Add to Calendar
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Action Panel */}
            <div className="w-64 space-y-4">
              <Card className="hover-lift">
                <CardHeader>
                  <CardTitle className="text-lg">Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start transition-all hover:scale-[1.02]">
                    <Download className="w-4 h-4 mr-2" />
                    Export Transcript
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start transition-all hover:scale-[1.02]">
                    <Share className="w-4 h-4 mr-2" />
                    Share Summary
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start transition-all hover:scale-[1.02]">
                    <Calendar className="w-4 h-4 mr-2" />
                    Create Events
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover-lift">
                <CardHeader>
                  <CardTitle className="text-lg">
                    {data.type === 'realtime' ? 'Recording' : 'File'} Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <Badge variant="outline" className="text-xs">
                      {data.type === 'realtime' ? 'Live Recording' : 'File Upload'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span>{formatDuration(data.duration || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created:</span>
                    <span>{new Date(data.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <Badge className="text-xs">{data.status}</Badge>
                  </div>
                  {data.transcript?.confidence_score && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Confidence:</span>
                      <span>{Math.round(data.transcript.confidence_score * 100)}%</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}