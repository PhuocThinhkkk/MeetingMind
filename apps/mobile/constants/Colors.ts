const palette = {
  cream: '#F7F3EA',
  sand: '#E6DCC8',
  ink: '#1B1D22',
  slate: '#5D6470',
  mist: '#EEF1F4',
  navy: '#153C54',
  sky: '#4BA3C7',
  coral: '#F07D62',
  mint: '#6DB8A0',
  gold: '#C9A227',
};

const Colors = {
  light: {
    text: palette.ink,
    background: palette.cream,
    surface: '#FFFCF6',
    surfaceVariant: '#F0E8D8',
    tint: palette.navy,
    primary: palette.navy,
    secondary: palette.sky,
    accent: palette.coral,
    success: palette.mint,
    warning: palette.gold,
    muted: palette.slate,
    border: '#D8D1C1',
    tabIconDefault: '#8F98A4',
    tabIconSelected: palette.navy,
  },
  dark: {
    text: '#F9F7F3',
    background: '#111418',
    surface: '#171B21',
    surfaceVariant: '#222831',
    tint: '#DCE8EF',
    primary: '#DCE8EF',
    secondary: '#83C6E2',
    accent: '#FF9A84',
    success: '#8AD0B8',
    warning: '#E3C25C',
    muted: '#99A3AF',
    border: '#2D3642',
    tabIconDefault: '#758194',
    tabIconSelected: '#F9F7F3',
  },
};

export default Colors;
