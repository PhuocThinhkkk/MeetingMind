import React from 'react';
import { Chip } from 'react-native-paper';

import { getStatusLabel } from '@/lib/format';

const CHIP_STYLES: Record<string, { backgroundColor: string; textColor: string }> = {
  done: { backgroundColor: '#D7F1E7', textColor: '#0E5B41' },
  processing: { backgroundColor: '#D7E9F5', textColor: '#154B68' },
  pending: { backgroundColor: '#F7E7B3', textColor: '#825F00' },
  failed: { backgroundColor: '#F8D7D0', textColor: '#8B2D1E' },
  unknown: { backgroundColor: '#E6E8EC', textColor: '#49515D' },
};

export function StatusChip({ status }: { status?: string | null }) {
  const normalized = status?.toLowerCase() ?? 'unknown';
  const colors = CHIP_STYLES[normalized] ?? CHIP_STYLES.unknown;

  return (
    <Chip
      compact
      style={{ backgroundColor: colors.backgroundColor }}
      textStyle={{ color: colors.textColor, fontWeight: '700' }}
    >
      {getStatusLabel(normalized)}
    </Chip>
  );
}
