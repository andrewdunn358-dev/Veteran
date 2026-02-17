import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, StatusBar, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../src/context/ThemeContext';

export default function SplashScreen() {
  const router = useRouter();
  const { colors, theme } = useTheme();
  const [showCookieNotice, setShowCookieNotice] = useState(false);
  
  const isDark = theme === 'dark';
  
  useEffect(() => {
    // Check if user has accepted cookies
    checkCookieConsent();
  }, []);

  const checkCookieConsent = async () => {
    try {
      const consent = await AsyncStorage.getItem('cookie_consent');
      if (!consent) {
        setShowCookieNotice(true);
      }
    } catch (error) {
      setShowCookieNotice(true);
    }
  };

  const acceptCookies = async () => {
    try {
      await AsyncStorage.setItem('cookie_consent', 'accepted');
      setShowCookieNotice(false);
    } catch (error) {
      console.error('Error saving cookie consent:', error);
    }
  };

  const handleYes = () => {
    // Go straight to crisis support / counsellors
    router.replace('/crisis-support');
  };

  const handleNo = () => {
    // Go to main app
    router.replace('/home');
  };

  const styles = createStyles(colors, isDark);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#0d1b2a" />
      <View style={styles.container}>
        <View style={styles.content}>
          {/* Logo - with transparent background handling */}
          <View style={styles.logoContainer}>
            <Image 
              source={{ uri: 'https://customer-assets.emergentagent.com/job_22c2fac2-c7ea-4255-b9fb-379a93a49652/artifacts/gsdv90d5_splash.png' }}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* Title */}
          <Text style={styles.title}>Radio Check</Text>
          <Text style={styles.subtitle}>Veterans Support Network</Text>

          {/* Question */}
          <View style={styles.questionContainer}>
            <Ionicons name="heart" size={32} color="#ef4444" style={styles.heartIcon} />
            <Text style={styles.question}>
              Are you in need of immediate help?
          </Text>
        </View>

        {/* Yes/No Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.yesButton} onPress={handleYes} data-testid="splash-yes-btn">
            <Ionicons name="checkmark-circle" size={24} color="#ffffff" />
            <Text style={styles.yesButtonText}>Yes, I need help now</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.noButton} onPress={handleNo} data-testid="splash-no-btn">
            <Text style={styles.noButtonText}>No, continue to app</Text>
            <Ionicons name="arrow-forward" size={20} color="#7c9cbf" />
          </TouchableOpacity>
        </View>

        {/* Emergency Notice */}
        <View style={styles.emergencyNotice}>
          <Ionicons name="warning" size={16} color="#f59e0b" />
          <Text style={styles.emergencyText}>
            In an emergency, always call 999
          </Text>
        </View>
      </View>

      {/* GDPR Cookie Notice */}
      {showCookieNotice && (
        <View style={styles.cookieNotice}>
          <View style={styles.cookieContent}>
            <Ionicons name="shield-checkmark" size={24} color="#4a90e2" />
            <View style={styles.cookieTextContainer}>
              <Text style={styles.cookieTitle}>Your Privacy</Text>
              <Text style={styles.cookieText}>
                We use local storage to save your preferences and journal entries on your device. 
                No personal data is sent to external servers without your consent.
              </Text>
            </View>
          </View>
          <View style={styles.cookieButtons}>
            <TouchableOpacity style={styles.cookieAcceptButton} onPress={acceptCookies}>
              <Text style={styles.cookieAcceptText}>Accept & Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Panic Alert Modal */}
      <Modal visible={showPanicModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Ionicons name="warning" size={32} color="#ef4444" />
              <Text style={styles.modalTitle}>Emergency Alert</Text>
            </View>
            
            <Text style={styles.modalSubtext}>
              A counsellor will be notified immediately. You can add details below (optional).
            </Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Your name (optional)"
              placeholderTextColor="#8899a6"
              value={panicData.name}
              onChangeText={(text) => setPanicData({ ...panicData, name: text })}
            />
            
            <TextInput
              style={styles.modalInput}
              placeholder="Your phone (so we can call you back)"
              placeholderTextColor="#8899a6"
              value={panicData.phone}
              onChangeText={(text) => setPanicData({ ...panicData, phone: text })}
              keyboardType="phone-pad"
            />
            
            <TextInput
              style={[styles.modalInput, styles.modalTextArea]}
              placeholder="What's happening? (optional)"
              placeholderTextColor="#8899a6"
              value={panicData.message}
              onChangeText={(text) => setPanicData({ ...panicData, message: text })}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalCancelButton}
                onPress={() => setShowPanicModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.modalSendButton}
                onPress={submitPanicAlert}
                disabled={panicSubmitting}
              >
                {panicSubmitting ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <>
                    <Ionicons name="send" size={18} color="#ffffff" />
                    <Text style={styles.modalSendText}>Send Alert</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.modalEmergencyNote}>
              <Text style={styles.modalEmergencyText}>
                If you're in immediate danger, call 999
              </Text>
            </View>
          </View>
        </View>
      </Modal>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0d1b2a',
  },
  container: {
    flex: 1,
    backgroundColor: '#0d1b2a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 32,
    maxWidth: 400,
  },
  logoContainer: {
    marginBottom: 20,
    backgroundColor: 'transparent',
  },
  logo: {
    width: 120,
    height: 120,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#7c9cbf',
    marginBottom: 32,
    textAlign: 'center',
  },
  questionContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  heartIcon: {
    marginBottom: 12,
  },
  question: {
    fontSize: 22,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 30,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
    marginBottom: 24,
  },
  yesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ef4444',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 12,
    gap: 10,
  },
  yesButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  noButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2d3e50',
    gap: 8,
  },
  noButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#7c9cbf',
  },
  panicButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dc2626',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    gap: 10,
    marginBottom: 24,
    width: '100%',
    borderWidth: 2,
    borderColor: '#fca5a5',
  },
  panicButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  emergencyNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  emergencyText: {
    fontSize: 14,
    color: '#f59e0b',
  },
  cookieNotice: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1a2634',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#2d3e50',
  },
  cookieContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  cookieTextContainer: {
    flex: 1,
  },
  cookieTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  cookieText: {
    fontSize: 13,
    color: '#b0c4de',
    lineHeight: 18,
  },
  cookieButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cookieAcceptButton: {
    backgroundColor: '#4a90e2',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 6,
  },
  cookieAcceptText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  // Panic Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#1a2634',
    borderRadius: 16,
    padding: 24,
    borderWidth: 2,
    borderColor: '#ef4444',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ef4444',
  },
  modalSubtext: {
    fontSize: 14,
    color: '#b0c4de',
    marginBottom: 20,
    lineHeight: 20,
  },
  modalInput: {
    backgroundColor: '#0d1b2a',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2d3e50',
  },
  modalTextArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#2d3e50',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#b0c4de',
  },
  modalSendButton: {
    flex: 2,
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ef4444',
    gap: 8,
  },
  modalSendText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  modalEmergencyNote: {
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 8,
    alignItems: 'center',
  },
  modalEmergencyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ef4444',
  },
});
