import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Organization {
  name: string;
  description: string;
  phone: string;
  sms?: string;
  whatsapp?: string;
  website?: string;
}

export default function Organizations() {
  const router = useRouter();

  const organizations: Organization[] = [
    {
      name: 'Combat Stress',
      description: 'Leading charity for veterans mental health. Offers support for trauma, anxiety, depression and more.',
      phone: '08001381619',
      sms: '07537173683',
      whatsapp: '447537173683',
    },
    {
      name: 'Samaritans',
      description: 'Free 24/7 listening service for anyone who needs to talk. Confidential and non-judgmental support.',
      phone: '116123',
    },
    {
      name: 'Veterans UK',
      description: 'Government support service offering advice on benefits, compensation, and welfare for veterans.',
      phone: '08081914218',
    },
    {
      name: 'CALM',
      description: 'Campaign Against Living Miserably. Support for men experiencing difficult times, including veterans.',
      phone: '08006585858',
    },
    {
      name: 'NHS Urgent Mental Health Helpline',
      description: 'Call 111 and select option 2 for urgent mental health support 24/7.',
      phone: '111',
    },
    {
      name: 'SSAFA',
      description: 'Lifelong support for serving personnel, veterans, and their families. Practical and emotional support.',
      phone: '08001314880',
    },
    {
      name: 'Help for Heroes',
      description: 'Recovery and support for wounded, injured and sick veterans. Physical and mental health services.',
      phone: '03001240137',
    },
    {
      name: 'Royal British Legion',
      description: 'Welfare support, guidance and advice for serving and ex-serving personnel and their families.',
      phone: '08088028080',
    },
  ];

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

        {/* Emergency Banner */}
        <TouchableOpacity 
          style={styles.emergencyBanner}
          onPress={() => Linking.openURL('tel:999')}
          activeOpacity={0.8}
        >
          <Ionicons name="warning" size={24} color="#ffffff" />
          <Text style={styles.emergencyText}>Emergency? Call 999</Text>
        </TouchableOpacity>

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

          {/* Organizations List */}
          {organizations.map((org, index) => (
            <View key={index} style={styles.orgCard}>
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
          ))}

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
});