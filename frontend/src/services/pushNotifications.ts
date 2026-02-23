/**
 * Push Notification Service
 * Handles Expo push notification registration and token management
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/api';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Register for push notifications and get the Expo push token
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  let token: string | null = null;

  // Check if we're on a physical device
  if (!Device.isDevice) {
    console.log('Push notifications only work on physical devices');
    return null;
  }

  // Check existing permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Request permission if not already granted
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Push notification permission not granted');
    return null;
  }

  try {
    // Get Expo push token
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
    });
    token = tokenData.data;
    console.log('Push token:', token);

    // Store token locally
    await AsyncStorage.setItem('@push_token', token);
  } catch (error) {
    console.error('Error getting push token:', error);
    return null;
  }

  // Android-specific notification channel setup
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Radio Check',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#4a90a4',
    });

    // Create shift reminder channel
    await Notifications.setNotificationChannelAsync('shift-reminders', {
      name: 'Shift Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      description: 'Reminders about upcoming shifts',
      vibrationPattern: [0, 500, 250, 500],
    });
  }

  return token;
}

/**
 * Register push token with the backend server
 */
export async function registerTokenWithServer(userId: string): Promise<boolean> {
  try {
    const token = await AsyncStorage.getItem('@push_token');
    
    if (!token) {
      // Try to get a new token
      const newToken = await registerForPushNotificationsAsync();
      if (!newToken) {
        return false;
      }
    }

    const pushToken = await AsyncStorage.getItem('@push_token');
    
    const response = await fetch(`${API_URL}/api/shifts/register-push-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        push_token: pushToken,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to register token');
    }

    console.log('Push token registered with server');
    return true;
  } catch (error) {
    console.error('Error registering token with server:', error);
    return false;
  }
}

/**
 * Add notification listener for foreground notifications
 */
export function addNotificationListener(
  onNotification: (notification: Notifications.Notification) => void
): Notifications.Subscription {
  return Notifications.addNotificationReceivedListener(onNotification);
}

/**
 * Add listener for notification responses (when user taps notification)
 */
export function addNotificationResponseListener(
  onResponse: (response: Notifications.NotificationResponse) => void
): Notifications.Subscription {
  return Notifications.addNotificationResponseReceivedListener(onResponse);
}

/**
 * Schedule a local notification (for testing)
 */
export async function scheduleLocalNotification(
  title: string,
  body: string,
  seconds: number = 5
): Promise<string> {
  return await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
    },
    trigger: {
      seconds,
    },
  });
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Get badge count
 */
export async function getBadgeCount(): Promise<number> {
  return await Notifications.getBadgeCountAsync();
}

/**
 * Set badge count
 */
export async function setBadgeCount(count: number): Promise<boolean> {
  return await Notifications.setBadgeCountAsync(count);
}
