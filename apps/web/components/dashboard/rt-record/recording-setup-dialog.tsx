'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Mic, Loader2, AlertCircle, MonitorSpeaker } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { useRecorder } from '@/components/context/realtime-record/realtime-recorder-context'
import {
  requestMicrophoneAudio,
  requestSystemAudio,
} from '@/lib/transcript/audio-worklet-utils'

type TranslationLanguage = {
  Code: string
  Name: string
}

interface RecordingSetupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onStarted: () => void
}

function getTranslationServerBaseUrl() {
  let server = process.env.NEXT_PUBLIC_WS_SERVER_URL || 'localhost:9090'

  server = server.replace(/^wss?:\/\//, '')

  const protocol = location.protocol === 'https:' ? 'https' : 'http'

  return `${protocol}://${server}`
}

export function RecordingSetupDialog({
  open,
  onOpenChange,
  onStarted,
}: RecordingSetupDialogProps) {
  const { startRecording, status, errorMessage } = useRecorder()

  const [microphoneStream, setMicrophoneStream] = useState<MediaStream | null>(
    null
  )

  const [systemAudioStream, setSystemAudioStream] =
    useState<MediaStream | null>(null)

  const [languages, setLanguages] = useState<TranslationLanguage[]>([])
  const [languagesLoading, setLanguagesLoading] = useState(true)
  const [languagesError, setLanguagesError] = useState<string | null>(null)

  const [targetLanguage, setTargetLanguage] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    setFormError(null)
    setLanguagesError(null)
  }, [open])

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
        if (error.message == 'Failed to fetch') {
          setLanguagesError("Can't reaches server languages information.")
          return
        }

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

  async function handleMicrophoneChange(checked: boolean) {
    setFormError(null)

    if (!checked) {
      microphoneStream?.getTracks().forEach(track => track.stop())
      setMicrophoneStream(null)
      return
    }

    try {
      const stream = await requestMicrophoneAudio()
      setMicrophoneStream(stream)
    } catch (error: any) {
      setMicrophoneStream(null)

      setFormError(error?.message ?? 'Unable to access your microphone.')
    }
  }

  async function handleSystemAudioChange(checked: boolean) {
    setFormError(null)

    if (!checked) {
      systemAudioStream?.getTracks().forEach(track => track.stop())
      setSystemAudioStream(null)
      return
    }

    try {
      const stream = await requestSystemAudio()
      setSystemAudioStream(stream)
    } catch (error: any) {
      setSystemAudioStream(null)

      setFormError(error?.message ?? 'Unable to access system audio.')
    }
  }

  async function handleStartRecording() {
    setFormError(null)

    if (!microphoneStream && !systemAudioStream) {
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
        microphoneStream,
        systemAudioStream,
        targetLanguage,
      })

      onStarted()
      onOpenChange(false)
    } catch (e: any) {
      const message = e?.message ?? 'Unable to start recording.'

      setFormError(message)

      toast({
        title: 'Error start recording.',
        description: message,
        variant: 'destructive',
      })
    }
  }

  function handleClose() {
    microphoneStream?.getTracks().forEach(track => track.stop())
    systemAudioStream?.getTracks().forEach(track => track.stop())

    setMicrophoneStream(null)
    setSystemAudioStream(null)
    setFormError(null)

    onOpenChange(false)
  }

  const displayError = formError ?? errorMessage

  return (
    <Dialog
      open={open}
      onOpenChange={value => {
        if (!value) {
          handleClose()
          return
        }

        onOpenChange(value)
      }}
    >
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Set up realtime recording</DialogTitle>

          <DialogDescription>
            Choose your audio sources and translation target before starting the
            session.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Audio sources */}
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-medium">Audio sources</h3>

              <p className="text-sm text-muted-foreground">
                Choose which audio you want to capture.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div
                className={`flex items-start gap-3 rounded-xl border p-4 transition-colors ${
                  microphoneStream
                    ? 'border-red-300 bg-red-50/50'
                    : 'border-border bg-background hover:border-red-300'
                }`}
              >
                <Checkbox
                  id="microphone"
                  checked={microphoneStream !== null}
                  onCheckedChange={checked =>
                    handleMicrophoneChange(checked === true)
                  }
                  disabled={status === 'connecting'}
                  className="mt-0.5"
                />

                <div className="grid gap-1">
                  <Label
                    htmlFor="microphone"
                    className="flex cursor-pointer items-center gap-2 font-medium"
                  >
                    <Mic className="h-4 w-4" />
                    Microphone
                  </Label>

                  <p className="text-sm text-muted-foreground">
                    Capture audio from your microphone.
                  </p>
                </div>
              </div>

              <div
                className={`flex items-start gap-3 rounded-xl border p-4 transition-colors ${
                  systemAudioStream
                    ? 'border-red-300 bg-red-50/50'
                    : 'border-border bg-background hover:border-red-300'
                }`}
              >
                <Checkbox
                  id="system-audio"
                  checked={systemAudioStream !== null}
                  onCheckedChange={checked =>
                    handleSystemAudioChange(checked === true)
                  }
                  disabled={status === 'connecting'}
                  className="mt-0.5"
                />

                <div className="grid gap-1">
                  <Label
                    htmlFor="system-audio"
                    className="flex cursor-pointer items-center gap-2 font-medium"
                  >
                    <MonitorSpeaker className="h-4 w-4" />
                    System audio
                  </Label>

                  <p className="text-sm text-muted-foreground">
                    Capture tab or screen audio.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Translation language */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="target-language">
                Translation target language
              </Label>

              <p className="text-sm text-muted-foreground">
                Choose the language used for translation.
              </p>
            </div>

            <Select
              value={targetLanguage}
              onValueChange={value => {
                setFormError(null)
                setTargetLanguage(value)
              }}
              disabled={
                languagesLoading ||
                languages.length === 0 ||
                status === 'connecting'
              }
            >
              <SelectTrigger id="target-language" className="h-11">
                <SelectValue
                  placeholder={
                    languagesLoading
                      ? 'Loading languages...'
                      : 'Select a target language'
                  }
                />
              </SelectTrigger>

              <SelectContent>
                {languages.map(language => (
                  <SelectItem key={language.Code} value={language.Code}>
                    {language.Name} ({language.Code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <p className="text-xs text-muted-foreground">
              Languages come from the translation service at runtime.
            </p>
          </div>

          {/* Errors */}
          {languagesError && (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{languagesError}</span>
            </div>
          )}

          {displayError && (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{displayError}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={status === 'connecting'}
            >
              Cancel
            </Button>

            <Button
              type="button"
              onClick={handleStartRecording}
              disabled={
                (!microphoneStream && !systemAudioStream) ||
                !targetLanguage ||
                Boolean(languagesError) ||
                status === 'connecting'
              }
              className="bg-red-600 hover:bg-red-700"
            >
              {status === 'connecting' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Mic className="mr-2 h-4 w-4" />
                  Start Recording
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
