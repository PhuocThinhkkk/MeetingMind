import { connectGoogleCalendar, fetchGoogleProfile, syncEventToGoogleCalendar } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { EventItemRow } from '@/types/domain';

export async function getCalendarEvents(userId: string) {
  const { data, error } = await supabase
    .from('audio_files')
    .select('id, name, events(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  const flattened =
    data?.flatMap(audio =>
      (audio.events ?? []).map(event => ({
        ...(event as EventItemRow),
        audioName: audio.name,
      }))
    ) ?? [];

  return flattened.sort(
    (left, right) => new Date(left.start_time).getTime() - new Date(right.start_time).getTime()
  );
}

export async function getGoogleCalendarProfile(accessToken: string) {
  try {
    return await fetchGoogleProfile(accessToken);
  } catch (error) {
    return null;
  }
}

export async function connectCalendar(accessToken: string) {
  return connectGoogleCalendar(accessToken);
}

export async function syncCalendarEvent(eventId: string, accessToken: string) {
  return syncEventToGoogleCalendar(eventId, accessToken);
}
