import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SplashScreen() {
  const router = useRouter();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [showCookieNotice, setShowCookieNotice] = useState(false);
  
  useEffect(() => {
    // Check if user has accepted cookies
    checkCookieConsent();
    
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
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

  const handleEnter = () => {
    router.replace('/home');
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image 
            source={{ uri: 'https://static.prod-images.emergentagent.com/jobs/22c2fac2-c7ea-4255-b9fb-379a93a49652/images/b2952f18c7d26f1e02afc6a0e07efe1ee43cd00af073f456000dce29b154ce3a.png' }}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Title */}
        <Text style={styles.title}>Radio Check</Text>
        <Text style={styles.subtitle}>Veterans Support Network</Text>

        {/* Tagline */}
        <Text style={styles.tagline}>
          "Semel Servientes, Semper Uniti"
        </Text>
        <Text style={styles.taglineTranslation}>
          Once Serving, Always United
        </Text>

        {/* Description */}
        <Text style={styles.description}>
          A safe space for UK military veterans to connect, find support, and access resources.
        </Text>

        {/* Enter Button */}
        <TouchableOpacity style={styles.enterButton} onPress={handleEnter}>
          <Text style={styles.enterButtonText}>Enter</Text>
          <Ionicons name="arrow-forward" size={20} color="#ffffff" />
        </TouchableOpacity>

        {/* Emergency Notice */}
        <View style={styles.emergencyNotice}>
          <Ionicons name="warning" size={16} color="#f59e0b" />
          <Text style={styles.emergencyText}>
            In an emergency, always call 999
          </Text>
        </View>
      </Animated.View>

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
    </View>
  );
}

const styles = StyleSheet.create({
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
    marginBottom: 24,
  },
  logo: {
    width: 150,
    height: 150,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#7c9cbf',
    marginBottom: 24,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#c9a227',
    marginBottom: 4,
    textAlign: 'center',
  },
  taglineTranslation: {
    fontSize: 14,
    color: '#8899a6',
    marginBottom: 24,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#b0c4de',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  enterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4a90e2',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 30,
    gap: 8,
    marginBottom: 32,
  },
  enterButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
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
});
