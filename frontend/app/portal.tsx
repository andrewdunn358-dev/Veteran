import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';

export default function PortalRouter() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.replace('/login');
      } else {
        switch (user.role) {
          case 'admin':
            // Use WebView for admin portal on mobile, redirect on web
            if (Platform.OS === 'web') {
              router.replace('/admin');
            } else {
              router.replace('/admin-webview');
            }
            break;
          case 'counsellor':
          case 'peer':
            // Use WebView for staff portal on mobile, existing screens on web
            if (Platform.OS === 'web') {
              router.replace('/counsellor-portal');
            } else {
              router.replace('/staff-webview');
            }
            break;
          default:
            router.replace('/login');
        }
      }
    }
  }, [user, isLoading]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#4a90d9" />
      <Text style={styles.text}>Loading...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a2332',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#ffffff',
    marginTop: 16,
    fontSize: 16,
  },
});
