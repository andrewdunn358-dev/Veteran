import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar, Linking, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Platform } from 'react-native';

const API_URL = Platform.select({
  web: process.env.EXPO_PUBLIC_BACKEND_URL || '',
  default: process.env.EXPO_PUBLIC_BACKEND_URL || ''
});

interface Organization {
  id: string;
  name: string;
  description: string;
  phone: string;
  sms?: string;
  whatsapp?: string;
}

export default function Organizations() {
  const router = useRouter();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrganizations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${EXPO_PUBLIC_BACKEND_URL}/api/organizations`);
      if (response.ok) {
        const data = await response.json();
        setOrganizations(data);
      } else {
        setError('Unable to load organizations');
      }
    } catch (err) {
      console.error('Error fetching organizations:', err);
      setError('Unable to connect. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const handleCall = (number: string) => {
    Linking.openURL(`tel:${number}`);
  };

  const handleSMS = (number: string) => {
    Linking.openURL(`sms:${number}`);
  };

  const handleWhatsApp = (number: string) => {
    const whatsappUrl = `https://wa.me/${number}`;
    Linking.openURL(whatsappUrl);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#1a2332" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#7c9cbf" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Support Organisations</Text>
        </View>

        {/* Emergency Banner - Display only, no call functionality */}
        <View style={styles.emergencyBanner}>
          <Ionicons name="warning" size={24} color="#ffffff" />
          <Text style={styles.emergencyText}>Emergency? Dial 999</Text>
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Description */}
          <View style={styles.description}>
            <Text style={styles.descriptionText}>
              UK organisations providing support to veterans. All services are confidential.
            </Text>
          </View>

          {/* Loading State */}
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4a90e2" />
              <Text style={styles.loadingText}>Loading organizations...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={32} color="#ef4444" />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={fetchOrganizations}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : organizations.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="business" size={48} color="#7c9cbf" />
              <Text style={styles.emptyText}>No organizations available</Text>
              <Text style={styles.emptySubtext}>Please contact support for assistance</Text>
            </View>
          ) : (
          /* Organizations List */
          organizations.map((org) => (
            <View key={org.id} style={styles.orgCard}>
              <View style={styles.orgHeader}>
                <Ionicons name="shield-checkmark" size={24} color="#7c9cbf" />
                <View style={styles.orgInfo}>
                  <Text style={styles.orgName}>{org.name}</Text>
                </View>
              </View>
              
              <Text style={styles.orgDescription}>{org.description}</Text>

              <View style={styles.contactButtons}>
                {/* Call Button - Always Present */}
                <TouchableOpacity
                  style={styles.callButton}
                  onPress={() => handleCall(org.phone)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="call" size={20} color="#ffffff" />
                  <Text style={styles.callButtonText}>Call</Text>
                </TouchableOpacity>

                {/* SMS Button */}
                {org.sms && (
                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => handleSMS(org.sms!)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="chatbubble" size={20} color="#7c9cbf" />
                    <Text style={styles.secondaryButtonText}>Text</Text>
                  </TouchableOpacity>
                )}

                {/* WhatsApp Button */}
                {org.whatsapp && (
                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => handleWhatsApp(org.whatsapp!)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="logo-whatsapp" size={20} color="#7c9cbf" />
                    <Text style={styles.secondaryButtonText}>WhatsApp</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
          )}

          {/* Footer Note */}
          <View style={styles.footer}>
            <Ionicons name="information-circle" size={16} color="#b0c4de" />
            <Text style={styles.footerText}>
              All organisations are free to contact. Help is available 24/7.
            </Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1a2332',
  },
  container: {
    flex: 1,
    backgroundColor: '#1a2332',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
  },
  emergencyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#cc0000',
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginHorizontal: 24,
    borderRadius: 8,
    gap: 12,
  },
  emergencyText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },
  description: {
    backgroundColor: '#2d3748',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  descriptionText: {
    fontSize: 14,
    color: '#b0c4de',
    textAlign: 'center',
    lineHeight: 20,
  },
  orgCard: {
    backgroundColor: '#2d3748',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#4a5568',
  },
  orgHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  orgInfo: {
    marginLeft: 12,
    flex: 1,
  },
  orgName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  orgDescription: {
    fontSize: 14,
    color: '#b0c4de',
    lineHeight: 20,
    marginBottom: 16,
  },
  contactButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  callButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#4a90e2',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 52,
  },
  callButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
  secondaryButton: {
    flexDirection: 'row',
    backgroundColor: '#374151',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#4a5568',
    minHeight: 52,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7c9cbf',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
  },
  footerText: {
    fontSize: 12,
    color: '#b0c4de',
    textAlign: 'center',
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#b0c4de',
  },
  errorContainer: {
    alignItems: 'center',
    padding: 40,
    gap: 12,
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#4a90e2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#b0c4de',
    textAlign: 'center',
  },
});