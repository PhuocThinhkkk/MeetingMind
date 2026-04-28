import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';

import { formatDuration, formatRelativeDate } from '@/lib/format';
import { AudioWithTranscript } from '@/types/domain';
import { StatusChip } from '@/components/status-chip';

export function MeetingCard({ meeting }: { meeting: AudioWithTranscript }) {
  return (
    <Card style={styles.card} mode="contained" onPress={() => router.push(`/meeting/${meeting.id}`)}>
      <Card.Content>
        <View style={styles.row}>
          <View style={styles.content}>
            <Text variant="titleMedium" style={styles.title}>
              {meeting.name}
            </Text>
            <Text variant="bodyMedium" style={styles.meta}>
              {formatRelativeDate(meeting.created_at)} · {formatDuration(meeting.duration)}
            </Text>
            <Text variant="bodySmall" style={styles.preview} numberOfLines={2}>
              {meeting.transcript?.text || 'Transcript is still processing. Summary and events will appear here when it is ready.'}
            </Text>
          </View>
          <StatusChip status={meeting.transcription_status} />
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFCF6',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 14,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontWeight: '700',
  },
  meta: {
    color: '#5D6470',
  },
  preview: {
    color: '#68707D',
    lineHeight: 20,
    marginTop: 4,
  },
});
