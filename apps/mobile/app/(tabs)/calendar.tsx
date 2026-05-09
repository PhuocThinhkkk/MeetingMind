import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Card, Divider, Text } from 'react-native-paper';

import { AppShell, SectionHeading } from '@/components/app-shell';
import { AuthGuard } from '@/components/auth-guard';
import { EmptyState } from '@/components/empty-state';
import { formatEventDate } from '@/lib/format';
import { useAuth } from '@/providers/auth-provider';
import {
  connectCalendar,
  getCalendarEvents,
  getGoogleCalendarProfile,
  syncCalendarEvent,
} from '@/services/calendar';

type CalendarEventWithAudio = Awaited<ReturnType<typeof getCalendarEvents>>[number];

export default function CalendarScreen() {
  return (
    <AuthGuard>
      <CalendarContent />
    </AuthGuard>
  );
}

function CalendarContent() {
  const { user, session } = useAuth();
  const [events, setEvents] = useState<CalendarEventWithAudio[]>([]);
  const [profileName, setProfileName] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [busyEventId, setBusyEventId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!user || !session?.access_token) return;
    const [nextEvents, profile] = await Promise.all([
      getCalendarEvents(user.id),
      getGoogleCalendarProfile(session.access_token),
    ]);
    setEvents(nextEvents);
    setProfileName(profile?.email ?? null);
  }, [session?.access_token, user]);

  useEffect(() => {
    loadData().catch(loadError => setError(loadError.message));
  }, [loadData]);

  const [upcoming, unsynced] = useMemo(() => {
    return [
      events.filter(event => event.added_to_google_calendar),
      events.filter(event => !event.added_to_google_calendar),
    ];
  }, [events]);

  async function refresh() {
    try {
      setRefreshing(true);
      await loadData();
    } finally {
      setRefreshing(false);
    }
  }

  async function handleConnectGoogle() {
    if (!session?.access_token) return;
    try {
      setError(null);
      await connectCalendar(session.access_token);
      await loadData();
    } catch (connectError: any) {
      setError(connectError.message ?? 'Unable to connect Google Calendar');
    }
  }

  async function handleSyncEvent(eventId: string) {
    if (!session?.access_token) return;
    try {
      setBusyEventId(eventId);
      setError(null);
      await syncCalendarEvent(eventId, session.access_token);
      await loadData();
    } catch (syncError: any) {
      setError(syncError.message ?? 'Unable to sync event');
    } finally {
      setBusyEventId(null);
    }
  }

  return (
    <AppShell
      title="Calendar"
      subtitle="Push decisions and follow-ups into your schedule"
      refreshing={refreshing}
      onRefresh={refresh}
    >
      <SectionHeading
        eyebrow="Sync"
        title="Google Calendar handoff"
        caption="Review extracted events, connect your Google account, and send only the important ones to your calendar."
      />

      <Card mode="contained" style={styles.card}>
        <Card.Content style={styles.content}>
          <Text variant="titleMedium" style={styles.cardTitle}>
            Google account
          </Text>
          <Text variant="bodyMedium" style={styles.copy}>
            {profileName
              ? `Connected as ${profileName}`
              : 'Connect Google Calendar to push detected events directly from mobile.'}
          </Text>
          <Button mode={profileName ? 'contained-tonal' : 'contained'} onPress={handleConnectGoogle}>
            {profileName ? 'Reconnect Google Calendar' : 'Connect Google Calendar'}
          </Button>
        </Card.Content>
      </Card>

      {error ? (
        <Card mode="contained" style={styles.errorCard}>
          <Card.Content>
            <Text style={{ color: '#8B2D1E' }}>{error}</Text>
          </Card.Content>
        </Card>
      ) : null}

      <SectionHeading
        eyebrow="Queue"
        title="Unsynced events"
        caption="These events were extracted from meeting summaries and are ready to move into Google Calendar."
      />

      {unsynced.length === 0 ? (
        <EmptyState
          title="Nothing waiting to sync"
          description="Detected events will appear here after a meeting transcript has been summarized."
        />
      ) : null}

      {unsynced.map(event => (
        <Card key={event.id} mode="contained" style={styles.card}>
          <Card.Content style={styles.content}>
            <Text variant="titleMedium" style={styles.cardTitle}>
              {event.title}
            </Text>
            <Text variant="bodyMedium" style={styles.copy}>
              {formatEventDate(event.start_time)}
            </Text>
            <Text variant="bodySmall" style={styles.copy}>
              From “{event.audioName}”
            </Text>
            {event.location ? (
              <Text variant="bodySmall" style={styles.copy}>
                {event.location}
              </Text>
            ) : null}
            <Button
              mode="contained"
              onPress={() => handleSyncEvent(event.id)}
              loading={busyEventId === event.id}
              disabled={busyEventId === event.id}
            >
              Add to Google Calendar
            </Button>
          </Card.Content>
        </Card>
      ))}

      <SectionHeading
        eyebrow="Upcoming"
        title="Already synced"
        caption="Events below have already been pushed into your Google Calendar."
      />

      {upcoming.length === 0 ? (
        <EmptyState
          title="No synced events yet"
          description="Once you add an extracted event to Google Calendar, it will show up here as confirmation."
        />
      ) : null}

      {upcoming.map(event => (
        <Card key={event.id} mode="contained" style={styles.card}>
          <Card.Content>
            <View style={styles.syncedRow}>
              <View style={{ flex: 1 }}>
                <Text variant="titleMedium" style={styles.cardTitle}>
                  {event.title}
                </Text>
                <Text variant="bodyMedium" style={styles.copy}>
                  {formatEventDate(event.start_time)}
                </Text>
                <Text variant="bodySmall" style={styles.copy}>
                  From “{event.audioName}”
                </Text>
              </View>
              <Text variant="labelLarge" style={styles.syncedLabel}>
                Synced
              </Text>
            </View>
            <Divider style={{ marginTop: 12 }} />
          </Card.Content>
        </Card>
      ))}
    </AppShell>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFCF6',
  },
  content: {
    gap: 10,
  },
  cardTitle: {
    color: '#1B1D22',
    fontWeight: '700',
  },
  copy: {
    color: '#5D6470',
  },
  errorCard: {
    backgroundColor: '#FFF1ED',
  },
  syncedRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  syncedLabel: {
    color: '#0E5B41',
    fontWeight: '800',
  },
});
