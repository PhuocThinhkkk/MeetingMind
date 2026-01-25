'use client'

import { log } from '@/lib/logger'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileAudio, Clock, MoreHorizontal } from 'lucide-react'
import { RealtimeRecorder } from '@/components/dashboard/realtime-recorder'
import { AudioUpload } from '@/components/dashboard/audio-upload'
import { useAuth } from '@/hooks/use-auth'
import { AudioFile } from '@/types/transcription.db'
import {
  getAudioHistory,
  saveAudioFile,
} from '@/lib/queries/browser/audio-operations'
import { saveTranscript } from '@/lib/queries/browser/transcription-operations'
import { saveTranscriptWords } from '@/lib/queries/browser/transcription-operations'
import { SaveTranscriptInput } from '@/types/transcription.db'
import { formatDuration } from '@/lib/utils'
import { FeatureLockWrapper } from '@/components/coming-soon-wrapper'
import { TranscriptionView } from '@/components/dashboard/transcription-view'

export default function HomePage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([])
  const [selectedTranscription, setSelectedTranscription] =
    useState<AudioFile | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchAudioFiles()
    }
  }, [user])

  const fetchAudioFiles = async () => {
    if (!user) return
    try {
      const data = await getAudioHistory(user.id)
      setAudioFiles(data || [])
    } catch (error) {
      log.error('Error fetching audio files:', error)
      // Set empty array on error to allow the app to continue
      setAudioFiles([])
    } finally {
      setLoading(false)
    }
  }

  /**
   * Uploads an audio file, persists it with a placeholder transcript, and updates UI state.
   *
   * Persists the provided file and an initial placeholder transcript for the current user, prepends the resulting audio record to the local audio list, and marks it as the selected transcription. Manages the uploading state and logs progress and errors. If the file name contains an extension or invalid characters they will be sanitized before saving.
   *
   * @param file - The audio File object to upload and persist
   */
  async function handleFileUpload(file: File) {
    if (!user) {
      log.error('User not authenticated')
      return
    }

    setUploading(true)
    try {
      log.info('Starting file upload:', file.name)

      // Convert File to Blob
      const blob = new Blob([file], { type: file.type })

      // Create placeholder transcript
      const transcriptData = createPlaceholderTranscript()

      // Sanitize filename: remove extension and invalid characters
      const sanitizedName = file.name
        .replace(/\.[^/.]+$/, '') // Remove file extension
        .replace(/['"]/g, '') // Remove quotes
        .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
        .trim()

      // Save audio and transcript
      const audioFile = await handlingSaveAudioAndTranscript(
        user.id,
        blob,
        transcriptData,
        sanitizedName || 'Untitled'
      )

      if (audioFile) {
        // Add to the list
        setAudioFiles(prev => [audioFile, ...prev])
        // Set as selected
        setSelectedTranscription(audioFile)
        log.info('Audio file saved successfully')
      }
    } catch (error) {
      log.error('Error uploading file:', error)
    } finally {
      setUploading(false)
    }
  }

  /**
   * Persist the provided real-time audio and its transcript, then add the saved record to the recent meetings list and select it.
   *
   * @param blob - The recorded audio Blob to persist.
   * @param transcript - Word- and timing-level transcript data to save alongside the audio.
   */
  async function handleRealtimeTranscriptionComplete(
    blob: Blob,
    transcript: SaveTranscriptInput
  ) {
    if (!user) {
      log.info('User not authenticated. Cannot save transcription.')
      return
    }
    try {
      const data = await handlingSaveAudioAndTranscript(
        user.id,
        blob,
        transcript
      )
      if (!data) return
      setAudioFiles(prev => [data, ...prev])
      setSelectedTranscription(data)
    } catch (error) {
      log.error('Error uploading file:', error)
    }
  }

  const handleFileTranscriptionView = (file: AudioFile) => {
    setSelectedTranscription(file)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
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
              <FeatureLockWrapper isLocked={false}>
                <AudioUpload onUpload={handleFileUpload} />
              </FeatureLockWrapper>
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
                    {audioFiles.slice(0, 5).map((file, index) => (
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

      {/* Transcription View Modal */}
      {selectedTranscription && (
        <TranscriptionView
          file={selectedTranscription}
          onClose={() => setSelectedTranscription(null)}
        />
      )}
    </div>
  )
}
/**
 * Persist an audio Blob and its transcript for the given user.
 *
 * @param userId - The ID of the user who owns the recording
 * @param blob - The audio data to save
 * @param transcriptWords - The word-level transcript to associate with the audio; must contain at least one entry
 * @param fileName - Optional custom name for the audio file (defaults to "Unnamed")
 * @returns The saved AudioFile with its `transcript` property populated and including `words`
 * @throws If `userId` is falsy
 * @throws If `blob` is falsy
 * @throws If `transcriptWords` is falsy or an empty array
 */
export async function handlingSaveAudioAndTranscript(
  userId: string,
  blob: Blob,
  transcriptWords: SaveTranscriptInput,
  fileName: string = 'Unnamed'
) {
  if (!userId) {
    throw new Error('pls sign in first to use our application')
  }

  if (!blob) {
    throw new Error('The audio of the recording isnt found')
  }

  if (!transcriptWords || transcriptWords.length === 0) {
    throw new Error('There is nothing in transcription')
  }

  const audio = await saveAudioFile(blob, userId, fileName)
  if (audio) {
    log.info('Audio file saved with ID:', audio)
  }
  const transcription = await saveTranscript(audio.id, transcriptWords)
  if (transcription) {
    log.info('Transcript saved with ID:', transcription)
  }
  const words = await saveTranscriptWords(transcription.id, transcriptWords)
  const completedAudioFile: AudioFile = {
    ...audio,
    transcript: { ...transcription, words: words },
  }
  return completedAudioFile
}

/**
 * Create a minimal placeholder transcript used when no real transcription is available.
 *
 * Contains two placeholder word entries with timestamps, full confidence, and `word_is_final: true`.
 *
 * @returns A `SaveTranscriptInput` consisting of two placeholder words (`'Transcription'` and `'pending'`)
 */
function createPlaceholderTranscript(): SaveTranscriptInput {
  return [
    {
      text: 'Transcription',
      start: 0,
      end: 0.5,
      confidence: 1,
      word_is_final: true,
    },
    {
      text: 'pending',
      start: 0.5,
      end: 1,
      confidence: 1,
      word_is_final: true,
    },
  ]
}