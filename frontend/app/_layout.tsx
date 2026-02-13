import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
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
      </Stack>
    </>
  );
}