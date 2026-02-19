import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar, Linking, Platform, ActivityIndicator, Modal, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWebRTCCall, formatCallDuration } from '../hooks/useWebRTCCallWeb';

const API_URL = Platform.select({
  web: process.env.EXPO_PUBLIC_BACKEND_URL || '',
  default: process.env.EXPO_PUBLIC_BACKEND_URL || ''
});

interface Counsellor {
  id: string;
  name: string;
  status: 'available' | 'busy' | 'off';
  specialization: string;
  next_available?: string;
  phone: string;
  sms?: string;
  whatsapp?: string;
  user_id?: string;
}

export default function CrisisSupport() {
  const router = useRouter();
  const [counsellors, setCounsellors] = useState<Counsellor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // WebRTC calling
  const { callState, callInfo, callDuration, initiateCall, endCall } = useWebRTCCall();
  const [isInitiatingCall, setIsInitiatingCall] = useState(false);
  const [callingCounsellorName, setCallingCounsellorName] = useState('');
  const showCallModal = callState !== 'idle' || isInitiatingCall;

  // Fetch counsellors from API
  const fetchCounsellors = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Use /available endpoint - returns only public-safe data
      const response = await fetch(`${API_URL}/api/counsellors/available`);
      if (response.ok) {
        const data = await response.json();
        setCounsellors(data);
      } else {
        setError('Unable to load counsellors');
      }
    } catch (err) {
      console.error('Error fetching counsellors:', err);
      setError('Unable to connect. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCounsellors();
  }, []);

  const crisisServices = [
    {
      name: 'Combat Stress',
      description: '24/7 veteran mental health helpline',
      phone: '01912704378',
      sms: '01912704378',
      whatsapp: '441912704378',
      icon: 'shield' as const,
    },
    {
      name: 'Samaritans',
      description: '24/7 confidential emotional support',
      phone: '01912704378',
      sms: '01912704378',
      whatsapp: '441912704378',
      icon: 'heart' as const,
    },
    {
      name: 'Veterans UK',
      description: 'Government support and guidance',
      phone: '01912704378',
      sms: '01912704378',
      whatsapp: '441912704378',
      icon: 'information-circle' as const,
    },
  ];

  // Log call intent to backend
  const logCallIntent = async (contactType: string, contactId: string | null, contactName: string, contactPhone: string, callMethod: string) => {
    try {
      await fetch(`${API_URL}/api/call-logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contact_type: contactType,
          contact_id: contactId,
          contact_name: contactName,
          contact_phone: contactPhone,
          call_method: callMethod,
        }),
      });
    } catch (err) {
      // Silent fail - don't block the user from making the call
      console.log('Failed to log call intent:', err);
    }
  };

  const handleCall = (number: string, contactName: string = 'Unknown', contactType: string = 'crisis_line', contactId: string | null = null, userId: string | null = null) => {
    logCallIntent(contactType, contactId, contactName, number, 'phone');
    
    // Use WebRTC for in-app calling if on web platform AND user_id is available (for counsellors only)
    if (Platform.OS === 'web' && userId && contactType === 'counsellor') {
      console.log('WebRTC: Initiating call to counsellor', contactName, 'user_id:', userId);
      setCallingCounsellorName(contactName);
      setIsInitiatingCall(true);
      
      initiateCall(userId, contactName).catch((error) => {
        console.error('WebRTC call failed:', error);
        setIsInitiatingCall(false);
        Alert.alert('Call Failed', 'Unable to connect. Please try again.');
      });
    } else if (Platform.OS === 'web' && !userId && contactType === 'counsellor') {
      // Counsellor doesn't have WebRTC set up, show message
      Alert.alert(
        'In-App Calling Not Available',
        'This counsellor hasn\'t set up in-app calling yet. Would you like to call their phone instead?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Call Phone', onPress: () => Linking.openURL(`tel:${number}`) }
        ]
      );
    } else {
      // Crisis lines or native app - use phone dialer directly
      Linking.openURL(`tel:${number}`);
    }
  };

  // Handle call end
  const handleEndCall = () => {
    endCall();
    setIsInitiatingCall(false);
    setCallingCounsellorName('');
  };

  // Update initiating state when call state changes
  useEffect(() => {
    if (callState !== 'idle' && isInitiatingCall) {
      setIsInitiatingCall(false);
    }
  }, [callState]);

  const handleSMS = (number: string, contactName: string = 'Unknown', contactType: string = 'crisis_line', contactId: string | null = null) => {
    logCallIntent(contactType, contactId, contactName, number, 'sms');
    Linking.openURL(`sms:${number}`);
  };

  const handleWhatsApp = (number: string, contactName: string = 'Unknown', contactType: string = 'crisis_line', contactId: string | null = null) => {
    logCallIntent(contactType, contactId, contactName, number, 'whatsapp');
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
          <TouchableOpacity onPress={() => router.replace('/home')} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#7c9cbf" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Crisis Support</Text>
        </View>

        {/* Emergency Banner - Display only, no call functionality */}
        <View style={styles.emergencyBanner}>
          <Ionicons name="warning" size={28} color="#ffffff" />
          <View style={styles.emergencyTextContainer}>
            <Text style={styles.emergencyTitle}>Emergency: Call 999</Text>
            <Text style={styles.emergencySubtext}>For immediate danger, dial 999 directly</Text>
          </View>
        </View>

        {/* On-Duty Counsellors Section */}
        <View style={styles.counsellorsSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="people-circle" size={24} color="#7c9cbf" />
            <Text style={styles.sectionTitle}>On-Duty Counsellors</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Professional counsellors available now to speak with you
          </Text>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4a90e2" />
              <Text style={styles.loadingText}>Loading counsellors...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={24} color="#ef4444" />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={fetchCounsellors}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : counsellors.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="time" size={32} color="#7c9cbf" />
              <Text style={styles.emptyText}>No counsellors on duty at the moment</Text>
              <Text style={styles.emptySubtext}>Please try the crisis services below</Text>
            </View>
          ) : (
            counsellors.map((counsellor, index) => (
            <View key={counsellor.id || index} style={styles.counsellorCard}>
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
                  {counsellor.next_available && (
                    <Text style={styles.nextAvailable}>Next available in {counsellor.next_available}</Text>
                  )}
                </View>
              </View>
              {counsellor.status === 'available' && (
                <View style={styles.counsellorContactButtons}>
                  <TouchableOpacity
                    style={styles.counsellorCallButton}
                    onPress={() => handleCall(counsellor.phone, counsellor.name, 'counsellor', counsellor.id, counsellor.user_id || null)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="call" size={20} color="#ffffff" />
                    <Text style={styles.counsellorCallButtonText}>Call</Text>
                  </TouchableOpacity>
                  
                  {counsellor.sms && (
                    <TouchableOpacity
                      style={styles.counsellorSecondaryButton}
                      onPress={() => handleSMS(counsellor.sms!, counsellor.name, 'counsellor', counsellor.id)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="chatbubble" size={18} color="#7c9cbf" />
                      <Text style={styles.counsellorSecondaryButtonText}>Text</Text>
                    </TouchableOpacity>
                  )}

                  {counsellor.whatsapp && (
                    <TouchableOpacity
                      style={styles.counsellorSecondaryButton}
                      onPress={() => handleWhatsApp(counsellor.whatsapp!, counsellor.name, 'counsellor', counsellor.id)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="logo-whatsapp" size={18} color="#7c9cbf" />
                      <Text style={styles.counsellorSecondaryButtonText}>WhatsApp</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          ))
          )}
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
                onPress={() => handleCall(service.phone, service.name, 'crisis_line', null)}
                activeOpacity={0.8}
              >
                <Ionicons name="call" size={24} color="#ffffff" />
                <Text style={styles.contactButtonText}>Call</Text>
              </TouchableOpacity>

              {service.sms && (
                <TouchableOpacity
                  style={[styles.contactButton, styles.contactButtonSecondary]}
                  onPress={() => handleSMS(service.sms!, service.name, 'crisis_line', null)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="chatbubble" size={24} color="#7c9cbf" />
                  <Text style={[styles.contactButtonText, styles.contactButtonTextSecondary]}>Text</Text>
                </TouchableOpacity>
              )}

              {service.whatsapp && (
                <TouchableOpacity
                  style={[styles.contactButton, styles.contactButtonSecondary]}
                  onPress={() => handleWhatsApp(service.whatsapp!, service.name, 'crisis_line', null)}
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

      {/* WebRTC Call Modal */}
      <Modal visible={showCallModal} transparent animationType="fade">
        <View style={styles.callModalOverlay}>
          <View style={styles.callModalContent}>
            <View style={styles.callModalHeader}>
              {/* Animated icon based on call state */}
              <View style={styles.callIconContainer}>
                <Ionicons 
                  name={callState === 'connected' ? 'call' : 'call-outline'} 
                  size={48} 
                  color={callState === 'connected' ? '#22c55e' : '#3b82f6'} 
                />
              </View>
              
              <Text style={styles.callModalTitle}>
                {isInitiatingCall ? 'Connecting...' :
                 callState === 'connecting' ? 'Connecting...' : 
                 callState === 'ringing' ? 'Ringing...' : 
                 callState === 'connected' ? 'Connected' : 'Calling...'}
              </Text>
              
              <Text style={styles.callModalPeerName}>
                {callInfo?.peerName || callingCounsellorName || 'Counsellor'}
              </Text>
              
              {callState === 'connected' && (
                <Text style={styles.callModalDuration}>{formatCallDuration(callDuration)}</Text>
              )}
              
              {(isInitiatingCall || callState === 'connecting' || callState === 'ringing') && (
                <ActivityIndicator size="small" color="#3b82f6" style={{ marginTop: 16 }} />
              )}
            </View>
            
            <TouchableOpacity style={styles.callEndButton} onPress={handleEndCall}>
              <Ionicons name="call" size={28} color="#fff" style={{ transform: [{ rotate: '135deg' }] }} />
              <Text style={styles.callEndButtonText}>
                {callState === 'connected' ? 'End Call' : 'Cancel'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  counsellorContactButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  counsellorCallButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#4a90e2',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  counsellorCallButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  counsellorSecondaryButton: {
    flexDirection: 'row',
    backgroundColor: '#374151',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#4a5568',
    minWidth: 80,
  },
  counsellorSecondaryButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#7c9cbf',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#b0c4de',
  },
  errorContainer: {
    alignItems: 'center',
    padding: 24,
    gap: 12,
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#4a90e2',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 24,
    gap: 8,
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
  // Call Modal Styles
  callModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  callModalContent: {
    backgroundColor: '#1a2332',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    minWidth: 280,
    borderWidth: 1,
    borderColor: '#2d3748',
  },
  callModalHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  callIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  callModalTitle: {
    fontSize: 18,
    color: '#94a3b8',
    marginTop: 16,
  },
  callModalPeerName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginTop: 8,
  },
  callModalDuration: {
    fontSize: 32,
    fontWeight: '300',
    color: '#22c55e',
    marginTop: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  callEndButton: {
    backgroundColor: '#ef4444',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 30,
    gap: 10,
  },
  callEndButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});