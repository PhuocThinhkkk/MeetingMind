import { supabase } from '@/lib/supabase';
import { createUploadUrl, triggerAnalyze, triggerTranscript } from '@/lib/api';
import { AudioFileRow, UploadAsset } from '@/types/domain';

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
}

async function uploadBlobToSignedUrl(uploadUrl: string, asset: UploadAsset) {
  const fileResponse = await fetch(asset.uri);
  const blob = await fileResponse.blob();
  const uploadResponse = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': asset.mimeType,
    },
    body: blob,
  });

  if (!uploadResponse.ok) {
    throw new Error('Unable to upload audio file');
  }
}

async function insertAudioRow(userId: string, asset: UploadAsset, path: string, isUpload: boolean) {
  const { data, error } = await supabase
    .from('audio_files')
    .insert({
      user_id: userId,
      name: sanitizeFileName(asset.name),
      path,
      duration: Math.round(asset.durationSeconds ?? 0),
      file_size: asset.size,
      mime_type: asset.mimeType,
      transcription_status: isUpload ? 'pending' : 'processing',
    })
    .select('*')
    .single();

  if (error || !data) {
    throw error ?? new Error('Unable to save audio metadata');
  }

  return data as AudioFileRow;
}

export async function waitForTranscription(audioId: string) {
  const { data: initialData, error: initialError } = await supabase
    .from('audio_files')
    .select('transcription_status')
    .eq('id', audioId)
    .single();

  if (initialError) {
    throw initialError;
  }

  if (initialData?.transcription_status === 'done') {
    return;
  }

  if (initialData?.transcription_status === 'failed') {
    throw new Error('Transcription failed');
  }

  await new Promise<void>((resolve, reject) => {
    const channel = supabase
      .channel(`audio-status-${audioId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'audio_files',
          filter: `id=eq.${audioId}`,
        },
        payload => {
          const nextStatus = payload.new.transcription_status;
          if (nextStatus === 'done') {
            supabase.removeChannel(channel);
            resolve();
          }
          if (nextStatus === 'failed') {
            supabase.removeChannel(channel);
            reject(new Error('Transcription failed'));
          }
        }
      )
      .subscribe();
  });
}

export async function uploadAndProcessAudio(params: {
  asset: UploadAsset;
  userId: string;
  accessToken: string;
  isUpload: boolean;
}) {
  const { asset, userId, accessToken, isUpload } = params;
  const signedUpload = await createUploadUrl(
    {
      name: sanitizeFileName(asset.name),
      duration: Math.round(asset.durationSeconds ?? 0),
      size: asset.size,
      type: asset.mimeType,
      isUpload,
    },
    accessToken
  );

  await uploadBlobToSignedUrl(signedUpload.signedUrl, asset);
  const audio = await insertAudioRow(userId, asset, signedUpload.path, isUpload);
  await triggerTranscript(
    audio.id,
    {
      path: signedUpload.path,
      size: asset.size,
      duration: Math.round(asset.durationSeconds ?? 0),
    },
    accessToken
  );
  await waitForTranscription(audio.id);
  await triggerAnalyze(audio.id, accessToken);
  return audio;
}
