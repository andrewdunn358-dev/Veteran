/**
 * AgeRestrictedBanner - Shows restriction message for under-18 users
 * 
 * Displays a friendly banner explaining why a feature is restricted
 * and what alternatives are available.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface AgeRestrictedBannerProps {
  feature: 'peer_matching' | 'direct_peer_calls' | 'share_phone_number';
  showAlternatives?: boolean;
}

const RESTRICTION_INFO = {
  peer_matching: {
    title: 'Peer Matching Unavailable',
    message: 'Peer matching is only available for users 18 and over to ensure your safety.',
    alternatives: [
      { text: 'Chat with AI Support', icon: 'chatbubbles', route: '/ai-buddies' },
      { text: 'Talk to Staff', icon: 'headset', route: '/crisis-support' },
    ],
  },
  direct_peer_calls: {
    title: 'Direct Peer Calls Unavailable',
    message: 'Direct peer calls are only available for users 18 and over.',
    alternatives: [
      { text: 'Chat with AI Support', icon: 'chatbubbles', route: '/ai-buddies' },
      { text: 'Request Staff Callback', icon: 'call', route: '/callback' },
    ],
  },
  share_phone_number: {
    title: 'Phone Sharing Restricted',
    message: 'Phone number sharing is restricted for users under 18.',
    alternatives: [],
  },
};

export default function AgeRestrictedBanner({ 
  feature, 
  showAlternatives = true 
}: AgeRestrictedBannerProps) {
  const router = useRouter();
  const info = RESTRICTION_INFO[feature];

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="shield-checkmark" size={48} color="#3b82f6" />
      </View>
      
      <Text style={styles.title}>{info.title}</Text>
      <Text style={styles.message}>{info.message}</Text>
      
      <View style={styles.ageInfo}>
        <Ionicons name="lock-closed" size={18} color="#94a3b8" />
        <Text style={styles.ageInfoText}>
          This feature will be available when you turn 18
        </Text>
      </View>

      {showAlternatives && info.alternatives.length > 0 && (
        <>
          <Text style={styles.alternativesTitle}>What you CAN do:</Text>
          <View style={styles.alternativesContainer}>
            {info.alternatives.map((alt, index) => (
              <TouchableOpacity
                key={index}
                style={styles.alternativeButton}
                onPress={() => router.push(alt.route as any)}
              >
                <Ionicons name={alt.icon as any} size={24} color="#22c55e" />
                <Text style={styles.alternativeText}>{alt.text}</Text>
                <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f8fafc',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  ageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    gap: 10,
    marginBottom: 32,
  },
  ageInfoText: {
    fontSize: 14,
    color: '#64748b',
  },
  alternativesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  alternativesContainer: {
    width: '100%',
    gap: 12,
  },
  alternativeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#22c55e',
    gap: 12,
  },
  alternativeText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#166534',
  },
});
