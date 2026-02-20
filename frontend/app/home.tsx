import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar, Linking, Platform, Image, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../src/context/ThemeContext';

const ABOUT_TOMMY_DORIS = `Meet Tommy & Doris – Your AI Battle Buddies

Tommy and Doris are dedicated AI companions built to support UK veterans and serving personnel—whenever and wherever they need it most.

Designed with an understanding of military culture, transition challenges, and the weight many carry long after service, they exist for one simple reason: no veteran should feel alone.

Whether it's a late-night "radio check," signposting to trusted support, or simply a steady presence in difficult moments, Tommy and Doris provide immediate, confidential connection—bridging the gap between struggle and support.

They don't replace human contact.
They help you reach it.

Because service doesn't end when the uniform comes off—and neither should support.`;

export default function Index() {
  const router = useRouter();
  const { colors, theme } = useTheme();
  const [showAboutModal, setShowAboutModal] = useState(false);
  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Settings Icon */}
        <TouchableOpacity 
          style={styles.settingsIcon}
          onPress={() => router.push('/settings')}
          activeOpacity={0.7}
        >
          <Ionicons name="settings-outline" size={24} color={colors.textSecondary} />
        </TouchableOpacity>

        {/* Header with badge */}
        <View style={styles.header}>
          <View style={[styles.logoWrapper, { backgroundColor: theme === 'dark' ? colors.surface : 'transparent' }]}>
            <Image 
              source={{ uri: 'https://customer-assets.emergentagent.com/job_22c2fac2-c7ea-4255-b9fb-379a93a49652/artifacts/vcqj3xma_logo.png' }}
              style={styles.badgeImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.headerTitle}>Radio Check</Text>
          <Text style={styles.taglineEnglish}>Once in service, forever united</Text>
          <Text style={styles.taglineLatin}>Semel Servientes, Semper Uniti</Text>
        </View>

        {/* AI Battle Buddies - Featured at Top */}
        <View style={styles.aiBuddiesSection}>
          <TouchableOpacity 
            style={styles.aiBuddiesCard}
            onPress={() => router.push('/ai-buddies')}
            activeOpacity={0.9}
            data-testid="ai-buddies-main-btn"
          >
            <View style={styles.aiBuddiesHeader}>
              <View style={styles.aiBuddiesAvatars}>
                <Image 
                  source={{ uri: 'https://customer-assets.emergentagent.com/job_47488e3d-c9ce-4f22-ba89-b000b32c4954/artifacts/slx9i8gj_image.png' }}
                  style={styles.aiBuddyAvatar}
                />
                <Image 
                  source={{ uri: 'https://customer-assets.emergentagent.com/job_47488e3d-c9ce-4f22-ba89-b000b32c4954/artifacts/1cxzxfrj_image.png' }}
                  style={[styles.aiBuddyAvatar, styles.aiBuddyAvatarOverlap]}
                />
              </View>
              <View style={styles.aiBuddiesTextContainer}>
                <Text style={styles.aiBuddiesTitle}>We're on stag 24/7</Text>
                <Text style={styles.aiBuddiesSubtitle}>Chat with Tommy or Doris</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#64748b" />
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.aboutButton}
            onPress={() => setShowAboutModal(true)}
            activeOpacity={0.7}
            data-testid="ai-buddies-about-btn"
          >
            <Ionicons name="information-circle-outline" size={18} color="#3b82f6" />
            <Text style={styles.aboutButtonText}>About Tommy & Doris</Text>
          </TouchableOpacity>
        </View>

        {/* Main Actions */}
        <View style={styles.mainActions}>
          {/* Primary Help Button - Softer approach */}
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => router.push('/crisis-support')}
            activeOpacity={0.9}
          >
            <Ionicons name="heart" size={48} color="#ffffff" />
            <Text style={styles.primaryButtonText}>Need to Talk?</Text>
            <Text style={styles.primaryButtonSubtext}>Connect with support now</Text>
          </TouchableOpacity>

          {/* Emergency info - subtle text only */}
          <Text style={styles.emergencyNote}>
            In immediate danger? Call 999
          </Text>

          {/* Secondary Actions */}
          <View style={styles.secondaryActions}>
            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={() => router.push('/peer-support')}
              activeOpacity={0.8}
            >
              <Ionicons name="people" size={32} color={colors.textSecondary} />
              <Text style={styles.secondaryButtonText}>Talk to Another Veteran</Text>
              <Text style={styles.secondaryButtonSubtext}>Peer support</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={() => router.push('/historical-investigations')}
              activeOpacity={0.8}
            >
              <Ionicons name="document-text" size={32} color={colors.textSecondary} />
              <Text style={styles.secondaryButtonText}>Warfare on Lawfare</Text>
              <Text style={styles.secondaryButtonSubtext}>Support for veterans facing investigations</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={() => router.push('/organizations')}
              activeOpacity={0.8}
            >
              <Ionicons name="list" size={32} color={colors.textSecondary} />
              <Text style={styles.secondaryButtonText}>Support Organisations</Text>
              <Text style={styles.secondaryButtonSubtext}>UK veteran services</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.secondaryButton, styles.callbackButton]}
              onPress={() => router.push('/callback')}
              activeOpacity={0.8}
              data-testid="callback-request-btn"
            >
              <Ionicons name="call" size={32} color="#22c55e" />
              <Text style={styles.secondaryButtonText}>Request a Callback</Text>
              <Text style={styles.secondaryButtonSubtext}>We'll call you back</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Substance Misuse Advice Section */}
        <TouchableOpacity 
          style={styles.substanceSupportCard}
          onPress={() => router.push('/substance-support')}
          activeOpacity={0.8}
          data-testid="substance-support-btn"
        >
          <View style={styles.substanceSupportIcon}>
            <Ionicons name="medkit" size={28} color="#f59e0b" />
          </View>
          <View style={styles.substanceSupportContent}>
            <Text style={styles.substanceSupportTitle}>Alcohol & Substance Support</Text>
            <Text style={styles.substanceSupportDesc}>Advice, helplines & self-help resources for veterans</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
        </TouchableOpacity>

        {/* Friends & Family Section */}
        <TouchableOpacity 
          style={styles.familyFriendsCard}
          onPress={() => router.push('/family-friends')}
          activeOpacity={0.8}
          data-testid="family-friends-btn"
        >
          <View style={styles.familyFriendsIcon}>
            <Ionicons name="people" size={28} color="#7c3aed" />
          </View>
          <View style={styles.familyFriendsContent}>
            <Text style={styles.familyFriendsTitle}>Friends & Family</Text>
            <Text style={styles.familyFriendsDesc}>Worried about a veteran? Find support and raise a concern</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
        </TouchableOpacity>

        {/* Self-Care Tools Section */}
        <Text style={styles.sectionTitle}>Self-Care Tools</Text>
        <View style={styles.toolsRow}>
          <TouchableOpacity 
            style={styles.toolButton}
            onPress={() => router.push('/mood')}
            activeOpacity={0.8}
          >
            <View style={[styles.toolIconBg, { backgroundColor: '#fef3c7' }]}>
              <Text style={styles.toolEmoji}>😊</Text>
            </View>
            <Text style={styles.toolText}>Daily{'\n'}Check-in</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.toolButton}
            onPress={() => router.push('/journal')}
            activeOpacity={0.8}
          >
            <View style={[styles.toolIconBg, { backgroundColor: '#dbeafe' }]}>
              <Ionicons name="book" size={24} color="#3b82f6" />
            </View>
            <Text style={styles.toolText}>My{'\n'}Journal</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.toolButton}
            onPress={() => router.push('/grounding')}
            activeOpacity={0.8}
            data-testid="grounding-tools-btn"
          >
            <View style={[styles.toolIconBg, { backgroundColor: '#e0e7ff' }]}>
              <Ionicons name="hand-left" size={24} color="#6366f1" />
            </View>
            <Text style={styles.toolText}>Grounding{'\n'}Tools</Text>
          </TouchableOpacity>
        </View>

        {/* Second row of tools */}
        <View style={styles.toolsRow}>
          <TouchableOpacity 
            style={styles.toolButton}
            onPress={() => router.push('/breathing-game')}
            activeOpacity={0.8}
            data-testid="breathing-game-btn"
          >
            <View style={[styles.toolIconBg, { backgroundColor: '#fce7f3' }]}>
              <Ionicons name="fitness" size={24} color="#ec4899" />
            </View>
            <Text style={styles.toolText}>Breathing{'\n'}Challenge</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.toolButton}
            onPress={() => router.push('/buddy-finder')}
            activeOpacity={0.8}
            data-testid="buddy-finder-btn"
          >
            <View style={[styles.toolIconBg, { backgroundColor: '#dbeafe' }]}>
              <Ionicons name="people" size={24} color="#3b82f6" />
            </View>
            <Text style={styles.toolText}>Buddy{'\n'}Finder</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.toolButton}
            onPress={() => router.push('/local-services')}
            activeOpacity={0.8}
            data-testid="local-services-btn"
          >
            <View style={[styles.toolIconBg, { backgroundColor: '#d1fae5' }]}>
              <Ionicons name="location" size={24} color="#10b981" />
            </View>
            <Text style={styles.toolText}>Find Local{'\n'}Support</Text>
          </TouchableOpacity>
        </View>

        {/* Third row of tools */}
        <View style={styles.toolsRow}>
          <TouchableOpacity 
            style={styles.toolButton}
            onPress={() => router.push('/resources')}
            activeOpacity={0.8}
          >
            <View style={[styles.toolIconBg, { backgroundColor: '#dcfce7' }]}>
              <Ionicons name="library" size={24} color="#22c55e" />
            </View>
            <Text style={styles.toolText}>Resources{'\n'}Library</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.toolButton}
            onPress={() => router.push('/regimental-associations')}
            activeOpacity={0.8}
            data-testid="regimental-associations-btn"
          >
            <View style={[styles.toolIconBg, { backgroundColor: '#fef3c7' }]}>
              <Ionicons name="medal" size={24} color="#d97706" />
            </View>
            <Text style={styles.toolText}>Regimental{'\n'}Associations</Text>
          </TouchableOpacity>

          <View style={styles.toolButton} />
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            This app is not an emergency service. For immediate danger, always call 999.
          </Text>
        </View>

        {/* Staff Login */}
        <TouchableOpacity 
          style={styles.staffLogin}
          onPress={() => router.push('/login')}
          activeOpacity={0.7}
        >
          <Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} />
          <Text style={styles.staffLoginText}>Staff Portal Login</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* About Tommy & Doris Modal */}
      <Modal
        visible={showAboutModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAboutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalAvatars}>
                <Image 
                  source={{ uri: 'https://customer-assets.emergentagent.com/job_47488e3d-c9ce-4f22-ba89-b000b32c4954/artifacts/slx9i8gj_image.png' }}
                  style={styles.modalAvatar}
                />
                <Image 
                  source={{ uri: 'https://customer-assets.emergentagent.com/job_47488e3d-c9ce-4f22-ba89-b000b32c4954/artifacts/1cxzxfrj_image.png' }}
                  style={[styles.modalAvatar, styles.modalAvatarOverlap]}
                />
              </View>
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => setShowAboutModal(false)}
              >
                <Ionicons name="close" size={24} color="#94a3b8" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>Meet Tommy & Doris</Text>
              <Text style={styles.modalSubtitle}>We're on stag 24/7</Text>
              <Text style={styles.modalText}>{ABOUT_TOMMY_DORIS}</Text>
            </ScrollView>
            <TouchableOpacity 
              style={styles.modalChatButton}
              onPress={() => {
                setShowAboutModal(false);
                router.push('/ai-buddies');
              }}
            >
              <Text style={styles.modalChatButtonText}>Start a Conversation</Text>
              <Ionicons name="chatbubbles" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  settingsIcon: {
    position: 'absolute',
    right: 0,
    top: 0,
    padding: 8,
    zIndex: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 16,
  },
  badgeImage: {
    width: 120,
    height: 120,
  },
  logoWrapper: {
    borderRadius: 60,
    padding: 8,
    marginBottom: 16,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  taglineEnglish: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  taglineLatin: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  emergencyNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2d1f1f',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    borderWidth: 2,
    borderColor: '#ff4444',
  },
  emergencyTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ff6666',
    marginBottom: 4,
  },
  emergencyText: {
    fontSize: 14,
    color: '#ffcccc',
  },
  mainActions: {
    marginBottom: 32,
  },
  emergencyNote: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#2563eb',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  primaryButtonText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginTop: 12,
    textAlign: 'center',
  },
  primaryButtonSubtext: {
    fontSize: 14,
    color: '#ffcccc',
    marginTop: 8,
  },
  secondaryActions: {
    gap: 16,
  },
  secondaryButton: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 8,
    textAlign: 'center',
  },
  secondaryButtonSubtext: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  callbackButton: {
    borderColor: '#22c55e',
    borderWidth: 1,
  },
  aiBuddiesButton: {
    borderColor: '#3b82f6',
    borderWidth: 2,
    backgroundColor: '#1a2744',
  },
  aiBuddiesIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiBuddyMiniAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#1a2744',
  },
  aiBuddyMiniAvatarOverlap: {
    marginLeft: -12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  toolsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  toolButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  toolIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  toolEmoji: {
    fontSize: 24,
  },
  toolText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  disclaimer: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  disclaimerText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  staffLogin: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    paddingVertical: 12,
    gap: 8,
  },
  staffLoginText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  // AI Battle Buddies Featured Section
  aiBuddiesSection: {
    marginBottom: 24,
  },
  aiBuddiesCard: {
    backgroundColor: '#1a2744',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#3b82f6',
    ...Platform.select({
      ios: {
        shadowColor: '#3b82f6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  aiBuddiesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiBuddiesAvatars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiBuddyAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: '#1a2744',
  },
  aiBuddyAvatarOverlap: {
    marginLeft: -16,
  },
  aiBuddiesTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  aiBuddiesTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  aiBuddiesSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 2,
  },
  aboutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingVertical: 8,
    gap: 6,
  },
  aboutButtonText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
  // Substance Support Card
  substanceSupportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbeb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  substanceSupportIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#fef3c7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  substanceSupportContent: {
    flex: 1,
    marginLeft: 12,
  },
  substanceSupportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  substanceSupportDesc: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  // Friends & Family Card
  familyFriendsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#faf5ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e9d5ff',
  },
  familyFriendsIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#ede9fe',
    justifyContent: 'center',
    alignItems: 'center',
  },
  familyFriendsContent: {
    flex: 1,
    marginLeft: 12,
  },
  familyFriendsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  familyFriendsDesc: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1a2332',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalAvatars: {
    flexDirection: 'row',
  },
  modalAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: '#1a2332',
  },
  modalAvatarOverlap: {
    marginLeft: -20,
  },
  modalCloseButton: {
    padding: 8,
  },
  modalScroll: {
    maxHeight: 400,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#3b82f6',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalText: {
    fontSize: 15,
    color: '#b0c4de',
    lineHeight: 24,
    marginBottom: 20,
  },
  modalChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 10,
    marginTop: 16,
  },
  modalChatButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});