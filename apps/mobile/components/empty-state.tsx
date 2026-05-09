import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <Card mode="contained" style={styles.card}>
      <Card.Content style={styles.content}>
        <Text variant="titleMedium" style={styles.title}>
          {title}
        </Text>
        <Text variant="bodyMedium" style={styles.description}>
          {description}
        </Text>
        {actionLabel && onAction ? (
          <Button mode="contained-tonal" onPress={onAction} style={styles.button}>
            {actionLabel}
          </Button>
        ) : null}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFCF6',
  },
  content: {
    paddingVertical: 8,
    gap: 10,
  },
  title: {
    fontWeight: '700',
    color: '#1B1D22',
  },
  description: {
    color: '#5D6470',
    lineHeight: 20,
  },
  button: {
    alignSelf: 'flex-start',
    marginTop: 4,
  },
});
