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
 * Validate that the provided value is a File representing an allowed audio file.
 *
 * @param file - The uploaded file to validate; may be `null`.
 * @throws `Error` with message "No file upload" if `file` is `null` or `undefined`.
 * @throws `Error` with message "Invalid file type" if `file.type` is not one of the allowed audio MIME types.
 * @throws `Error` with message "Invalid file extension" if the file's extension is not in the allowed extensions list.
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