import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './context/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#1a2332' },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="crisis-support" />
        <Stack.Screen name="organizations" />
        <Stack.Screen name="peer-support" />
        <Stack.Screen name="historical-investigations" />
        <Stack.Screen name="login" />
        <Stack.Screen name="portal" />
        <Stack.Screen name="admin" />
        <Stack.Screen name="counsellor-portal" />
        <Stack.Screen name="peer-portal" />
      </Stack>
    </AuthProvider>
  );
}