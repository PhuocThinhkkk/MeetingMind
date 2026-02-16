'use client'

import { useEffect, useRef, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Slider } from '@/components/ui/slider'
import {
    Clock,
    User,
    Play,
    Pause,
    Volume2,
    VolumeX,
    FileAudio,
} from 'lucide-react'

import { validateAudioTime } from '@/lib/validations/audio-validations'
import { useTranscriptionView } from '@/components/context/transcription-view-context'
import { TranscriptSentences } from './transcript-sentences'
import { fetchUrlDownload } from '@/lib/queries/browser/audio-transcript-pineline/utils'
import { log } from '@/lib/logger'

export function TranscriptTab() {
    const { audio: audioFile, transcript } = useTranscriptionView()
    const audioRef = useRef<HTMLAudioElement>(null)
    const [audioUrl, setAudioUrl] = useState<null | string>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [muted, setMuted] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    log.info("data: ", {
        audioFile, audioUrl
    })

    useEffect(() => {
        fetchAudioUrl()
    }, [audioFile])

    /**
     * Obtains a presigned download URL for the current audio file and stores it in component state.
     *
     * If no audio file is available, the function returns without side effects.
     * Errors encountered while fetching the URL are caught and logged.
     */
    async function fetchAudioUrl() {
        try {
            if (!audioFile) {
                return
            }
            const url = await fetchUrlDownload({ path: audioFile.path })
            setAudioUrl(url)
        } catch (e) {
            log.error("Error when fetching presigned url: ", e)
        }
    }

    if (!transcript) {
        return <p className="text-muted-foreground">No transcript available.</p>
    }

    const safeDuration = validateAudioTime(audioFile.duration)
    const currentMs = currentTime * 1000

    function togglePlay() {
        if (!audioRef.current) return
        isPlaying ? audioRef.current.pause() : audioRef.current.play()
        setIsPlaying(!isPlaying)
    }

    function toggleMute() {
        if (!audioRef.current) return
        audioRef.current.muted = !muted
        setMuted(!muted)
    }

    function seek(val: number[]) {
        if (!audioRef.current || duration === 0) return
        audioRef.current.currentTime = (val[0] / 100) * duration
    }

    /**
     * Format a time given in seconds as "M:SS".
     *
     * @param sec - Time in seconds.
     * @returns The formatted time string with minutes (no leading zeros) and seconds padded to two digits, e.g. "2:05".
     */
    function formatTime(sec: number) {
        const m = Math.floor(sec / 60)
        const s = Math.floor(sec % 60)
        return `${m}:${s.toString().padStart(2, '0')}`
    }

    return (
        <Card className="h-full">
            <CardHeader className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2">
                        <FileAudio className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{audioFile.name}</CardTitle>
                </div>

                <div className="flex gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatTime(safeDuration)}
                    </span>

                    <span className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {
                            transcript.speakers_detected ?? 1} speakers
                    </span>
                </div>

                {/* Player */}
                <div className="flex items-center gap-4 rounded-lg bg-muted/30 p-3">
                    <button
                        onClick={togglePlay}
                        className="rounded-full bg-primary p-2 text-white"
                    >
                        {isPlaying ? <Pause /> : <Play />}
                    </button>

                    <span className="w-10 text-xs text-right">
                        {formatTime(currentTime)}
                    </span>

                    <Slider
                        value={[duration ? (currentTime / duration) * 100 : 0]}
                        max={100}
                        step={0.1}
                        onValueChange={seek}
                        className="flex-1"
                    />

                    <span className="w-10 text-xs">
                        {formatTime(duration)}
                    </span>

                    <button onClick={toggleMute}>
                        {muted ? <VolumeX /> : <Volume2 />}
                    </button>

                    {audioUrl &&
                        <audio
                            ref={audioRef}
                            src={audioUrl}
                            className="hidden"
                            onLoadedMetadata={() =>
                                audioRef.current && setDuration(audioRef.current.duration)
                            }
                            onTimeUpdate={() =>
                                audioRef.current && setCurrentTime(audioRef.current.currentTime)
                            }
                            onEnded={() => setIsPlaying(false)}
                        />
                    }
                </div>
            </CardHeader>

            <CardContent>
                <ScrollArea className="h-[40vh] text-sm">
                    <TranscriptSentences
                        words={transcript.transcription_words}
                        currentMs={currentMs}
                        audioRef={audioRef}
                    />
                </ScrollArea>
            </CardContent>
        </Card>
    )
}