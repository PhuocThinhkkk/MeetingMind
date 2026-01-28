const ALLOWED_AUDIO_TYPES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/webm',
  'audio/mp4',
  'audio/m4a',
]
export function validateAudioFile(file: File | null): asserts file is File {
  if (!file) {
    throw new Error('No file upload')
  }

  if (!ALLOWED_AUDIO_TYPES.includes(file.type)) {
    throw new Error('Invalid file type')
  }
}
