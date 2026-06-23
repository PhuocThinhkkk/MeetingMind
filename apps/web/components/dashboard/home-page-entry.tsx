'use client'

import { log } from '@/utils/logger'
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
import {
  AudioFileRow,
  AudioFileWithTranscriptNested,
  SaveTranscriptInput,
} from '@/types/transcriptions/transcription.db'
import { getAudioHistory } from '@/modules/transcription/repository/client/audio-operations'
import {
  formatDateShorted,
  formatDuration,
} from '@/utils/ui-format/time-format'
import { FeatureLockWrapper } from '@/components/coming-soon-wrapper'
import { fileUploadPineline } from '@/modules/transcription/client/workflow/upload-file-pineline'
import { TranscriptionViewProvider } from '@/components/context/transcription-view-context'
import { TranscriptionDialog } from '@/components/dashboard/transcription-view/transcription-main-view-dialog'
import { realtimeUploadPineline } from '@/modules/transcription/client/workflow/real-time-file-pineline'
import { toast } from '@/hooks/use-toast'

export default function HomePageEntry() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [audioFiles, setAudioFiles] = useState<AudioFileWithTranscriptNested[]>(
    []
  )
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
    }
  }

  /**
   * Upload an audio file for the current user and open its transcription view on success.
   *
   * While the upload is in progress this sets the uploading state to true and ensures it is reset when finished.
   * If no authenticated user is available the function returns without performing an upload.
   *
   * @param file - The audio `File` to upload.
   */
  async function handleFileUpload(file: File) {
    if (uploading) return
    if (!user) {
      log.error('User not authenticated')
      return
    }

    setUploading(true)
    try {
      log.info('Starting file upload:', file.name)
      const audioFile = await fileUploadPineline(file, user.id)
      log.info('pineline of upload success: ', { audioFile })
      handleFileTranscriptionView(audioFile.audio)
    } catch (error: any) {
      log.error('Error uploading file:', error)
      toast({
        title: 'File upload error.',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setUploading(false)
    }
  }

  /**
   * Uploads a completed realtime transcription (audio file and word-level transcript) and opens its transcription view.
   *
   * This sets the uploading state while the upload is in progress and navigates to the uploaded audio's transcription view on success.
   *
   * @param file - The recorded audio File to upload
   * @param transcriptionWords - Array of word-level realtime transcription entries to include with the upload
   */
  async function handleRealtimeTranscriptionComplete(
    file: File,
    transcriptionWords: SaveTranscriptInput
  ) {
    if (uploading) return
    if (!user) {
      log.error('User not authenticated')
      return
    }

    setUploading(true)
    try {
      log.info('Starting transcript upload:', file.name)
      const audioFile = await realtimeUploadPineline(
        transcriptionWords,
        file,
        user.id
      )
      log.info('pineline of upload success: ', { audioFile })
      handleFileTranscriptionView(audioFile.audio)
    } catch (error: any) {
      log.error('Error uploading file:', error)
      toast({
        title: 'File upload error.',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setUploading(false)
    }
  }

  const handleFileTranscriptionView = (file: AudioFileRow) => {
    router.push(`/home?audioId=${file.id}`)
  }

  const handleCloseDialog = () => {
    router.push('/home')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done':
        return 'bg-[hsl(var(--success)/0.12)] text-[hsl(var(--success))] border-[hsl(var(--success)/0.2)]'
      case 'processing':
        return 'bg-primary/10 text-primary border-primary/20'
      case 'pending':
        return 'bg-[hsl(var(--chart-4)/0.12)] text-[hsl(var(--chart-4))] border-[hsl(var(--chart-4)/0.2)]'
      case 'failed':
        return 'bg-destructive/10 text-destructive border-destructive/20'
      default:
        return 'bg-muted text-muted-foreground border-border'
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex">
        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col mb-8 animate-fade-in">
              <p className="text-muted-foreground">
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

            <Card className="animate-slide-up hover-lift border-border bg-card text-card-foreground">
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
                    <FileAudio className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No meetings yet. Upload your first audio file to get
                      started!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {audioFiles.slice(0, 5).map((file, index) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between rounded-lg border border-border bg-card p-4 transition-colors cursor-pointer hover:bg-accent/50 animate-fade-in hover-lift"
                        style={{ animationDelay: `${index * 100}ms` }}
                        onClick={() => handleFileTranscriptionView(file)}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-primary/10">
                            <FileAudio className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium text-foreground">
                              {file.name}
                            </h4>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <Clock className="w-4 h-4" />
                              <span>{formatDuration(file.duration ?? 0)}</span>
                              <span>•</span>
                              <span>{formatDateShorted(file.created_at)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <Badge
                            className={`${getStatusColor(file.transcription_status ?? 'unknown')} border`}
                          >
                            {file.transcription_status}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="hover:bg-accent"
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

      {currentAudioId && (
        <TranscriptionViewProvider audioId={currentAudioId}>
          <TranscriptionDialog
            open={!!currentAudioId}
            onClose={handleCloseDialog}
          />
        </TranscriptionViewProvider>
      )}
    </div>
  )
}
