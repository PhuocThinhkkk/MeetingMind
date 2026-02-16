/**
 * Create a File object from a Blob using the provided file name.
 *
 * @param blob - Source Blob whose data will be used as the File contents; its MIME type is preserved when present.
 * @param fileName - File name to assign to the created File.
 * @returns A File whose contents come from `blob`, whose name is `fileName`, whose `type` is `blob.type` or `'audio/wav'` if absent, and whose `lastModified` is the current timestamp.
 */
export function blobToFile(blob: Blob, fileName: string): File {
  return new File([blob], fileName, {
    type: blob.type || 'audio/wav',
    lastModified: Date.now(),
  })
}