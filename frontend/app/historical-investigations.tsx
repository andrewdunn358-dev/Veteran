import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar, Linking, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const SENTRY_AVATAR = 'https://static.prod-images.emergentagent.com/jobs/26fef91b-7832-48ee-9b54-6cd204a344d5/images/f2058ae7a5d15ff3f002514d4ada7039eeddf405b897ae4fc1f0a68a1114e1d8.png';

export default function HistoricalInvestigations() {
  const router = useRouter();

  const supportServices = [
    {
      name: 'Combat Stress',
      description: 'Specialist support for veterans dealing with investigation-related stress and anxiety',
      phone: '01912704378',
      icon: 'shield' as const,
    },
    {
      name: 'Veterans UK Welfare Service',
      description: 'Confidential welfare support and guidance for veterans facing investigations',
      phone: '01912704378',
      icon: 'information-circle' as const,
    },
    {
      name: 'SSAFA',
      description: 'Practical and emotional support for veterans and families during difficult times',
      phone: '01912704378',
      icon: 'heart' as const,
    },
  ];

  const handleCall = (number: string) => {
    Linking.openURL(`tel:${number}`);
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
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Warfare on Lawfare</Text>
          </View>
        </View>

        {/* Emergency Banner - Display only, no call functionality */}
        <View style={styles.emergencyBannerContainer}>
          <View style={styles.emergencyBanner}>
            <Ionicons name="warning" size={24} color="#ffffff" />
            <Text style={styles.emergencyText}>At risk? Dial 999</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.crisisButton}
            onPress={() => router.push('/crisis-support')}
            activeOpacity={0.8}
          >
            <Text style={styles.crisisButtonText}>I NEED HELP NOW</Text>
          </TouchableOpacity>
        </View>

        {/* Sentry AI Chat Card - Featured at top */}
        <TouchableOpacity 
          style={styles.sentryCard}
          onPress={() => router.push('/sentry-chat')}
          activeOpacity={0.9}
        >
          <View style={styles.sentryHeader}>
            <Image source={{ uri: SENTRY_AVATAR }} style={styles.sentryAvatar} />
            <View style={styles.sentryTextContainer}>
              <Text style={styles.sentryTitle}>Talk to Sentry</Text>
              <Text style={styles.sentrySubtitle}>AI Legal Support Companion</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#64748b" />
          </View>
          <Text style={styles.sentryDescription}>
            Confidential AI support for veterans facing historical investigations. 
            Get information, emotional support, and guidance 24/7.
          </Text>
        </TouchableOpacity>

        {/* Understanding Section */}
        <View style={styles.understandingSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="heart" size={24} color="#7c9cbf" />
            <Text style={styles.sectionTitle}>We understand</Text>
          </View>
          <Text style={styles.bodyText}>
            Being part of a historical investigation - whether related to Northern Ireland, Iraq, Afghanistan, or other legacy cases - can bring intense stress, anxiety, and emotional strain.
          </Text>
          <Text style={styles.bodyText}>
            You may be experiencing difficult emotions years after your service. This is a normal response to an abnormal situation. You deserve support.
          </Text>
          </Text>
        </View>

        {/* Important Notice */}
        <View style={styles.noticeBox}>
          <View style={styles.noticeHeader}>
            <Ionicons name="information-circle" size={20} color="#7c9cbf" />
            <Text style={styles.noticeTitle}>This section provides emotional support</Text>
          </View>
          <Text style={styles.noticeText}>
            We offer wellbeing and mental health support, not legal advice. For legal matters, please consult a qualified legal professional.
          </Text>
        </View>

        {/* Support Options Title */}
        <View style={styles.supportOptionsHeader}>
          <Text style={styles.supportOptionsTitle}>Support Options</Text>
          <Text style={styles.supportOptionsSubtitle}>Confidential support from those who understand</Text>
        </View>

        {/* Talk to Counsellor */}
        <TouchableOpacity 
          style={styles.actionCard}
          onPress={() => router.push('/crisis-support')}
          activeOpacity={0.8}
        >
          <View style={styles.actionCardHeader}>
            <Ionicons name="chatbubbles" size={32} color="#7c9cbf" />
            <View style={styles.actionCardContent}>
              <Text style={styles.actionCardTitle}>Talk to a Counsellor</Text>
              <Text style={styles.actionCardDescription}>
                Speak with professionals who understand service-related investigations
              </Text>
            </View>
          </View>
          <View style={styles.actionCardFooter}>
            <Text style={styles.actionCardLink}>View available counsellors</Text>
            <Ionicons name="arrow-forward" size={20} color="#7c9cbf" />
          </View>
        </TouchableOpacity>

        {/* Peer Support */}
        <TouchableOpacity 
          style={styles.actionCard}
          onPress={() => router.push('/peer-support')}
          activeOpacity={0.8}
        >
          <View style={styles.actionCardHeader}>
            <Ionicons name="people" size={32} color="#7c9cbf" />
            <View style={styles.actionCardContent}>
              <Text style={styles.actionCardTitle}>Speak to Veteran Peer Support</Text>
              <Text style={styles.actionCardDescription}>
                Connect with fellow veterans who can offer understanding and support
              </Text>
            </View>
          </View>
          <View style={styles.actionCardFooter}>
            <Text style={styles.actionCardLink}>Find peer supporters</Text>
            <Ionicons name="arrow-forward" size={20} color="#7c9cbf" />
          </View>
        </TouchableOpacity>

        {/* Support Organizations */}
        <View style={styles.organisationsSection}>
          <Text style={styles.organisationsTitle}>Veteran Welfare Organisations</Text>
          
          {supportServices.map((service, index) => (
            <View key={index} style={styles.serviceCard}>
              <View style={styles.serviceHeader}>
                <Ionicons name={service.icon} size={24} color="#7c9cbf" />
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceName}>{service.name}</Text>
                </View>
              </View>
              <Text style={styles.serviceDescription}>{service.description}</Text>
              <TouchableOpacity
                style={styles.callButton}
                onPress={() => handleCall(service.phone)}
                activeOpacity={0.8}
              >
                <Ionicons name="call" size={20} color="#ffffff" />
                <Text style={styles.callButtonText}>Call Now</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Reassurance */}
        <View style={styles.reassuranceBox}>
          <Ionicons name="shield-checkmark" size={24} color="#7c9cbf" />
          <View style={styles.reassuranceContent}>
            <Text style={styles.reassuranceTitle}>Non-judgemental support</Text>
            <Text style={styles.reassuranceText}>
              All support services listed here provide confidential, non-judgemental help. We make no assumptions and offer support regardless of circumstances.
            </Text>
          </View>
        </View>

        {/* Bottom Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            If you feel at immediate risk of harming yourself or others, call 999 or use the 'I NEED HELP NOW' button at the top of this page.
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
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    lineHeight: 28,
  },
  emergencyBannerContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  emergencyBanner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#cc0000',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  emergencyText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  crisisButton: {
    flex: 1,
    backgroundColor: '#cc0000',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  crisisButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  understandingSection: {
    backgroundColor: '#2d3748',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
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
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  bodyText: {
    fontSize: 15,
    color: '#b0c4de',
    lineHeight: 22,
    marginBottom: 12,
  },
  noticeBox: {
    backgroundColor: '#2d4a3e',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#4a7c64',
  },
  noticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  noticeTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#a8e6cf',
  },
  noticeText: {
    fontSize: 14,
    color: '#c8f0dc',
    lineHeight: 20,
  },
  supportOptionsHeader: {
    marginBottom: 16,
  },
  supportOptionsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  supportOptionsSubtitle: {
    fontSize: 14,
    color: '#b0c4de',
  },
  actionCard: {
    backgroundColor: '#2d3748',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#4a5568',
  },
  actionCardHeader: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 16,
  },
  actionCardContent: {
    flex: 1,
  },
  actionCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 6,
  },
  actionCardDescription: {
    fontSize: 14,
    color: '#b0c4de',
    lineHeight: 20,
  },
  actionCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionCardLink: {
    fontSize: 15,
    color: '#7c9cbf',
    fontWeight: '600',
  },
  organisationsSection: {
    marginTop: 8,
    marginBottom: 24,
  },
  organisationsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16,
  },
  serviceCard: {
    backgroundColor: '#2d3748',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#4a5568',
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#ffffff',
  },
  serviceDescription: {
    fontSize: 14,
    color: '#b0c4de',
    lineHeight: 20,
    marginBottom: 12,
  },
  callButton: {
    flexDirection: 'row',
    backgroundColor: '#4a90e2',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  callButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
  reassuranceBox: {
    flexDirection: 'row',
    backgroundColor: '#2d3748',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    gap: 16,
    borderWidth: 1,
    borderColor: '#4a5568',
  },
  reassuranceContent: {
    flex: 1,
  },
  reassuranceTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  reassuranceText: {
    fontSize: 14,
    color: '#b0c4de',
    lineHeight: 20,
  },
  disclaimer: {
    backgroundColor: '#2d3748',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#4a5568',
  },
  disclaimerText: {
    fontSize: 12,
    color: '#b0c4de',
    textAlign: 'center',
    lineHeight: 18,
  },
});