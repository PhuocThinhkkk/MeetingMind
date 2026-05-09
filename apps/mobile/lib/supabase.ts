import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

import { MOBILE_CONFIG, requireConfig } from '@/lib/env';

const AUTH_KEY = 'meetingmind.supabase.auth';

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

export const supabase = createClient(
  requireConfig(MOBILE_CONFIG.supabaseUrl, 'EXPO_PUBLIC_SUPABASE_URL'),
  requireConfig(MOBILE_CONFIG.supabaseAnonKey, 'EXPO_PUBLIC_SUPABASE_ANON_KEY'),
  {
    auth: {
      storage: ExpoSecureStoreAdapter,
      storageKey: AUTH_KEY,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
