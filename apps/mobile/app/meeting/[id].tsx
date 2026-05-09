import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Button,
  Card,
  SegmentedButtons,
  Text,
  TextInput,
} from 'react-native-paper';

import { AuthGuard } from '@/components/auth-guard';
import { EmptyState } from '@/components/empty-state';
import { StatusChip } from '@/components/status-chip';
import { estimateWordCount, formatEventDate, formatRelativeDate } from '@/lib/format';
import { useAuth } from '@/providers/auth-provider';
import { getMeetingDetail, saveQaLog } from '@/services/meetings';
import { syncCalendarEvent } from '@/services/calendar';
import { MeetingDetail } from '@/types/domain';

type TabValue = 'transcript' | 'summary' | 'events' | 'qa';

export default function MeetingDetailScreen() {
  return (
    <AuthGuard>
      <MeetingDetailContent />
    </AuthGuard>
  );
}

function MeetingDetailContent() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, session } = useAuth();
  const [meeting, setMeeting] = useState<MeetingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabValue>('transcript');
  const [question, setQuestion] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!id) return;
      const nextMeeting = await getMeetingDetail(id);
      if (mounted) {
        setMeeting(nextMeeting);
        setLoading(false);
      }
    }
    load().catch(() => setLoading(false));
    return () => {
      mounted = false;
    };
  }, [id]);

  const summaryStats = useMemo(() => {
    return {
      words: estimateWordCount(meeting?.transcript?.text),
      questions: meeting?.qaLogs.length ?? 0,
      events: meeting?.events.length ?? 0,
    };
  }, [meeting?.events.length, meeting?.qaLogs.length, meeting?.transcript?.text]);

  async function handleAskQuestion() {
    if (!meeting || !user || !session?.access_token || !question.trim()) return;
    try {
      setBusy(true);
      const qaLog = await saveQaLog({
        userId: user.id,
        audioId: meeting.audio.id,
        question: question.trim(),
        transcript: meeting.transcript?.text ?? '',
        previousAnswers: meeting.qaLogs.map(item => item.answer),
        accessToken: session.access_token,
      });
      setMeeting({ ...meeting, qaLogs: [...meeting.qaLogs, qaLog] });
      setQuestion('');
    } finally {
      setBusy(false);
    }
  }

  async function handleSyncEvent(eventId: string) {
    if (!meeting || !session?.access_token) return;
    try {
      setBusy(true);
      await syncCalendarEvent(eventId, session.access_token);
      setMeeting({
        ...meeting,
        events: meeting.events.map(event =>
          event.id === eventId ? { ...event, added_to_google_calendar: true } : event
        ),
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Stack.Screen options={{ title: meeting?.audio.name ?? 'Meeting Detail' }} />
      {loading || !meeting ? (
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color="#153C54" />
        </View>
      ) : (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
          <Card mode="contained" style={styles.heroCard}>
            <Card.Content style={styles.heroContent}>
              <View style={styles.heroHeader}>
                <View style={{ flex: 1 }}>
                  <Text variant="headlineSmall" style={styles.heroTitle}>
                    {meeting.audio.name}
                  </Text>
                  <Text variant="bodyMedium" style={styles.heroMeta}>
                    {formatRelativeDate(meeting.audio.created_at)}
                  </Text>
                </View>
                <StatusChip status={meeting.audio.transcription_status} />
              </View>

              <View style={styles.metricRow}>
                <View style={styles.metricBlock}>
                  <Text variant="labelMedium" style={styles.metricLabel}>
                    Transcript words
                  </Text>
                  <Text variant="titleLarge" style={styles.metricValue}>
                    {summaryStats.words}
                  </Text>
                </View>
                <View style={styles.metricBlock}>
                  <Text variant="labelMedium" style={styles.metricLabel}>
                    Events
                  </Text>
                  <Text variant="titleLarge" style={styles.metricValue}>
                    {summaryStats.events}
                  </Text>
                </View>
                <View style={styles.metricBlock}>
                  <Text variant="labelMedium" style={styles.metricLabel}>
                    Q&A
                  </Text>
                  <Text variant="titleLarge" style={styles.metricValue}>
                    {summaryStats.questions}
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>

          <SegmentedButtons
            value={activeTab}
            onValueChange={value => setActiveTab(value as TabValue)}
            buttons={[
              { value: 'transcript', label: 'Transcript' },
              { value: 'summary', label: 'Summary' },
              { value: 'events', label: 'Events' },
              { value: 'qa', label: 'Q&A' },
            ]}
          />

          {activeTab === 'transcript' ? (
            <Card mode="contained" style={styles.card}>
              <Card.Content style={styles.sectionContent}>
                <Text variant="titleMedium" style={styles.cardTitle}>
                  Full transcript
                </Text>
                <Text variant="bodyMedium" style={styles.copy}>
                  {meeting.transcript?.text || 'Transcript is still processing.'}
                </Text>
              </Card.Content>
            </Card>
          ) : null}

          {activeTab === 'summary' ? (
            <Card mode="contained" style={styles.card}>
              <Card.Content style={styles.sectionContent}>
                <Text variant="titleMedium" style={styles.cardTitle}>
                  AI summary
                </Text>
                <Text variant="bodyMedium" style={styles.copy}>
                  {meeting.summary?.text || 'Summary is not ready yet.'}
                </Text>

                {meeting.summary?.highlights?.length ? (
                  <View style={styles.listBlock}>
                    <Text variant="labelLarge" style={styles.listTitle}>
                      Highlights
                    </Text>
                    {meeting.summary.highlights.map(item => (
                      <Text key={item} variant="bodyMedium" style={styles.bullet}>
                        • {item}
                      </Text>
                    ))}
                  </View>
                ) : null}

                {meeting.summary?.todo?.length ? (
                  <View style={styles.listBlock}>
                    <Text variant="labelLarge" style={styles.listTitle}>
                      Action items
                    </Text>
                    {meeting.summary.todo.map(item => (
                      <Text key={item} variant="bodyMedium" style={styles.bullet}>
                        • {item}
                      </Text>
                    ))}
                  </View>
                ) : null}
              </Card.Content>
            </Card>
          ) : null}

          {activeTab === 'events' ? (
            <>
              {meeting.events.length === 0 ? (
                <EmptyState
                  title="No events extracted"
                  description="Detected meetings, deadlines, and follow-ups will appear here after AI analysis finishes."
                />
              ) : null}

              {meeting.events.map(event => (
                <Card key={event.id} mode="contained" style={styles.card}>
                  <Card.Content style={styles.sectionContent}>
                    <Text variant="titleMedium" style={styles.cardTitle}>
                      {event.title}
                    </Text>
                    <Text variant="bodyMedium" style={styles.copy}>
                      {formatEventDate(event.start_time)}
                    </Text>
                    {event.location ? (
                      <Text variant="bodySmall" style={styles.copy}>
                        {event.location}
                      </Text>
                    ) : null}
                    {event.description ? (
                      <Text variant="bodySmall" style={styles.copy}>
                        {event.description}
                      </Text>
                    ) : null}
                    <Button
                      mode={event.added_to_google_calendar ? 'contained-tonal' : 'contained'}
                      disabled={Boolean(event.added_to_google_calendar) || busy}
                      onPress={() => handleSyncEvent(event.id)}
                    >
                      {event.added_to_google_calendar ? 'Added to Google Calendar' : 'Sync to Google Calendar'}
                    </Button>
                  </Card.Content>
                </Card>
              ))}
            </>
          ) : null}

          {activeTab === 'qa' ? (
            <Card mode="contained" style={styles.card}>
              <Card.Content style={styles.sectionContent}>
                <Text variant="titleMedium" style={styles.cardTitle}>
                  Ask follow-up questions
                </Text>
                {meeting.qaLogs.length === 0 ? (
                  <Text variant="bodyMedium" style={styles.copy}>
                    Ask about decisions, deadlines, or people mentioned in the meeting.
                  </Text>
                ) : (
                  meeting.qaLogs.map(log => (
                    <View key={log.id} style={styles.qaBubble}>
                      <Text variant="labelLarge" style={styles.question}>
                        Q: {log.question}
                      </Text>
                      <Text variant="bodyMedium" style={styles.answer}>
                        {log.answer}
                      </Text>
                    </View>
                  ))
                )}
                <TextInput
                  mode="outlined"
                  multiline
                  label="Ask about this meeting"
                  value={question}
                  onChangeText={setQuestion}
                />
                <Button mode="contained" onPress={handleAskQuestion} loading={busy} disabled={busy}>
                  Send question
                </Button>
              </Card.Content>
            </Card>
          ) : null}
        </ScrollView>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F3EA',
  },
  content: {
    padding: 18,
    gap: 16,
    paddingBottom: 32,
  },
  loadingState: {
    flex: 1,
    backgroundColor: '#F7F3EA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroCard: {
    backgroundColor: '#153C54',
  },
  heroContent: {
    gap: 16,
  },
  heroHeader: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  heroTitle: {
    color: '#FDFBF6',
    fontWeight: '800',
  },
  heroMeta: {
    color: '#DCE8EF',
  },
  metricRow: {
    flexDirection: 'row',
    gap: 10,
  },
  metricBlock: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 18,
    padding: 12,
  },
  metricLabel: {
    color: '#9DD3E7',
  },
  metricValue: {
    color: '#FDFBF6',
    fontWeight: '800',
  },
  card: {
    backgroundColor: '#FFFCF6',
  },
  sectionContent: {
    gap: 12,
  },
  cardTitle: {
    color: '#1B1D22',
    fontWeight: '700',
  },
  copy: {
    color: '#5D6470',
    lineHeight: 22,
  },
  listBlock: {
    gap: 6,
  },
  listTitle: {
    color: '#153C54',
    fontWeight: '700',
  },
  bullet: {
    color: '#5D6470',
  },
  qaBubble: {
    gap: 6,
    backgroundColor: '#F0E8D8',
    borderRadius: 18,
    padding: 14,
  },
  question: {
    color: '#153C54',
    fontWeight: '700',
  },
  answer: {
    color: '#39414D',
    lineHeight: 20,
  },
});
