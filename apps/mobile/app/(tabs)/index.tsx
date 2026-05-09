import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { ActivityIndicator, Button, Card, IconButton, ProgressBar, Text } from 'react-native-paper';

import { AppShell, SectionHeading } from '@/components/app-shell';
import { AuthGuard } from '@/components/auth-guard';
import { EmptyState } from '@/components/empty-state';
import { MeetingCard } from '@/components/meeting-card';
import { formatDuration } from '@/lib/format';
import { useAuth } from '@/providers/auth-provider';
import {
  getAudioHistory,
  pickAudioAsset,
  processPickedAudio,
  processRecordedAudio,
  useMeetingRecorder,
} from '@/services/meetings';
import { AudioWithTranscript } from '@/types/domain';

export default function HomeScreen() {
  return (
    <AuthGuard>
      <HomeContent />
    </AuthGuard>
  );
}

function HomeContent() {
  const { user, session } = useAuth();
  const { recorderState, start, stopAndCreateAsset } = useMeetingRecorder();
  const [meetings, setMeetings] = useState<AudioWithTranscript[]>([]);
  const [busy, setBusy] = useState<'idle' | 'uploading' | 'recording' | 'processing'>('idle');
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMeetings = useCallback(async () => {
    if (!user) return;
    const nextMeetings = await getAudioHistory(user.id);
    setMeetings(nextMeetings);
  }, [user]);

  useEffect(() => {
    fetchMeetings().catch(fetchError => setError(fetchError.message));
  }, [fetchMeetings]);

  const usage = useMemo(() => {
    const totalSeconds = meetings.reduce((sum, item) => sum + (item.duration ?? 0), 0);
    const doneCount = meetings.filter(item => item.transcription_status === 'done').length;
    return {
      totalMeetings: meetings.length,
      doneCount,
      totalSeconds,
    };
  }, [meetings]);

  async function refresh() {
    try {
      setRefreshing(true);
      await fetchMeetings();
    } finally {
      setRefreshing(false);
    }
  }

  async function handleUploadPress() {
    if (!user || !session?.access_token) return;
    try {
      setBusy('uploading');
      setError(null);
      const asset = await pickAudioAsset();
      if (!asset) return;
      const audio = await processPickedAudio({
        asset,
        userId: user.id,
        accessToken: session.access_token,
      });
      await fetchMeetings();
      router.push(`/meeting/${audio.id}`);
    } catch (uploadError: any) {
      setError(uploadError.message ?? 'Upload failed');
    } finally {
      setBusy('idle');
    }
  }

  async function handleRecordingToggle() {
    if (!user || !session?.access_token) return;

    try {
      setError(null);
      if (busy === 'recording') {
        setBusy('processing');
        const asset = await stopAndCreateAsset();
        const audio = await processRecordedAudio({
          asset,
          userId: user.id,
          accessToken: session.access_token,
        });
        await fetchMeetings();
        router.push(`/meeting/${audio.id}`);
        setBusy('idle');
        return;
      }

      await start();
      setBusy('recording');
    } catch (recordError: any) {
      setBusy('idle');
      setError(recordError.message ?? 'Recording failed');
    }
  }

  return (
    <AppShell
      title="MeetingMind"
      subtitle="Capture meetings while they are still fresh"
      refreshing={refreshing}
      onRefresh={refresh}
      action={<IconButton icon="bell-outline" />}
    >
      <SectionHeading
        eyebrow="Today"
        title="Your mobile command center"
        caption="Phone-first workspace for uploads, recordings, transcripts, summaries, events, and Google Calendar sync."
      />

      <View style={styles.metricsRow}>
        <Card mode="contained" style={styles.metricCard}>
          <Card.Content>
            <Text variant="labelLarge" style={styles.metricLabel}>
              Meetings
            </Text>
            <Text variant="headlineSmall" style={styles.metricValue}>
              {usage.totalMeetings}
            </Text>
          </Card.Content>
        </Card>
        <Card mode="contained" style={styles.metricCard}>
          <Card.Content>
            <Text variant="labelLarge" style={styles.metricLabel}>
              Processed
            </Text>
            <Text variant="headlineSmall" style={styles.metricValue}>
              {usage.doneCount}
            </Text>
          </Card.Content>
        </Card>
        <Card mode="contained" style={styles.metricCard}>
          <Card.Content>
            <Text variant="labelLarge" style={styles.metricLabel}>
              Duration
            </Text>
            <Text variant="headlineSmall" style={styles.metricValue}>
              {formatDuration(usage.totalSeconds)}
            </Text>
          </Card.Content>
        </Card>
      </View>

      <Card mode="contained" style={styles.heroCard}>
        <Card.Content style={styles.heroContent}>
          <View style={styles.heroText}>
            <Text variant="labelLarge" style={styles.heroEyebrow}>
              Mobile Studio
            </Text>
            <Text variant="headlineSmall" style={styles.heroTitle}>
              Record or upload. The app handles the rest.
            </Text>
            <Text variant="bodyMedium" style={styles.heroCaption}>
              Upload audio from your phone or record a new meeting. Transcripts, summaries, extracted events, and follow-up Q&A all land in one place.
            </Text>
          </View>
          {busy === 'processing' ? <ProgressBar indeterminate style={styles.progress} /> : null}
          <View style={styles.actionGrid}>
            <Button
              mode="contained"
              icon="upload"
              onPress={handleUploadPress}
              loading={busy === 'uploading'}
              disabled={busy !== 'idle'}
              style={styles.primaryAction}
            >
              Upload audio
            </Button>
            <Button
              mode={busy === 'recording' ? 'contained-tonal' : 'outlined'}
              icon={busy === 'recording' ? 'stop-circle-outline' : 'microphone-outline'}
              onPress={handleRecordingToggle}
              disabled={busy === 'uploading' || busy === 'processing'}
            >
              {busy === 'recording' ? 'Stop recording' : 'Start recording'}
            </Button>
          </View>
          <View style={styles.recordingHint}>
            <MaterialCommunityIcons
              name={busy === 'recording' ? 'record-rec' : 'waveform'}
              size={18}
              color={busy === 'recording' ? '#F07D62' : '#4BA3C7'}
            />
            <Text variant="bodySmall" style={styles.recordingText}>
              {busy === 'recording'
                ? `Recording in progress · ${formatDuration((recorderState.durationMillis ?? 0) / 1000)}`
                : 'Mobile recording transcribes automatically as soon as you stop and upload.'}
            </Text>
          </View>
        </Card.Content>
      </Card>

      {error ? (
        <Card mode="contained" style={styles.errorCard}>
          <Card.Content>
            <Text variant="bodyMedium" style={{ color: '#8B2D1E' }}>
              {error}
            </Text>
          </Card.Content>
        </Card>
      ) : null}

      <SectionHeading
        eyebrow="Recent"
        title="Meetings still moving"
        caption="Open a transcript to review the full conversation, AI summary, events, and follow-up answers."
      />

      {meetings.length === 0 ? (
        <EmptyState
          title="No meetings yet"
          description="Upload your first audio file or record directly from your phone to start building the transcript library."
        />
      ) : null}

      {meetings.slice(0, 5).map(meeting => (
        <MeetingCard key={meeting.id} meeting={meeting} />
      ))}

      {meetings.length > 5 ? (
        <Button mode="text" onPress={() => router.push('/(tabs)/library')}>
          View full library
        </Button>
      ) : null}
    </AppShell>
  );
}

const styles = StyleSheet.create({
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFFCF6',
  },
  metricLabel: {
    color: '#5D6470',
    fontWeight: '700',
  },
  metricValue: {
    color: '#153C54',
    fontWeight: '800',
  },
  heroCard: {
    backgroundColor: '#153C54',
  },
  heroContent: {
    gap: 18,
    paddingVertical: 8,
  },
  heroText: {
    gap: 8,
  },
  heroEyebrow: {
    color: '#9DD3E7',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '800',
  },
  heroTitle: {
    color: '#FDFBF6',
    fontWeight: '800',
  },
  heroCaption: {
    color: '#DCE8EF',
    lineHeight: 22,
  },
  actionGrid: {
    gap: 10,
  },
  primaryAction: {
    backgroundColor: '#F07D62',
  },
  recordingHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recordingText: {
    color: '#DCE8EF',
    flex: 1,
  },
  progress: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  errorCard: {
    backgroundColor: '#FFF1ED',
  },
});
