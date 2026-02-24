import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface AIConsentModalProps {
  visible: boolean;
  onAccept: () => void;
  onDecline?: () => void;
  characterName: string;
}

export default function AIConsentModal({ visible, onAccept, onDecline, characterName }: AIConsentModalProps) {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const callSamaritans = () => {
    Linking.openURL('tel:116123');
  };

  const callCombatStress = () => {
    Linking.openURL('tel:08001381619');
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => {}}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Ionicons name="chatbubbles" size={32} color="#3b82f6" />
              </View>
              <Text style={styles.title}>Before You Chat with {characterName}</Text>
            </View>

            {/* AI Disclosure */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="information-circle" size={20} color="#f59e0b" />
                <Text style={styles.sectionTitle}>Important Information</Text>
              </View>
              <View style={styles.disclosureBox}>
                <Text style={styles.disclosureText}>
                  <Text style={styles.bold}>{characterName} is an AI assistant</Text>, not a trained 
                  counsellor or mental health professional. This is peer-style support only.
                </Text>
              </View>
            </View>

            {/* What AI Can Do */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>What {characterName} Can Help With</Text>
              <View style={styles.listItem}>
                <Ionicons name="checkmark-circle" size={18} color="#22c55e" />
                <Text style={styles.listText}>Listen to your concerns without judgement</Text>
              </View>
              <View style={styles.listItem}>
                <Ionicons name="checkmark-circle" size={18} color="#22c55e" />
                <Text style={styles.listText}>Provide emotional support and encouragement</Text>
              </View>
              <View style={styles.listItem}>
                <Ionicons name="checkmark-circle" size={18} color="#22c55e" />
                <Text style={styles.listText}>Suggest coping techniques and grounding exercises</Text>
              </View>
              <View style={styles.listItem}>
                <Ionicons name="checkmark-circle" size={18} color="#22c55e" />
                <Text style={styles.listText}>Point you to helpful resources and services</Text>
              </View>
            </View>

            {/* What AI Cannot Do */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>What {characterName} Cannot Do</Text>
              <View style={styles.listItem}>
                <Ionicons name="close-circle" size={18} color="#ef4444" />
                <Text style={styles.listText}>Provide medical or psychiatric advice</Text>
              </View>
              <View style={styles.listItem}>
                <Ionicons name="close-circle" size={18} color="#ef4444" />
                <Text style={styles.listText}>Diagnose conditions or prescribe treatments</Text>
              </View>
              <View style={styles.listItem}>
                <Ionicons name="close-circle" size={18} color="#ef4444" />
                <Text style={styles.listText}>Replace professional therapy or counselling</Text>
              </View>
              <View style={styles.listItem}>
                <Ionicons name="close-circle" size={18} color="#ef4444" />
                <Text style={styles.listText}>Respond to emergencies (call 999 instead)</Text>
              </View>
            </View>

            {/* Privacy & Data */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="shield-checkmark" size={20} color="#3b82f6" />
                <Text style={styles.sectionTitle}>Privacy & Your Data</Text>
              </View>
              <Text style={styles.paragraph}>
                Your messages are processed by AI (powered by OpenAI) to provide support. 
                We monitor conversations for safeguarding purposes to keep you safe.
              </Text>
              <Text style={styles.paragraph}>
                <Text style={styles.bold}>Data retention:</Text> Chat history is retained for 90 days, 
                then anonymised. You can delete your chat history anytime in Settings.
              </Text>
            </View>

            {/* Safeguarding Notice */}
            <View style={styles.safeguardingBox}>
              <Ionicons name="heart" size={20} color="#ef4444" />
              <Text style={styles.safeguardingText}>
                <Text style={styles.bold}>Your safety matters.</Text> If we detect you may be in 
                crisis, we may suggest professional support or emergency services.
              </Text>
            </View>

            {/* Crisis Numbers */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Need Immediate Support?</Text>
              <TouchableOpacity style={styles.crisisButton} onPress={callSamaritans}>
                <View style={styles.crisisIcon}>
                  <Ionicons name="call" size={20} color="#22c55e" />
                </View>
                <View style={styles.crisisInfo}>
                  <Text style={styles.crisisName}>Samaritans</Text>
                  <Text style={styles.crisisNumber}>116 123</Text>
                </View>
                <Text style={styles.crisisAvail}>24/7</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.crisisButton} onPress={callCombatStress}>
                <View style={styles.crisisIcon}>
                  <Ionicons name="medkit" size={20} color="#3b82f6" />
                </View>
                <View style={styles.crisisInfo}>
                  <Text style={styles.crisisName}>Combat Stress</Text>
                  <Text style={styles.crisisNumber}>0800 138 1619</Text>
                </View>
                <Text style={styles.crisisAvail}>24/7</Text>
              </TouchableOpacity>
            </View>

            {/* Consent Button */}
            <TouchableOpacity style={styles.acceptButton} onPress={onAccept}>
              <Text style={styles.acceptButtonText}>I Understand - Start Chat</Text>
            </TouchableOpacity>

            <Text style={styles.footerText}>
              By continuing, you acknowledge this is AI support and agree to our privacy policy.
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// Dynamic styles based on theme
const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modal: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
    borderWidth: isDark ? 1 : 0,
    borderColor: colors.border,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: isDark ? '#1e3a5f' : '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 10,
  },
  disclosureBox: {
    backgroundColor: isDark ? '#451a03' : '#fef3c7',
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  disclosureText: {
    fontSize: 14,
    color: isDark ? '#fcd34d' : '#92400e',
    lineHeight: 20,
  },
  bold: {
    fontWeight: '700',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
  },
  listText: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  paragraph: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 19,
    marginBottom: 8,
  },
  safeguardingBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: isDark ? '#450a0a' : '#fef2f2',
    borderRadius: 12,
    padding: 14,
    gap: 10,
    marginBottom: 20,
  },
  safeguardingText: {
    flex: 1,
    fontSize: 13,
    color: isDark ? '#fca5a5' : '#991b1b',
    lineHeight: 19,
  },
  crisisButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  crisisIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  crisisInfo: {
    flex: 1,
  },
  crisisName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  crisisNumber: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
  },
  crisisAvail: {
    fontSize: 12,
    color: '#22c55e',
    fontWeight: '600',
  },
  acceptButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  acceptButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  footerText: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 14,
    lineHeight: 16,
  },
});
