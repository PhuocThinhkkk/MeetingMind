const ALLOWED_AUDIO_TYPES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/webm',
  'audio/mp4',
  'audio/m4a',
]
const allowedExtensions = ['.mp3', '.wav', '.webm', '.m4a', '.mp4']

/**
 * Asserts that the provided value is a File and that its MIME type is an allowed audio type.
 *
 * @param file - The uploaded file to validate; may be `null`.
 * @throws `Error` with message "No file upload" if `file` is `null` or `undefined`.
 * @throws `Error` with message "Invalid file type" if `file.type` is not in the allowed audio MIME types.
 */
export function validateAudioFile(file: File | null): asserts file is File {
  if (!file) {
    throw new Error('No file upload')
  }

  if (!ALLOWED_AUDIO_TYPES.includes(file.type)) {
    throw new Error('Invalid file type')
  }

  const ext = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))

  if (!allowedExtensions.includes(ext)) {
    throw new Error('Invalid file extension')
  }
}
