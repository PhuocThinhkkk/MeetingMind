import { BUCKET_NAME, SIGNED_URL_EXPIRED_SECONDS } from '@/constains/storage'
import { supabaseAdmin } from '@/lib/supabase-init/supabase-server'

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
