import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const EXPO_PUBLIC_BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function PeerSupport() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleRegister = async () => {
    if (!email.trim()) {
      Alert.alert('Email Required', 'Please enter your email address.');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${EXPO_PUBLIC_BACKEND_URL}/api/peer-support/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (response.ok) {
        Alert.alert(
          'Thank You',
          'Your interest has been registered. We will contact you soon with more information about the peer support programme.',
          [
            {
              text: 'OK',
              onPress: () => {
                setEmail('');
                setShowForm(false);
                router.back();
              },
            },
          ]
        );
      } else {
        const error = await response.json();
        Alert.alert('Error', error.detail || 'Failed to register. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Error', 'Unable to connect. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#1a2332" />
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#7c9cbf" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Peer Support</Text>
          </View>

          {/* Icon */}
          <View style={styles.iconContainer}>
            <Ionicons name="people-circle" size={80} color="#7c9cbf" />
          </View>

          {/* Main Content */}
          <View style={styles.content}>
            <Text style={styles.title}>Talk to Another Veteran</Text>
            <Text style={styles.subtitle}>Peer support from those who understand</Text>

            {/* What is it */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="checkmark-circle" size={24} color="#7c9cbf" />
                <Text style={styles.sectionTitle}>What is peer support?</Text>
              </View>
              <Text style={styles.sectionText}>
                Connect with fellow veterans who understand what you're going through. Share experiences, offer mutual support, and know you're not alone.
              </Text>
            </View>

            {/* What it's not */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="information-circle" size={24} color="#7c9cbf" />
                <Text style={styles.sectionTitle}>What it's not</Text>
              </View>
              <Text style={styles.sectionText}>
                • Not professional therapy or counselling{"\n"}
                • Not an emergency service{"\n"}
                • Not a replacement for medical care
              </Text>
            </View>

            {/* Benefits */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="heart" size={24} color="#7c9cbf" />
                <Text style={styles.sectionTitle}>How it helps</Text>
              </View>
              <Text style={styles.sectionText}>
                Speaking with someone who's walked a similar path can make a real difference. Peer supporters are trained volunteers who've served and understand the challenges.
              </Text>
            </View>

            {/* Call to Action */}
            {!showForm ? (
              <TouchableOpacity 
                style={styles.primaryButton}
                onPress={() => setShowForm(true)}
                activeOpacity={0.8}
              >
                <Ionicons name="person-add" size={24} color="#ffffff" />
                <Text style={styles.primaryButtonText}>Register Your Interest</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.formContainer}>
                <Text style={styles.formTitle}>Register to Give Peer Support</Text>
                <Text style={styles.formDescription}>
                  If you're a veteran interested in supporting others, please share your email. We'll contact you with more details about the programme.
                </Text>
                
                <TextInput
                  style={styles.input}
                  placeholder="Your email address"
                  placeholderTextColor="#6b7280"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isSubmitting}
                />

                <TouchableOpacity 
                  style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                  onPress={handleRegister}
                  disabled={isSubmitting}
                  activeOpacity={0.8}
                >
                  {isSubmitting ? (
                    <Text style={styles.submitButtonText}>Submitting...</Text>
                  ) : (
                    <Text style={styles.submitButtonText}>Submit</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowForm(false);
                    setEmail('');
                  }}
                  disabled={isSubmitting}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Disclaimer */}
          <View style={styles.disclaimer}>
            <Ionicons name="shield-checkmark" size={16} color="#b0c4de" />
            <Text style={styles.disclaimerText}>
              Your information will be kept confidential and only used to contact you about the peer support programme.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  content: {
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#b0c4de',
    textAlign: 'center',
    marginBottom: 32,
  },
  section: {
    backgroundColor: '#2d3748',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#4a5568',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  sectionText: {
    fontSize: 15,
    color: '#b0c4de',
    lineHeight: 22,
  },
  primaryButton: {
    flexDirection: 'row',
    backgroundColor: '#4a90e2',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 16,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  formContainer: {
    backgroundColor: '#2d3748',
    borderRadius: 12,
    padding: 24,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#4a5568',
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
  },
  formDescription: {
    fontSize: 14,
    color: '#b0c4de',
    lineHeight: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#1a2332',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: '#4a5568',
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: '#4a90e2',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  cancelButton: {
    padding: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    color: '#7c9cbf',
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#2d3748',
    borderRadius: 8,
    padding: 16,
    gap: 12,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 12,
    color: '#b0c4de',
    lineHeight: 18,
  },
});