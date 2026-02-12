'use client'

import { log } from '@/lib/logger'
import { useSearchParams } from 'next/navigation'
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
import { AudioFileRow, AudioFileWithTranscriptNested } from '@/types/transcriptions/transcription.db'
import {
  getAudioHistory,
} from '@/lib/queries/browser/audio-operations'
import { formatDateShorted, formatDuration } from '@/lib/ui-format/time-format'
import { FeatureLockWrapper } from '@/components/coming-soon-wrapper'
import { fileUploadPineline } from '@/lib/queries/browser/audio-transcript-pineline/upload-file-pineline'
import { TranscriptionViewProvider } from '@/components/context/transcription-view-context'
import { TranscriptionDialog } from '@/components/dashboard/transcription-view/transcription-main-view-dialog'
import { realtimeUploadPineline } from '@/lib/queries/browser/audio-transcript-pineline/real-time-file-pineline'
import { useRecorder } from '@/components/context/realtime-recorder-context'
import { RealtimeTranscriptionWord } from '@/types/transcriptions/transcription.ws'

export default function HomePage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [audioFiles, setAudioFiles] = useState<AudioFileWithTranscriptNested[]>([])
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  const [uploading, setUploading] = useState(false)
  const currentAudioId = searchParams.get('audioId')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchAudioFiles()
    }
  }, [currentAudioId, user])

  const fetchAudioFiles = async () => {
    if (!user) return
    try {
      const data = await getAudioHistory(user.id)
      setAudioFiles(data || [])
    } catch (error) {
      log.error('Error fetching audio files:', error)
      setAudioFiles([])
    } finally {
      setLoading(false)
    }
  }


  async function handleFileUpload(file: File) {
    if (!user) {
      log.error('User not authenticated')
      return
    }

    setUploading(true)
    try {
      log.info('Starting file upload:', file.name)
      const audioFile = await fileUploadPineline(file, user.id)
      log.info("pineline of upload success: ", { audioFile })

    } catch (error) {
      log.error('Error uploading file:', error)
    } finally {
      setUploading(false)
    }
  }

  async function handleRealtimeTranscriptionComplete(file: File, transcriptionWords: RealtimeTranscriptionWord[]) {
    if (!user) {
      log.error('User not authenticated')
      return
    }

    setUploading(true)
    try {
      log.info('Starting transcript upload:', file.name)
      const audioFile = await realtimeUploadPineline(transcriptionWords, file, user.id)
      log.info("pineline of upload success: ", { audioFile })

    } catch (error) {
      log.error('Error uploading file:', error)
    } finally {
      setUploading(false)
    }
  }


  const handleFileTranscriptionView = (file: AudioFileRow) => {
    router.push(`/home?audioId=${file.id}`)
  }

  const handleCloseDialog = () => {
    router.push('/dashboard')
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
                              <span>{formatDuration(file.duration ?? 0)}</span>
                              <span>•</span>
                              <span>
                                {formatDateShorted(file.created_at)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <Badge
                            className={`${getStatusColor(file.transcription_status ?? "unknown")} border`}
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

      {currentAudioId &&
        <TranscriptionViewProvider audioId={currentAudioId}>
          <TranscriptionDialog
            open={!!currentAudioId}
            onClose={handleCloseDialog}
          />
        </TranscriptionViewProvider >
      }

    </div >
  )
}
