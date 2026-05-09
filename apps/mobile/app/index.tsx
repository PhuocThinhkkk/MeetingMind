import { Redirect } from 'expo-router';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '@/providers/auth-provider';

export default function IndexScreen() {
 
  const { loading, user } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F7F3EA' }}>
        <ActivityIndicator size="large" color="#153C54" />
      </View>
    );
  }

  return <Redirect href={user ? '/(tabs)' : '/sign-in'} />;
}
