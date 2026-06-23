'use client'

import { log } from '@/utils/logger'
import { useState, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, FileAudio, X } from 'lucide-react'

interface AudioUploadProps {
  onUpload: (file: File) => void | Promise<void>
}

/**
 * UI component that lets the user select or drag-and-drop an audio file and upload it.
 *
 * Renders a drop area and file picker, displays the selected file with size, and provides an upload action.
 *
 * @param onUpload - Callback invoked with the selected audio `File` to perform the upload/transcription.
 *                   On successful completion the selected file is cleared; failures are logged and the component resets its uploading state.
 * @returns The AudioUpload React element.
 */
export function AudioUpload({ onUpload }: AudioUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (file.type.startsWith('audio/')) {
        setSelectedFile(file)
      }
    }
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.type.startsWith('audio/')) {
        setSelectedFile(file)
      }
    }
  }

  const handleUpload = async () => {
    if (selectedFile) {
      setUploading(true)
      try {
        await onUpload(selectedFile)
        setSelectedFile(null)
      } catch (error) {
        log.error('Upload failed:', error)
      } finally {
        setUploading(false)
      }
    }
  }

  return (
    <Card
      className={`h-full group hover:shadow-lg transition-all duration-300 border-dashed border-2 animate-slide-up hover-lift border-border bg-card text-card-foreground ${
        dragActive ? 'border-primary bg-primary/5' : 'hover:border-primary'
      }`}
    >
      <CardContent className="p-8">
        <div
          className="text-center"
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {selectedFile ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-3">
                <FileAudio className="w-8 h-8 text-primary" />
                <div className="text-left">
                  <p className="font-medium text-foreground">
                    {selectedFile.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedFile(null)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                  disabled={uploading}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <Button
                onClick={handleUpload}
                className="w-full transition-all hover:scale-[1.02] shadow-md hover:shadow-lg"
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload & Transcribe
                  </>
                )}
              </Button>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <Upload className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Upload Audio File
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                Drop your audio file here or click to browse
              </p>
              <input
                type="file"
                accept="audio/*"
                onChange={handleFileInput}
                className="hidden"
                id="audio-upload"
              />
              <label htmlFor="audio-upload">
                <Button
                  variant="outline"
                  className="w-full cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md"
                  asChild
                >
                  <span>
                    <Upload className="w-4 h-4 mr-2" />
                    Choose File
                  </span>
                </Button>
              </label>
              <p className="text-xs text-muted-foreground mt-2">
                Supports MP3, WAV, M4A files up to 100MB
              </p>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
