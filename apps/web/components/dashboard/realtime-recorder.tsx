import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Mic,
  MicOff,
  Square,
  Loader2,
  AlertCircle,
  Wifi,
  WifiOff,
} from 'lucide-react'
import RealTimeTranscriptionPage from './realtime-transcription/realtime-view-transcription'
import { useRecorder } from '@/components/context/realtime-record/realtime-recorder-context'
import { SaveTranscriptInput } from '@/types/transcriptions/transcription.db'
import { formatDuration } from '@/utils/ui-format/time-format'
import { toast } from '@/hooks/use-toast'
import { LoadingOverlay } from '../loading-overlay'
import { useUploadController } from '@/hooks/use-upload-controller'
import { log } from '@/utils/logger'

interface RealtimeRecorderProps {
  onTranscriptionComplete: (
    audioBlob: File,
    transcription: SaveTranscriptInput
  ) => Promise<void>
}

type TranslationLanguage = {
  Code: string
  Name: string
}

function getTranslationServerBaseUrl() {
  let server = process.env.NEXT_PUBLIC_WS_SERVER_URL || 'localhost:9090'
  server = server.replace(/^wss?:\/\//, '')
  const protocol = location.protocol === 'https:' ? 'https' : 'http'
  return `${protocol}://${server}`
}

/**
 * Presents controls and a live transcription view for capturing realtime audio.
 *
 * @param onTranscriptionComplete - Callback invoked when a realtime recording finishes. Receives the recorded audio `Blob` and a `SaveTranscriptInput` representing the transcription (text, words, speakers, confidence, etc.).
 * @returns The React element rendering the realtime recorder user interface.
 */
export function RealtimeRecorder({
  onTranscriptionComplete,
}: RealtimeRecorderProps) {
  const [showTranscription, setShowTranscription] = useState(false)
  const uploadCtrl = useUploadController(onTranscriptionComplete)
  const {
    transcriptWords,
    transcriptTurns,
    translateTurns,
    startRecording,
    stopRecording,
    sessionStartTime,
    setSessionStartTime,
    isRecording,
    status,
    errorMessage,
  } = useRecorder()
  const [useMicrophone, setUseMicrophone] = useState(true)
  const [useSystemAudio, setUseSystemAudio] = useState(false)
  const [languages, setLanguages] = useState<TranslationLanguage[]>([])
  const [languagesLoading, setLanguagesLoading] = useState(true)
  const [languagesError, setLanguagesError] = useState<string | null>(null)
  const [targetLanguage, setTargetLanguage] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    if (!sessionStartTime || !isRecording) {
      setDuration(0)
      return
    }
    const id = setInterval(() => {
      setDuration(
        Math.max(0, Date.now() / 1000 - sessionStartTime.getTime() / 1000)
      )
    }, 1000)
    return () => clearInterval(id)
  }, [sessionStartTime, isRecording])

  useEffect(() => {
    let cancelled = false

    async function loadLanguages() {
      setLanguagesLoading(true)
      setLanguagesError(null)

      try {
        const res = await fetch(
          `${getTranslationServerBaseUrl()}/translate/get-all-languages`
        )

        if (!res.ok) {
          throw new Error('Unable to load translation languages.')
        }

        const data = (await res.json()) as TranslationLanguage[]
        if (cancelled) {
          return
        }

        setLanguages(data)
        setTargetLanguage(prev => prev || data[0]?.Code || '')
      } catch (error: any) {
        if (cancelled) {
          return
        }

        setLanguages([])
        setLanguagesError(
          error?.message ?? 'Unable to load translation languages.'
        )
      } finally {
        if (!cancelled) {
          setLanguagesLoading(false)
        }
      }
    }

    loadLanguages()

    return () => {
      cancelled = true
    }
  }, [])

  async function handleStartRecording() {
    setFormError(null)

    if (!useMicrophone && !useSystemAudio) {
      setFormError('Enable at least one audio source to start recording.')
      return
    }

    if (!targetLanguage) {
      setFormError('Choose a translation target language before recording.')
      return
    }

    if (
      languages.length > 0 &&
      !languages.some(language => language.Code === targetLanguage)
    ) {
      setFormError('Choose a supported translation target language.')
      return
    }

    try {
      await startRecording({
        useMicrophone,
        useSystemAudio,
        targetLanguage,
      })
      setShowTranscription(true)
    } catch (e: any) {
      setFormError(e?.message ?? 'Unable to start recording.')
      toast({
        title: 'Error start recording.',
        description: e?.message ?? 'Unable to start recording.',
        variant: 'destructive',
      })
    }
  }

  /**
   * Stop the active recording, upload the captured audio with its transcription, and finalize the recorder UI.
   *
   * If no audio is available, displays a destructive toast and aborts. Otherwise uploads the audio and transcription;
   * when the upload completes and the controller is idle the component UI is reset.
   */
  async function handleStopRecording() {
    try {
      const audioBlob = stopRecording()
      if (!audioBlob) {
        log.error('no audio found')
        uploadCtrl.setState('error')
        return
      }
      const success = await uploadCtrl.upload(audioBlob, transcriptWords)
      if (success) {
        handleCloseAll()
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' })
    }
  }

  /**
   * Reset recorder-related state to idle and hide any open transcription UI.
   *
   * Clears the retry flag and backed-up audio blob, hides the live transcription view, resets the session start time, and clears the stopping state.
   */
  function handleCloseAll() {
    setShowTranscription(false)
    setSessionStartTime(null)
    setFormError(null)
  }

  /**
   * Selects the Tailwind CSS class string used for the status badge based on the current recorder status.
   *
   * @returns A string of Tailwind CSS classes for the badge's background, text, and border corresponding to the current status.
   *
   * Mappings:
   * - "recording"  → "bg-red-100 text-red-800 border-red-200"
   * - "connecting" → "bg-yellow-100 text-yellow-800 border-yellow-200"
   * - "processing" → "bg-blue-100 text-blue-800 border-blue-200"
   * - "error"      → "bg-red-100 text-red-800 border-red-200"
   * - default      → "bg-gray-100 text-gray-800 border-gray-200"
   */
  function getStatusColor() {
    switch (status) {
      case 'recording':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'connecting':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  function getStatusIcon() {
    switch (status) {
      case 'recording':
        return <Mic className="w-4 h-4" />
      case 'connecting':
        return <Loader2 className="w-4 h-4 animate-spin" />
      case 'processing':
        return <Loader2 className="w-4 h-4 animate-spin" />
      case 'error':
        return <AlertCircle className="w-4 h-4" />
      default:
        return <MicOff className="w-4 h-4" />
    }
  }

  const displayError = formError ?? errorMessage
  const startDisabled = status === 'connecting' || languagesLoading

  return (
    <>
      <Card className="group hover:shadow-lg transition-all duration-300 border-dashed border-2 border-gray-300 hover:border-red-400 animate-slide-up hover-lift">
        <CardContent className="p-8">
          <div className="space-y-6">
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Badge
                className={`${getStatusColor()} border flex items-center space-x-1`}
              >
                {getStatusIcon()}
                <span className="capitalize">{status}</span>
              </Badge>

              {status === 'recording' && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span>{formatDuration(duration)}</span>
                </div>
              )}
            </div>

            {!isRecording ? (
              <div className="space-y-6 text-left">
                <div className="text-center">
                  <div
                    className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center transition-all duration-300 ${
                      status === 'connecting'
                        ? 'bg-red-500 animate-pulse'
                        : 'bg-red-100 group-hover:bg-red-200'
                    }`}
                  >
                    {status === 'connecting' ? (
                      <Loader2 className="w-8 h-8 text-white animate-spin" />
                    ) : (
                      <Mic className="w-8 h-8 text-red-600" />
                    )}
                  </div>

                  <h3 className="text-lg font-semibold text-primary mb-2">
                    Real-time Recording
                  </h3>

                  <p className="text-gray-600 text-sm">
                    Choose your audio sources and translation target before
                    starting.
                  </p>
                </div>

                <form
                  className="space-y-5"
                  onSubmit={event => {
                    event.preventDefault()
                    handleStartRecording()
                  }}
                >
                  <fieldset className="grid gap-4 rounded-2xl border border-gray-200 bg-gray-50 p-4 sm:grid-cols-2">
                    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-colors hover:border-red-300">
                      <input
                        type="checkbox"
                        checked={useMicrophone}
                        onChange={event => {
                          setFormError(null)
                          setUseMicrophone(event.target.checked)
                        }}
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                      />
                      <span className="space-y-1">
                        <span className="block font-medium text-gray-900">
                          Use microphone
                        </span>
                        <span className="block text-sm text-gray-600">
                          Capture audio from your mic.
                        </span>
                      </span>
                    </label>

                    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-colors hover:border-red-300">
                      <input
                        type="checkbox"
                        checked={useSystemAudio}
                        onChange={event => {
                          setFormError(null)
                          setUseSystemAudio(event.target.checked)
                        }}
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                      />
                      <span className="space-y-1">
                        <span className="block font-medium text-gray-900">
                          Use system audio
                        </span>
                        <span className="block text-sm text-gray-600">
                          Capture tab or screen audio.
                        </span>
                      </span>
                    </label>
                  </fieldset>

                  <div className="space-y-2">
                    <label
                      htmlFor="target-language"
                      className="block text-sm font-medium text-gray-900"
                    >
                      Translation target language
                    </label>
                    <select
                      id="target-language"
                      value={targetLanguage}
                      onChange={event => {
                        setFormError(null)
                        setTargetLanguage(event.target.value)
                      }}
                      disabled={languagesLoading || languages.length === 0}
                      className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm text-gray-900 shadow-sm outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-200 disabled:cursor-not-allowed disabled:bg-gray-100"
                    >
                      <option value="">
                        {languagesLoading
                          ? 'Loading languages...'
                          : 'Select a target language'}
                      </option>
                      {languages.map(language => (
                        <option key={language.Code} value={language.Code}>
                          {language.Name} ({language.Code})
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500">
                      Languages come from the translation service at runtime.
                    </p>
                  </div>

                  {languagesError && (
                    <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                      {languagesError}
                    </p>
                  )}

                  {displayError && (
                    <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 flex items-start gap-2">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{displayError}</span>
                    </p>
                  )}

                  <Button
                    type="submit"
                    disabled={
                      startDisabled ||
                      !targetLanguage ||
                      Boolean(languagesError)
                    }
                    className="hover:cursor-pointer w-full bg-red-600 hover:bg-red-700 transition-all hover:scale-[1.02] shadow-lg hover:shadow-xl"
                  >
                    {status === 'connecting' ? (
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
                </form>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center bg-red-500 animate-pulse">
                    <Square className="w-8 h-8 text-white" />
                  </div>

                  <h3 className="text-lg font-semibold text-primary mb-2">
                    Recording in progress
                  </h3>

                  <p className="text-gray-600 text-sm mb-6">
                    Live transcription is streaming now.
                  </p>
                </div>

                <Button
                  onClick={handleStopRecording}
                  variant="outline"
                  className="w-full border-red-300 text-red-700 hover:bg-red-50 transition-all hover:scale-[1.02]"
                >
                  <Square className="w-4 h-4 mr-2" />
                  Stop & View Transcription
                </Button>
              </div>
            )}

            <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
              {status === 'recording' || status === 'connecting' ? (
                <Wifi className="w-4 h-4 text-green-500" />
              ) : (
                <WifiOff className="w-4 h-4 text-gray-400" />
              )}
              <span>
                {status === 'recording'
                  ? 'Connected to transcription service'
                  : 'Ready to connect'}
              </span>
            </div>
          </div>
        </CardContent>
        <RealTimeTranscriptionPage
          transcriptState={{ transcriptTurns, translateTurns }}
          isVisible={showTranscription}
          onExit={handleStopRecording}
          onStopRecording={handleStopRecording}
        />
      </Card>
      <LoadingOverlay
        state={uploadCtrl.state}
        message="We are uploading your audio pls wait for a bit."
        errorMessage="There was something wrong when uploading your audio, please try again."
        onRetry={() => uploadCtrl.retry(transcriptWords)}
        onDismiss={() => {
          uploadCtrl.dismiss(handleCloseAll)
        }}
      />
    </>
  )
}
