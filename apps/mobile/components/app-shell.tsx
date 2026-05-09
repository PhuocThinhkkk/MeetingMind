import React, { ReactNode } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Appbar, Text } from 'react-native-paper';

type AppShellProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  action?: ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
};

export function AppShell({
  title,
  subtitle,
  children,
  action,
  refreshing = false,
  onRefresh,
}: AppShellProps) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Appbar.Header style={styles.header} elevated={false}>
        <Appbar.Content
          title={title}
          titleStyle={styles.title}
          subtitle={subtitle}
          subtitleStyle={styles.subtitle}
        />
        {action}
      </Appbar.Header>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} /> : undefined
        }
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  caption,
}: {
  eyebrow: string;
  title: string;
  caption?: string;
}) {
  return (
    <View style={styles.section}>
      <Text variant="labelLarge" style={styles.eyebrow}>
        {eyebrow}
      </Text>
      <Text variant="headlineSmall" style={styles.sectionTitle}>
        {title}
      </Text>
      {caption ? (
        <Text variant="bodyMedium" style={styles.sectionCaption}>
          {caption}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F3EA',
  },
  header: {
    backgroundColor: '#F7F3EA',
  },
  title: {
    fontWeight: '800',
    color: '#1B1D22',
  },
  subtitle: {
    color: '#5D6470',
  },
  content: {
    padding: 18,
    paddingBottom: 36,
    gap: 18,
  },
  section: {
    gap: 6,
  },
  eyebrow: {
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#4BA3C7',
    fontWeight: '800',
  },
  sectionTitle: {
    color: '#1B1D22',
    fontWeight: '800',
  },
  sectionCaption: {
    color: '#5D6470',
    lineHeight: 20,
  },
});
