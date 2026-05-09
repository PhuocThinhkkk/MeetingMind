import { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Searchbar, SegmentedButtons, Text } from 'react-native-paper';

import { AppShell, SectionHeading } from '@/components/app-shell';
import { AuthGuard } from '@/components/auth-guard';
import { EmptyState } from '@/components/empty-state';
import { MeetingCard } from '@/components/meeting-card';
import { useAuth } from '@/providers/auth-provider';
import { getAudioHistory } from '@/services/meetings';
import { AudioWithTranscript } from '@/types/domain';

const FILTERS = ['all', 'done', 'processing', 'pending', 'failed'] as const;

export default function LibraryScreen() {
  return (
    <AuthGuard>
      <LibraryContent />
    </AuthGuard>
  );
}

function LibraryContent() {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState<AudioWithTranscript[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<(typeof FILTERS)[number]>('all');

  const fetchMeetings = useCallback(async () => {
    if (!user) return;
    setMeetings(await getAudioHistory(user.id));
  }, [user]);

  useEffect(() => {
    fetchMeetings().catch(() => undefined);
  }, [fetchMeetings]);

  const filteredMeetings = useMemo(() => {
    return meetings.filter(meeting => {
      const matchesSearch =
        !search.trim() || meeting.name.toLowerCase().includes(search.trim().toLowerCase());
      const normalizedStatus = meeting.transcription_status?.toLowerCase() ?? 'unknown';
      const matchesStatus = status === 'all' ? true : normalizedStatus === status;
      return matchesSearch && matchesStatus;
    });
  }, [meetings, search, status]);

  async function refresh() {
    try {
      setRefreshing(true);
      await fetchMeetings();
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <AppShell
      title="Meeting Library"
      subtitle="Search transcripts and reopen the important ones"
      refreshing={refreshing}
      onRefresh={refresh}
    >
      <SectionHeading
        eyebrow="Archive"
        title="Your searchable transcript stack"
        caption="Filter by status, scan recent uploads, and jump back into a meeting with one tap."
      />

      <Searchbar
        placeholder="Search by file name"
        value={search}
        onChangeText={setSearch}
        style={styles.search}
      />
      <SegmentedButtons
        value={status}
        onValueChange={value => setStatus(value as (typeof FILTERS)[number])}
        buttons={FILTERS.map(value => ({
          value,
          label: value === 'all' ? 'All' : value.charAt(0).toUpperCase() + value.slice(1),
        labelStyle: {
      color: value === status ? '#ffffff' : '#5D6470',
    },
        }))}
      />

      <Text variant="bodyMedium" style={styles.meta}>
        {filteredMeetings.length} meeting{filteredMeetings.length === 1 ? '' : 's'} visible
      </Text>

      {filteredMeetings.length === 0 ? (
        <EmptyState
          title="No matching meetings"
          description="Try a different search term or status filter. New uploads and recordings will appear here automatically."
        />
      ) : null}

      {filteredMeetings.map(meeting => (
        <MeetingCard key={meeting.id} meeting={meeting} />
      ))}
    </AppShell>
  );
}

const styles = StyleSheet.create({
  search: {
    backgroundColor: '#FFFCF6',
  },
  meta: {
    color: '#5D6470',
  },
});
