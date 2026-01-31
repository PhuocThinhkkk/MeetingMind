'use client'

import { useRef, useState } from 'react'
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

import { AudioFileRow, Transcript, TranscriptWithWordNested } from '@/types/transcriptions/transcription.db'
import { validateAudioTime } from '@/lib/validations/audio-validations'
import { cn } from '@/lib/utils'

type Props = {
    audioFile: AudioFileRow
    transcript?: TranscriptWithWordNested
}

export function TranscriptTab({ audioFile, transcript }: Props) {
    const audioRef = useRef<HTMLAudioElement>(null)

    const [isPlaying, setIsPlaying] = useState(false)
    const [muted, setMuted] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)

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

    function formatTime(sec: number) {
        const m = Math.floor(sec / 60)
        const s = Math.floor(sec % 60)
        return `${m}:${s.toString().padStart(2, '0')}`
    }

    const WINDOW_BEFORE = 350
    const WINDOW_AFTER = 350

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

                    <audio
                        ref={audioRef}
                        src={audioFile.url}
                        className="hidden"
                        onLoadedMetadata={() =>
                            audioRef.current && setDuration(audioRef.current.duration)
                        }
                        onTimeUpdate={() =>
                            audioRef.current && setCurrentTime(audioRef.current.currentTime)
                        }
                        onEnded={() => setIsPlaying(false)}
                    />
                </div>
            </CardHeader>

            <CardContent>
                <ScrollArea className="h-[40vh] text-sm">
                    <div className="flex flex-wrap gap-0">
                        {transcript.transcription_words?.map(word => {
                            if (!word.end_time || !word.start_time) return
                            const isActive =
                                currentMs >= word.start_time - WINDOW_BEFORE &&
                                currentMs <= word.end_time + WINDOW_AFTER

                            return (
                                <span
                                    key={word.id}
                                    onClick={() => {
                                        if (!audioRef.current) return
                                        if (!word.start_time) return
                                        audioRef.current.currentTime = word.start_time / 1000
                                    }}
                                    className={cn(
                                        'cursor-pointer rounded-xs px-1 py-0.5 transition',
                                        isActive
                                            ? 'bg-primary text-primary-foreground'
                                            : 'hover:bg-muted'
                                    )}
                                >
                                    {word.text}
                                </span>
                            )
                        })}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    )
}
