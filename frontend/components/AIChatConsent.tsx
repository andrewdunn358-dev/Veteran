import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AIChatConsentProps {
  visible: boolean;
  characterName: string;
  onAccept: () => void;
  onDecline: () => void;
}

const AI_CONSENT_KEY = 'ai_chat_consent_accepted';

export const useAIChatConsent = () => {
  const [hasConsent, setHasConsent] = useState<boolean | null>(null);
  const [showConsentModal, setShowConsentModal] = useState(false);

  useEffect(() => {
    checkConsent();
  }, []);

  const checkConsent = async () => {
    try {
      const consent = await AsyncStorage.getItem(AI_CONSENT_KEY);
      setHasConsent(consent === 'true');
    } catch (error) {
      setHasConsent(false);
    }
  };

  const requestConsent = () => {
    if (hasConsent) return true;
    setShowConsentModal(true);
    return false;
  };

  const grantConsent = async () => {
    try {
      await AsyncStorage.setItem(AI_CONSENT_KEY, 'true');
      setHasConsent(true);
      setShowConsentModal(false);
    } catch (error) {
      console.error('Failed to save consent:', error);
    }
  };

  const revokeConsent = async () => {
    try {
      await AsyncStorage.removeItem(AI_CONSENT_KEY);
      setHasConsent(false);
    } catch (error) {
      console.error('Failed to revoke consent:', error);
    }
  };

  return {
    hasConsent,
    showConsentModal,
    setShowConsentModal,
    requestConsent,
    grantConsent,
    revokeConsent,
  };
};

export const AIChatConsentModal: React.FC<AIChatConsentProps> = ({
  visible,
  characterName,
  onAccept,
  onDecline,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onDecline}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Ionicons name="chatbubbles" size={32} color="#0d9488" />
              </View>
              <Text style={styles.title}>Before You Chat</Text>
              <Text style={styles.subtitle}>
                Important information about AI support
              </Text>
            </View>

            {/* Content */}
            <View style={styles.content}>
              {/* AI Disclosure */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="information-circle" size={20} color="#3b82f6" />
                  <Text style={styles.sectionTitle}>AI Companion</Text>
                </View>
                <Text style={styles.sectionText}>
                  {characterName} is an <Text style={styles.bold}>AI companion</Text>, not a human 
                  counsellor or therapist. While they can offer support and a listening ear, 
                  they cannot provide professional mental health treatment.
                </Text>
              </View>

              {/* What AI Can Do */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                  <Text style={styles.sectionTitle}>What They Can Do</Text>
                </View>
                <View style={styles.bulletList}>
                  <Text style={styles.bulletItem}>• Listen without judgement</Text>
                  <Text style={styles.bulletItem}>• Offer emotional support</Text>
                  <Text style={styles.bulletItem}>• Share coping techniques</Text>
                  <Text style={styles.bulletItem}>• Provide UK veteran resources</Text>
                  <Text style={styles.bulletItem}>• Connect you to human support</Text>
                </View>
              </View>

              {/* What AI Cannot Do */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="close-circle" size={20} color="#ef4444" />
                  <Text style={styles.sectionTitle}>What They Cannot Do</Text>
                </View>
                <View style={styles.bulletList}>
                  <Text style={styles.bulletItem}>• Diagnose conditions</Text>
                  <Text style={styles.bulletItem}>• Prescribe medication</Text>
                  <Text style={styles.bulletItem}>• Replace professional therapy</Text>
                  <Text style={styles.bulletItem}>• Provide emergency response</Text>
                </View>
              </View>

              {/* Data & Privacy */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="shield-checkmark" size={20} color="#8b5cf6" />
                  <Text style={styles.sectionTitle}>Your Privacy</Text>
                </View>
                <Text style={styles.sectionText}>
                  Your conversations are processed to provide support and detect crisis 
                  situations. We use encryption to protect your data. You can export or 
                  delete your data at any time from Settings.
                </Text>
              </View>

              {/* Safeguarding Notice */}
              <View style={[styles.section, styles.safeguardingSection]}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="heart" size={20} color="#ec4899" />
                  <Text style={styles.sectionTitle}>Your Safety Matters</Text>
                </View>
                <Text style={styles.sectionText}>
                  If our system detects you may be in crisis, we may alert our safeguarding 
                  team to ensure you get the support you need. This is to keep you safe.
                </Text>
              </View>

              {/* Emergency Notice */}
              <View style={styles.emergencyBox}>
                <Ionicons name="warning" size={24} color="#dc2626" />
                <Text style={styles.emergencyText}>
                  <Text style={styles.bold}>In an emergency, always call 999.</Text>
                  {'\n'}For crisis support, contact Samaritans: 116 123 (free, 24/7)
                </Text>
              </View>
            </View>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.acceptButton}
                onPress={onAccept}
                activeOpacity={0.8}
              >
                <Ionicons name="checkmark" size={20} color="#ffffff" />
                <Text style={styles.acceptButtonText}>I Understand, Start Chat</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.declineButton}
                onPress={onDecline}
                activeOpacity={0.8}
              >
                <Text style={styles.declineButtonText}>Not Now</Text>
              </TouchableOpacity>

              <Text style={styles.footerText}>
                By continuing, you acknowledge you have read and understood this information.
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    maxHeight: '90%',
    width: '100%',
    maxWidth: 400,
    overflow: 'hidden',
  },
  header: {
    alignItems: 'center',
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f0fdfa',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  sectionText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  bold: {
    fontWeight: '600',
  },
  bulletList: {
    gap: 4,
  },
  bulletItem: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  safeguardingSection: {
    backgroundColor: '#fdf2f8',
    padding: 12,
    borderRadius: 12,
  },
  emergencyBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fef2f2',
    padding: 12,
    borderRadius: 12,
    gap: 12,
    marginTop: 8,
  },
  emergencyText: {
    flex: 1,
    fontSize: 13,
    color: '#991b1b',
    lineHeight: 18,
  },
  buttonContainer: {
    padding: 20,
    paddingTop: 8,
    gap: 12,
  },
  acceptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0d9488',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  acceptButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  declineButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  declineButtonText: {
    fontSize: 15,
    color: '#64748b',
  },
  footerText: {
    fontSize: 11,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default AIChatConsentModal;
