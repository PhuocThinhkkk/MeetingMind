import * as DocumentPicker from 'expo-document-picker';
import { AudioModule, RecordingPresets, useAudioRecorder, useAudioRecorderState } from 'expo-audio';

import { askMeetingQuestion } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { uploadAndProcessAudio } from '@/lib/upload';
import {
  AudioFileRow,
  AudioWithTranscript,
  MeetingDetail,
  QALogRow,
  UploadAsset,
} from '@/types/domain';

export async function getAudioHistory(userId: string) {
  const { data, error } = await supabase
    .from('audio_files')
    .select(
      `
        *,
        transcript:transcripts!left(*)
      `
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (
    data?.map(item => ({
      ...item,
      transcript: Array.isArray(item.transcript) ? item.transcript[0] : item.transcript,
    })) ?? []
  ) as AudioWithTranscript[];
}

export async function getMeetingDetail(audioId: string) {
  const [{ data: audio, error: audioError }, { data: transcript, error: transcriptError }, { data: summary, error: summaryError }, { data: events, error: eventsError }, { data: qaLogs, error: qaError }] =
    await Promise.all([
      supabase.from('audio_files').select('*').eq('id', audioId).single(),
      supabase
        .from('transcripts')
        .select('*, transcription_words(*)')
        .eq('audio_id', audioId)
        .maybeSingle(),
      supabase.from('summaries').select('*').eq('audio_id', audioId).maybeSingle(),
      supabase.from('events').select('*').eq('audio_id', audioId).order('start_time', { ascending: true }),
      supabase.from('qa_logs').select('*').eq('audio_id', audioId).order('created_at', { ascending: true }),
    ]);

  if (audioError) throw audioError;
  if (transcriptError) throw transcriptError;
  if (summaryError) throw summaryError;
  if (eventsError) throw eventsError;
  if (qaError) throw qaError;

  return {
    audio: audio as AudioFileRow,
    transcript: transcript as MeetingDetail['transcript'],
    summary: summary,
    events: (events ?? []) as MeetingDetail['events'],
    qaLogs: (qaLogs ?? []) as MeetingDetail['qaLogs'],
  } satisfies MeetingDetail;
}

export async function saveQaLog(input: {
  userId: string;
  audioId: string;
  question: string;
  transcript: string;
  previousAnswers: string[];
  accessToken: string;
}) {
  const response = await askMeetingQuestion(
    {
      question: input.question,
      transcript: input.transcript,
      passQA: input.previousAnswers,
    },
    input.accessToken
  );

  const { data, error } = await supabase
    .from('qa_logs')
    .insert({
      user_id: input.userId,
      audio_id: input.audioId,
      question: input.question,
      answer: response.answer,
      confidence_score: 1,
    })
    .select('*')
    .single();

  if (error || !data) {
    throw error ?? new Error('Unable to save Q&A log');
  }

  return data as QALogRow;
}

export async function pickAudioAsset() {
  const result = await DocumentPicker.getDocumentAsync({
    type: ['audio/*'],
    copyToCacheDirectory: true,
    multiple: false,
  });

  if (result.canceled) {
    return null;
  }

  const file = result.assets[0];
  return {
    uri: file.uri,
    mimeType: file.mimeType ?? 'audio/mpeg',
    name: file.name,
    size: file.size ?? 0,
  } satisfies UploadAsset;
}

export async function processPickedAudio(input: {
  asset: UploadAsset;
  userId: string;
  accessToken: string;
}) {
  return uploadAndProcessAudio({
    asset: input.asset,
    userId: input.userId,
    accessToken: input.accessToken,
    isUpload: true,
  });
}

export function useMeetingRecorder() {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);

  async function start() {
    const status = await AudioModule.requestRecordingPermissionsAsync();
    if (!status.granted) {
      throw new Error('Microphone permission is required to record meetings');
    }
    await recorder.prepareToRecordAsync();
    recorder.record();
  }

  async function stopAndCreateAsset() {
    await recorder.stop();
    const uri = recorder.uri;
    if (!uri) {
      throw new Error('No recording was created');
    }

    return {
      uri,
      mimeType: 'audio/m4a',
      name: `meeting-${Date.now()}.m4a`,
      size: 0,
      durationSeconds: Math.max((recorderState.durationMillis ?? 0) / 1000, 0),
    } satisfies UploadAsset;
  }

  return {
    recorder,
    recorderState,
    start,
    stopAndCreateAsset,
  };
}

export async function processRecordedAudio(input: {
  asset: UploadAsset;
  userId: string;
  accessToken: string;
}) {
  return uploadAndProcessAudio({
    asset: input.asset,
    userId: input.userId,
    accessToken: input.accessToken,
    isUpload: false,
  });
}
