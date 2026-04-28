import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Button, Card, Divider, Text } from 'react-native-paper';

import { AppShell, SectionHeading } from '@/components/app-shell';
import { AuthGuard } from '@/components/auth-guard';
import { formatDuration } from '@/lib/format';
import { useAuth } from '@/providers/auth-provider';
import { getAudioHistory } from '@/services/meetings';
import { supabase } from '@/lib/supabase';

export default function ProfileScreen() {
  return (
    <AuthGuard>
      <ProfileContent />
    </AuthGuard>
  );
}

function ProfileContent() {
  const { user, signOut } = useAuth();
  const [planName, setPlanName] = useState('Free');
  const [meetingCount, setMeetingCount] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);

  const loadData = useCallback(async () => {
    if (!user) return;
    const [meetings, subscription] = await Promise.all([
      getAudioHistory(user.id),
      supabase.from('subscriptions').select('*').eq('user_id', user.id).maybeSingle(),
    ]);
    setMeetingCount(meetings.length);
    setTotalSeconds(meetings.reduce((sum, item) => sum + (item.duration ?? 0), 0));
    if (subscription.data?.status) {
      setPlanName(subscription.data.status === 'active' ? 'Pro' : 'Free');
    }
  }, [user]);

  useEffect(() => {
    loadData().catch(() => undefined);
  }, [loadData]);

  const initials = useMemo(() => {
    const source = user?.user_metadata?.name || user?.email || 'MM';
    return source
      .split(' ')
      .map((chunk: string) => chunk[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }, [user?.email, user?.user_metadata?.name]);

  return (
    <AppShell title="Profile" subtitle="Account, plan, and workspace settings">
      <SectionHeading
        eyebrow="Account"
        title="Your workspace identity"
        caption="Review your current account, transcription usage, and plan state from one place."
      />

      <Card mode="contained" style={styles.heroCard}>
        <Card.Content style={styles.heroContent}>
          <Text variant="headlineMedium" style={styles.initials}>
            {initials}
          </Text>
          <Text variant="titleLarge" style={styles.name}>
            {user?.user_metadata?.name || 'MeetingMind user'}
          </Text>
          <Text variant="bodyMedium" style={styles.email}>
            {user?.email}
          </Text>
        </Card.Content>
      </Card>

      <Card mode="contained" style={styles.card}>
        <Card.Content style={styles.statContent}>
          <Text variant="titleMedium" style={styles.cardTitle}>
            Plan and usage
          </Text>
          <Divider />
          <Text variant="bodyMedium" style={styles.bodyCopy}>
            Current plan: {planName}
          </Text>
          <Text variant="bodyMedium" style={styles.bodyCopy}>
            Meetings processed: {meetingCount}
          </Text>
          <Text variant="bodyMedium" style={styles.bodyCopy}>
            Recorded duration: {formatDuration(totalSeconds)}
          </Text>
        </Card.Content>
      </Card>

      <Card mode="contained" style={styles.card}>
        <Card.Content style={styles.statContent}>
          <Text variant="titleMedium" style={styles.cardTitle}>
            Product notes
          </Text>
          <Text variant="bodyMedium" style={styles.bodyCopy}>
            Mobile uploads, meeting review, AI summary inspection, event sync, and account state are now native-first.
          </Text>
          <Text variant="bodyMedium" style={styles.bodyCopy}>
            Recording currently captures audio natively and sends it through the same transcript pipeline after you stop.
          </Text>
        </Card.Content>
      </Card>

      <Button mode="outlined" onPress={() => signOut()}>
        Sign out
      </Button>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: '#153C54',
  },
  heroContent: {
    gap: 8,
    alignItems: 'center',
    paddingVertical: 12,
  },
  initials: {
    color: '#F7F3EA',
    fontWeight: '800',
  },
  name: {
    color: '#FDFBF6',
    fontWeight: '700',
  },
  email: {
    color: '#DCE8EF',
  },
  card: {
    backgroundColor: '#FFFCF6',
  },
  statContent: {
    gap: 12,
  },
  cardTitle: {
    color: '#1B1D22',
    fontWeight: '700',
  },
  bodyCopy: {
    color: '#5D6470',
    lineHeight: 20,
  },
});
