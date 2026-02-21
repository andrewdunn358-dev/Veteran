import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, StatusBar, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';

// Local images
const NEW_LOGO = require('../assets/images/logo.png');
const FRANKIES_POD_LOGO = require('../assets/images/frankies-pod.png');
const STANDING_TALL_LOGO = require('../assets/images/standing-tall.png');

export default function SplashScreen() {
  const router = useRouter();
  const [showCookieNotice, setShowCookieNotice] = useState(false);

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
  
  useEffect(() => {
    checkCookieConsent();
  }, []);

  const acceptCookies = async () => {
    try {
      await AsyncStorage.setItem('cookie_consent', 'accepted');
      setShowCookieNotice(false);
    } catch (error) {
      console.error('Error saving cookie consent:', error);
    }
  };

  const handleYes = () => {
    router.replace('/crisis-support');
  };

  const handleNo = () => {
    router.replace('/home');
  };

  const handleLearnMore = () => {
    router.push('/about');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#1a2e44" />
      <View style={styles.container}>
        <View style={styles.content}>
          {/* Logo - New transparent version */}
          <View style={styles.logoContainer}>
            <Image 
              source={NEW_LOGO}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* Title */}
          <Text style={styles.title}>Radio Check</Text>
          <Text style={styles.subtitle}>Your Support Network</Text>

          {/* Mission Statement */}
          <View style={styles.missionContainer}>
            <Text style={styles.missionText}>
              {`"Radio Check" fuses real-time peer support with smart AI insight, creating more than just an app — it's a digital hand on your shoulder when it matters most.`}
            </Text>
          </View>

          {/* Learn More Button */}
          <TouchableOpacity 
            style={styles.learnMoreButton} 
            onPress={handleLearnMore}
            activeOpacity={0.8}
          >
            <Ionicons name="information-circle-outline" size={18} color="#93c5fd" />
            <Text style={styles.learnMoreText}>Learn more about Radio Check</Text>
          </TouchableOpacity>

          {/* Question */}
          <View style={styles.questionContainer}>
            <Text style={styles.questionText}>
              Do you need to speak with someone right now?
            </Text>
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            {/* Yes - Primary action - Calming teal/green */}
            <TouchableOpacity 
              style={styles.yesButton} 
              onPress={handleYes} 
              data-testid="splash-yes-btn"
              activeOpacity={0.8}
            >
              <Ionicons name="chatbubbles" size={22} color="#ffffff" />
              <Text style={styles.yesButtonText}>Yes, connect me now</Text>
            </TouchableOpacity>

            {/* No - Secondary action - Clear and visible */}
            <TouchableOpacity 
              style={styles.noButton} 
              onPress={handleNo} 
              data-testid="splash-no-btn"
              activeOpacity={0.8}
            >
              <Ionicons name="apps" size={20} color="#ffffff" />
              <Text style={styles.noButtonText}>{"I'm ok, take me to the app"}</Text>
            </TouchableOpacity>
          </View>

          {/* Emergency Notice */}
          <View style={styles.emergencyNotice}>
            <Ionicons name="shield-checkmark" size={16} color="#ffffff" />
            <Text style={styles.emergencyText}>
              In an emergency, always call 999
            </Text>
          </View>

          {/* Supporter Logos */}
          <View style={styles.supportersSection}>
            <Text style={styles.supportersLabel}>Proudly supported by</Text>
            <View style={styles.supportersLogos}>
              <TouchableOpacity
                onPress={() => Linking.openURL('https://www.youtube.com/@FrankiesPod')}
                activeOpacity={0.8}
                style={styles.supporterLogoWrapper}
              >
                <Image 
                  source={FRANKIES_POD_LOGO}
                  style={styles.supporterLogo}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => Linking.openURL('https://www.standingtall.co.uk/')}
                activeOpacity={0.8}
                style={styles.supporterLogoWrapper}
              >
                <Image 
                  source={STANDING_TALL_LOGO}
                  style={styles.supporterLogoStandingTall}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Cookie Notice */}
        {showCookieNotice && (
          <View style={styles.cookieNotice}>
            <View style={styles.cookieContent}>
              <View style={styles.cookieIcon}>
                <Ionicons name="shield-checkmark" size={24} color="#3b82f6" />
              </View>
              <Text style={styles.cookieTitle}>Your Privacy</Text>
              <Text style={styles.cookieText}>
                We use local storage to save your preferences and journal entries on your device. 
                No personal data is sent to external servers without your consent.
              </Text>
              <TouchableOpacity style={styles.cookieAcceptButton} onPress={acceptCookies}>
                <Text style={styles.cookieAcceptText}>Accept & Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1a2e44', // Calming navy blue - fixed, no theme switching
  },
  container: {
    flex: 1,
    backgroundColor: '#1a2e44',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 32,
    maxWidth: 400,
  },
  logoContainer: {
    marginBottom: 16,
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
    color: '#8ba4c4',
    marginBottom: 16,
    textAlign: 'center',
  },
  missionContainer: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  missionText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#93c5fd',
    textAlign: 'center',
    lineHeight: 22,
  },
  learnMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 24,
    gap: 6,
  },
  learnMoreText: {
    fontSize: 14,
    color: '#93c5fd',
    textDecorationLine: 'underline',
  },
  questionContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  questionText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 28,
  },
  buttonContainer: {
    width: '100%',
    gap: 14,
    marginBottom: 28,
  },
  // Primary button - Calming teal that stands out
  yesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0d9488', // Teal - calming but obvious
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 14,
    gap: 10,
    shadowColor: '#0d9488',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  yesButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#ffffff',
  },
  // Secondary button - Clear white outline, visible
  noButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    gap: 8,
  },
  noButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  emergencyNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emergencyText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
  },
  supportersSection: {
    marginTop: 28,
    alignItems: 'center',
  },
  supportersLabel: {
    fontSize: 12,
    color: '#cbd5e1',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  supportersLogos: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  supporterLogoWrapper: {
    padding: 4,
  },
  supporterLogo: {
    width: 100,
    height: 50,
  },
  supporterLogoStandingTall: {
    width: 80,
    height: 60,
    backgroundColor: '#fff',
    borderRadius: 6,
  },
  // Cookie Notice
  cookieNotice: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  cookieContent: {
    alignItems: 'center',
  },
  cookieIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cookieTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  cookieText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  cookieAcceptButton: {
    backgroundColor: '#0d9488',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  cookieAcceptText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
