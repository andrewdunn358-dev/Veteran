import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TermsOfService() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms of Service</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.lastUpdated}>Last Updated: February 2026</Text>

        <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
        <Text style={styles.paragraph}>
          By downloading, accessing, or using Radio Check ("the App"), you agree to be 
          bound by these Terms of Service. If you do not agree to these terms, please 
          do not use the App.
        </Text>

        <Text style={styles.sectionTitle}>2. Service Description</Text>
        <Text style={styles.paragraph}>
          Radio Check is a peer support application designed for UK veterans and their 
          families. The App provides:{'\n\n'}
          • AI-powered companions for emotional support{'\n'}
          • Peer-to-peer connection (Buddy Finder){'\n'}
          • Access to professional support resources{'\n'}
          • WebRTC-based voice calls{'\n'}
          • Educational resources and information
        </Text>

        <Text style={styles.sectionTitle}>3. Important Disclaimers</Text>
        
        <Text style={styles.subTitle}>Not a Medical Service</Text>
        <Text style={styles.paragraph}>
          Radio Check is NOT a medical, psychiatric, or therapeutic service. Our AI 
          companions are artificial intelligence programs designed to provide supportive 
          conversation, NOT professional mental health care. They cannot diagnose 
          conditions, prescribe treatments, or provide therapy.
        </Text>

        <Text style={styles.subTitle}>Not Emergency Services</Text>
        <Text style={styles.paragraph}>
          Radio Check is NOT an emergency service. If you are in immediate danger or 
          experiencing a medical emergency, call 999 immediately. For crisis support, 
          contact Samaritans (116 123) or Combat Stress (0800 138 1619).
        </Text>

        <Text style={styles.subTitle}>AI Limitations</Text>
        <Text style={styles.paragraph}>
          Our AI companions may occasionally provide inaccurate information or 
          inappropriate responses. While we strive to make them helpful and safe, 
          they have limitations. Always verify important information with official sources.
        </Text>

        <Text style={styles.sectionTitle}>4. User Eligibility</Text>
        <Text style={styles.paragraph}>
          You must be:{'\n\n'}
          • At least 18 years old{'\n'}
          • A UK resident or veteran connected to UK services{'\n'}
          • Capable of entering into a legally binding agreement{'\n\n'}
          The App is primarily intended for UK Armed Forces veterans and their families.
        </Text>

        <Text style={styles.sectionTitle}>5. User Conduct</Text>
        <Text style={styles.paragraph}>
          You agree NOT to:{'\n\n'}
          • Use the App for any unlawful purpose{'\n'}
          • Harass, abuse, or threaten other users{'\n'}
          • Share false information about yourself{'\n'}
          • Attempt to manipulate or exploit AI systems{'\n'}
          • Interfere with the App's security or operation{'\n'}
          • Use automated systems to access the App{'\n'}
          • Share content that is illegal, harmful, or offensive
        </Text>

        <Text style={styles.sectionTitle}>6. Safeguarding</Text>
        <Text style={styles.paragraph}>
          Our commitment to your safety means we may:{'\n\n'}
          • Monitor conversations for signs of crisis{'\n'}
          • Alert our safeguarding team if concerned{'\n'}
          • Contact you if we believe you need support{'\n'}
          • In extreme cases, contact emergency services{'\n\n'}
          By using the App, you consent to these safeguarding measures. This is not 
          optional as it protects vulnerable users.
        </Text>

        <Text style={styles.sectionTitle}>7. Account Security</Text>
        <Text style={styles.paragraph}>
          You are responsible for:{'\n\n'}
          • Maintaining the confidentiality of your account{'\n'}
          • All activities under your account{'\n'}
          • Notifying us of any unauthorized access{'\n\n'}
          We recommend using a strong, unique password.
        </Text>

        <Text style={styles.sectionTitle}>8. Intellectual Property</Text>
        <Text style={styles.paragraph}>
          All content, features, and functionality of Radio Check are owned by us and 
          are protected by copyright, trademark, and other intellectual property laws. 
          You may not copy, modify, distribute, or create derivative works without our 
          written permission.
        </Text>

        <Text style={styles.sectionTitle}>9. Limitation of Liability</Text>
        <Text style={styles.paragraph}>
          To the maximum extent permitted by law, Radio Check and its operators shall 
          not be liable for:{'\n\n'}
          • Any indirect, incidental, or consequential damages{'\n'}
          • Loss of data or service interruptions{'\n'}
          • Actions of other users or AI systems{'\n'}
          • Any reliance on information provided through the App{'\n\n'}
          Our total liability shall not exceed £100.
        </Text>

        <Text style={styles.sectionTitle}>10. Service Availability</Text>
        <Text style={styles.paragraph}>
          We strive to maintain App availability but do not guarantee uninterrupted 
          service. We may modify, suspend, or discontinue any part of the service at 
          any time without notice.
        </Text>

        <Text style={styles.sectionTitle}>11. Termination</Text>
        <Text style={styles.paragraph}>
          We may terminate or suspend your account at our discretion if we believe 
          you have violated these terms. You may delete your account at any time 
          through the App settings.
        </Text>

        <Text style={styles.sectionTitle}>12. Changes to Terms</Text>
        <Text style={styles.paragraph}>
          We may update these Terms of Service from time to time. We will notify you 
          of significant changes. Continued use of the App after changes constitutes 
          acceptance of the new terms.
        </Text>

        <Text style={styles.sectionTitle}>13. Governing Law</Text>
        <Text style={styles.paragraph}>
          These terms are governed by the laws of England and Wales. Any disputes 
          will be subject to the exclusive jurisdiction of the courts of England 
          and Wales.
        </Text>

        <Text style={styles.sectionTitle}>14. Contact</Text>
        <Text style={styles.paragraph}>
          For questions about these terms:{'\n\n'}
          Email: support@radiocheck.me{'\n'}
          Privacy concerns: privacy@radiocheck.me
        </Text>

        <View style={styles.footer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  lastUpdated: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 24,
    marginBottom: 12,
  },
  subTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginTop: 12,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
  },
  footer: {
    height: 40,
  },
});
