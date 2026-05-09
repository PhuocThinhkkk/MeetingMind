export const MOBILE_CONFIG = {
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
  apiBaseUrl: (process.env.EXPO_PUBLIC_API_BASE_URL ?? '').replace(/\/$/, ''),
  webBaseUrl: (process.env.EXPO_PUBLIC_WEB_BASE_URL ?? process.env.EXPO_PUBLIC_API_BASE_URL ?? '').replace(/\/$/, ''),
  wsBaseUrl: (process.env.EXPO_PUBLIC_WS_SERVER_URL ?? '').replace(/^wss?:\/\//, ''),
};

export function requireConfig(value: string, label: string) {
  if (!value) {
    throw new Error(`Missing configuration: ${label}`);
  }
  return value;
}
