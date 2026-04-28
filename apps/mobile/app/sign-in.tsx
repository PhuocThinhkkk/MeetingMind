import { GoogleSigninButton } from '@react-native-google-signin/google-signin';
import { Redirect } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { Button, Card, HelperText, Text, TextInput } from 'react-native-paper';

import { useAuth } from '@/providers/auth-provider';

export default function SignInScreen() {
  const { user, signIn, signInWithGoogle, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  async function submit() {
    try {
      setBusy(true);
      setError(null);
      if (mode === 'signin') {
        await signIn(email.trim(), password);
      } else {
        await signUp(name.trim(), email.trim(), password);
      }
    } catch (submitError: any) {
      setError(submitError.message ?? 'Unable to continue');
    } finally {
      setBusy(false);
    }
  }

  async function submitGoogle() {
    try {
      setBusy(true);
      setError(null);
      await signInWithGoogle();
    } catch (submitError: any) {
      setError(submitError.message ?? 'Google sign in failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <View style={styles.hero}>
        <Text variant="labelLarge" style={styles.eyebrow}>
          MeetingMind
        </Text>
        <Text variant="displaySmall" style={styles.title}>
          Bring every meeting back with structure.
        </Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          Record, transcribe, summarize, extract events, and push the important ones to Google Calendar.
        </Text>
      </View>

      <Card mode="contained" style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.switchRow}>
            <Button
              mode={mode === 'signin' ? 'contained' : 'text'}
              onPress={() => setMode('signin')}
              compact
            >
              Sign in
            </Button>
            <Button
              mode={mode === 'signup' ? 'contained' : 'text'}
              onPress={() => setMode('signup')}
              compact
            >
              Create account
            </Button>
          </View>

          {mode === 'signup' ? (
            <TextInput mode="outlined" label="Full name" value={name} onChangeText={setName} />
          ) : null}
          <TextInput
            mode="outlined"
            label="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            mode="outlined"
            label="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <HelperText type="error" visible={Boolean(error)}>
            {error}
          </HelperText>

          <Button mode="contained" onPress={submit} loading={busy} disabled={busy}>
            {mode === 'signin' ? 'Sign in to workspace' : 'Create workspace account'}
          </Button>
           <GoogleSigninButton
      size={GoogleSigninButton.Size.Wide}
      color={GoogleSigninButton.Color.Dark}
      onPress={submitGoogle}
      disabled={busy}
    />
     
        </Card.Content>
      </Card>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F3EA',
    justifyContent: 'center',
    padding: 20,
    gap: 20,
  },
  hero: {
    gap: 10,
  },
  eyebrow: {
    color: '#4BA3C7',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontWeight: '800',
  },
  title: {
    color: '#1B1D22',
    fontWeight: '800',
  },
  subtitle: {
    color: '#5D6470',
    lineHeight: 24,
  },
  card: {
    backgroundColor: '#FFFCF6',
  },
  cardContent: {
    gap: 14,
    paddingVertical: 8,
  },
  switchRow: {
    flexDirection: 'row',
    gap: 8,
  },
});
