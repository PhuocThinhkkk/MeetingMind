import { Link, Stack } from 'expo-router';
import { StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';

import { Text, View } from '@/components/Themed';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not found' }} />
      <View style={styles.container}>
        <Text style={styles.title}>This screen doesn&apos;t exist.</Text>

        <Link href="/" asChild>
          <Button mode="contained">Back to home</Button>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});
