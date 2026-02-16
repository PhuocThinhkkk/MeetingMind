import { BUCKET_NAME, SIGNED_URL_EXPIRED_SECONDS } from '@/constains/storage'
import { supabaseAdmin } from '@/lib/supabase-init/supabase-server'

/**
 * Create a time-limited signed URL for an audio file stored in the configured bucket.
 *
 * @param path - Object path within the storage bucket
 * @param expiresIn - Time-to-live for the signed URL in seconds
 * @returns The generated signed URL as a string
 * @throws Error if the signed URL could not be created
 */
export async function getSignedAudioUrl(
  path: string,
  expiresIn = SIGNED_URL_EXPIRED_SECONDS
) {
  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET_NAME)
    .createSignedUrl(path, expiresIn)

  if (error || !data?.signedUrl) {
    throw new Error('Failed to create signed URL')
  }

  return data.signedUrl
}