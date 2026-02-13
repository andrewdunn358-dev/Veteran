import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar, Linking, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CrisisSupport() {
  const router = useRouter();

  const handleCall = (number: string) => {
    Linking.openURL(`tel:${number}`);
  };

  const handleSMS = (number: string) => {
    Linking.openURL(`sms:${number}`);
  };

  const handleWhatsApp = (number: string) => {
    // Remove spaces and format for WhatsApp
    const formattedNumber = number.replace(/\s/g, '');
    const whatsappUrl = `https://wa.me/${formattedNumber}`;
    Linking.openURL(whatsappUrl);
  };

  const crisisServices = [
    {
      name: 'Combat Stress',
      description: '24/7 veteran mental health helpline',
      phone: '08001381619',
      sms: '07537173683',
      whatsapp: '447537173683',
      icon: 'shield' as const,
    },
    {
      name: 'Samaritans',
      description: '24/7 confidential emotional support',
      phone: '116123',
      sms: null,
      whatsapp: null,
      icon: 'heart' as const,
    },
    {
      name: 'Veterans UK',
      description: 'Government support and guidance',
      phone: '08081914218',
      sms: null,
      whatsapp: null,
      icon: 'information-circle' as const,
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#1a2332" />
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#7c9cbf" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Crisis Support</Text>
        </View>

        {/* Emergency Banner */}
        <TouchableOpacity 
          style={styles.emergencyBanner}
          onPress={() => Linking.openURL('tel:999')}
          activeOpacity={0.8}
        >
          <Ionicons name="call" size={28} color="#ffffff" />
          <View style={styles.emergencyTextContainer}>
            <Text style={styles.emergencyTitle}>Emergency: 999</Text>
            <Text style={styles.emergencySubtext}>Tap to call immediately</Text>
          </View>
        </TouchableOpacity>

        {/* Instructions */}
        <View style={styles.instructions}>
          <Text style={styles.instructionsText}>
            Choose how you'd like to reach out for support:
          </Text>
        </View>

        {/* Crisis Services */}
        {crisisServices.map((service, index) => (
          <View key={index} style={styles.serviceCard}>
            <View style={styles.serviceHeader}>
              <Ionicons name={service.icon} size={28} color="#7c9cbf" />
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>{service.name}</Text>
                <Text style={styles.serviceDescription}>{service.description}</Text>
              </View>
            </View>

            <View style={styles.contactButtons}>
              {/* Call Button */}
              <TouchableOpacity
                style={styles.contactButton}
                onPress={() => handleCall(service.phone)}
                activeOpacity={0.8}
              >
                <Ionicons name="call" size={24} color="#ffffff" />
                <Text style={styles.contactButtonText}>Call</Text>
              </TouchableOpacity>

              {/* SMS Button */}
              {service.sms && (
                <TouchableOpacity
                  style={[styles.contactButton, styles.contactButtonSecondary]}
                  onPress={() => handleSMS(service.sms!)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="chatbubble" size={24} color="#7c9cbf" />
                  <Text style={[styles.contactButtonText, styles.contactButtonTextSecondary]}>Text</Text>
                </TouchableOpacity>
              )}

              {/* WhatsApp Button */}
              {service.whatsapp && (
                <TouchableOpacity
                  style={[styles.contactButton, styles.contactButtonSecondary]}
                  onPress={() => handleWhatsApp(service.whatsapp!)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="logo-whatsapp" size={24} color="#7c9cbf" />
                  <Text style={[styles.contactButtonText, styles.contactButtonTextSecondary]}>WhatsApp</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}

        {/* Additional Help */}
        <View style={styles.additionalHelp}>
          <Text style={styles.additionalHelpTitle}>Need more options?</Text>
          <TouchableOpacity 
            style={styles.linkButton}
            onPress={() => router.push('/organizations')}
          >
            <Text style={styles.linkButtonText}>View all support organisations</Text>
            <Ionicons name="arrow-forward" size={20} color="#7c9cbf" />
          </TouchableOpacity>
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Ionicons name="information-circle" size={16} color="#b0c4de" />
          <Text style={styles.disclaimerText}>
            All services listed are free and confidential
          </Text>
        </View>
      </ScrollView>
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
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
  },
  emergencyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#cc0000',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  emergencyTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  emergencyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  emergencySubtext: {
    fontSize: 14,
    color: '#ffcccc',
  },
  instructions: {
    backgroundColor: '#2d3748',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  instructionsText: {
    fontSize: 16,
    color: '#b0c4de',
    textAlign: 'center',
    lineHeight: 22,
  },
  serviceCard: {
    backgroundColor: '#2d3748',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#4a5568',
  },
  serviceHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  serviceInfo: {
    marginLeft: 12,
    flex: 1,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 14,
    color: '#b0c4de',
    lineHeight: 20,
  },
  contactButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  contactButton: {
    flex: 1,
    backgroundColor: '#4a90e2',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  contactButtonSecondary: {
    backgroundColor: '#374151',
    borderWidth: 1,
    borderColor: '#4a5568',
  },
  contactButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 4,
  },
  contactButtonTextSecondary: {
    color: '#7c9cbf',
  },
  additionalHelp: {
    backgroundColor: '#2d3748',
    borderRadius: 12,
    padding: 20,
    marginTop: 8,
    marginBottom: 24,
  },
  additionalHelpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    gap: 8,
  },
  linkButtonText: {
    fontSize: 15,
    color: '#7c9cbf',
    fontWeight: '600',
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#b0c4de',
    textAlign: 'center',
  },
});