import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar, Linking, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Counsellor {
  name: string;
  status: 'available' | 'busy';
  specialization: string;
  nextAvailable?: string;
  phone: string;
}

export default function CrisisSupport() {
  const router = useRouter();

  // Mock on-duty counsellors
  const onDutyCounsellors: Counsellor[] = [
    {
      name: 'Sarah M.',
      status: 'available',
      specialization: 'Trauma & PTSD',
      phone: '08001381619',
      sms: '07537173683',
      whatsapp: '447537173683',
    },
    {
      name: 'James R.',
      status: 'available',
      specialization: 'Depression & Anxiety',
      phone: '08001381619',
      sms: '07537173683',
      whatsapp: '447537173683',
    },
    {
      name: 'David T.',
      status: 'busy',
      specialization: 'Crisis Intervention',
      nextAvailable: '30 mins',
      phone: '08001381619',
      sms: '07537173683',
      whatsapp: '447537173683',
    },
  ];

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

  const handleCall = (number: string) => {
    Linking.openURL(`tel:${number}`);
  };

  const handleSMS = (number: string) => {
    Linking.openURL(`sms:${number}`);
  };

  const handleWhatsApp = (number: string) => {
    const formattedNumber = number.replace(/\s/g, '');
    const whatsappUrl = `https://wa.me/${formattedNumber}`;
    Linking.openURL(whatsappUrl);
  };

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

        {/* On-Duty Counsellors Section */}
        <View style={styles.counsellorsSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="people-circle" size={24} color="#7c9cbf" />
            <Text style={styles.sectionTitle}>On-Duty Counsellors</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Professional counsellors available now to speak with you
          </Text>

          {onDutyCounsellors.map((counsellor, index) => (
            <View key={index} style={styles.counsellorCard}>
              <View style={styles.counsellorHeader}>
                <View style={styles.counsellorInfo}>
                  <View style={styles.counsellorNameRow}>
                    <Text style={styles.counsellorName}>{counsellor.name}</Text>
                    <View style={[
                      styles.statusBadge,
                      counsellor.status === 'available' ? styles.statusAvailable : styles.statusBusy
                    ]}>
                      <View style={[
                        styles.statusDot,
                        counsellor.status === 'available' ? styles.dotAvailable : styles.dotBusy
                      ]} />
                      <Text style={[
                        styles.statusText,
                        counsellor.status === 'available' ? styles.statusTextAvailable : styles.statusTextBusy
                      ]}>
                        {counsellor.status === 'available' ? 'Available' : 'Busy'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.counsellorSpec}>{counsellor.specialization}</Text>
                  {counsellor.nextAvailable && (
                    <Text style={styles.nextAvailable}>Next available in {counsellor.nextAvailable}</Text>
                  )}
                </View>
              </View>
              {counsellor.status === 'available' && (
                <TouchableOpacity
                  style={styles.talkButton}
                  onPress={() => handleCall(counsellor.phone)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="call" size={20} color="#ffffff" />
                  <Text style={styles.talkButtonText}>Talk Now</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        {/* Instructions */}
        <View style={styles.instructions}>
          <Text style={styles.instructionsText}>
            Or choose another way to reach out for support:
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
              <TouchableOpacity
                style={styles.contactButton}
                onPress={() => handleCall(service.phone)}
                activeOpacity={0.8}
              >
                <Ionicons name="call" size={24} color="#ffffff" />
                <Text style={styles.contactButtonText}>Call</Text>
              </TouchableOpacity>

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
  counsellorsSection: {
    backgroundColor: '#2d3748',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#4a5568',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  sectionDescription: {
    fontSize: 14,
    color: '#b0c4de',
    marginBottom: 16,
    lineHeight: 20,
  },
  counsellorCard: {
    backgroundColor: '#1a2332',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#4a5568',
  },
  counsellorHeader: {
    marginBottom: 12,
  },
  counsellorInfo: {
    flex: 1,
  },
  counsellorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  counsellorName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#ffffff',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  statusAvailable: {
    backgroundColor: '#2d4a3e',
  },
  statusBusy: {
    backgroundColor: '#4a3a2d',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotAvailable: {
    backgroundColor: '#4ade80',
  },
  dotBusy: {
    backgroundColor: '#fbbf24',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusTextAvailable: {
    color: '#a8e6cf',
  },
  statusTextBusy: {
    color: '#fde68a',
  },
  counsellorSpec: {
    fontSize: 14,
    color: '#b0c4de',
    marginBottom: 4,
  },
  nextAvailable: {
    fontSize: 13,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  talkButton: {
    flexDirection: 'row',
    backgroundColor: '#4a90e2',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  talkButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
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