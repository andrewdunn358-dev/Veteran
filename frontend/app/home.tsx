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

const NEW_LOGO_URL = 'https://static.prod-images.emergentagent.com/jobs/e42bf70a-a287-4141-b70d-0728db3b1a3c/images/0fe9b1e8f60d074b7e74cd775ba2b0cb846fca873835ce51497e447e2ffead4b.png';

export default function Index() {
  const router = useRouter();
  const { colors, theme } = useTheme();
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showSelfCareTools, setShowSelfCareTools] = useState(false);
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

        {/* Header with new logo */}
        <View style={styles.header}>
          <View style={styles.logoWrapper}>
            <Image 
              source={{ uri: NEW_LOGO_URL }}
              style={styles.badgeImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.headerTitle}>Radio Check</Text>
          <Text style={styles.taglineEnglish}>"Radio Check" fuses real-time peer support with smart AI insight, creating more than just an app — it's a digital hand on your shoulder when it matters most.</Text>
        </View>

        {/* Need to Talk Section - Main CTA with Tommy/Doris inside */}
        <View style={styles.needToTalkSection}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => router.push('/crisis-support')}
            activeOpacity={0.9}
          >
            <Ionicons name="heart" size={48} color="#ffffff" />
            <Text style={styles.primaryButtonText}>Need to Talk?</Text>
            <Text style={styles.primaryButtonSubtext}>Connect with support now</Text>
          </TouchableOpacity>

          {/* Tommy & Doris inside Need to Talk */}
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

          <Text style={styles.emergencyNote}>
            In immediate danger? Call 999
          </Text>
        </View>

        {/* Talk to a Veteran Section */}
        <Text style={styles.sectionTitle}>Talk to a Veteran</Text>
        <View style={styles.veteranCardsRow}>
          <TouchableOpacity 
            style={styles.veteranCard}
            onPress={() => router.push('/peer-support')}
            activeOpacity={0.8}
          >
            <Ionicons name="people" size={28} color="#3b82f6" />
            <Text style={styles.veteranCardTitle}>Peer Support</Text>
            <Text style={styles.veteranCardSubtext}>Connect with trained peers</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.veteranCard}
            onPress={() => router.push('/bob-chat')}
            activeOpacity={0.8}
            data-testid="bob-chat-btn"
          >
            <View style={styles.bobAvatarContainer}>
              <Ionicons name="person" size={28} color="#22c55e" />
            </View>
            <Text style={styles.veteranCardTitle}>Chat with Bob</Text>
            <Text style={styles.veteranCardSubtext}>Ex-Para AI peer support</Text>
          </TouchableOpacity>
        </View>

        {/* Support Organisations Section */}
        <Text style={styles.sectionTitle}>Support Organisations</Text>
        <View style={styles.supportOrgsContainer}>
          <TouchableOpacity 
            style={styles.supportOrgCard}
            onPress={() => router.push('/organizations')}
            activeOpacity={0.8}
          >
            <View style={styles.supportOrgIcon}>
              <Ionicons name="list" size={24} color="#3b82f6" />
            </View>
            <View style={styles.supportOrgContent}>
              <Text style={styles.supportOrgTitle}>UK Veteran Services</Text>
              <Text style={styles.supportOrgDesc}>Directory of support organisations</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.supportOrgCard}
            onPress={() => router.push('/substance-support')}
            activeOpacity={0.8}
            data-testid="substance-support-btn"
          >
            <View style={[styles.supportOrgIcon, { backgroundColor: '#fef3c7' }]}>
              <Ionicons name="medkit" size={24} color="#f59e0b" />
            </View>
            <View style={styles.supportOrgContent}>
              <Text style={styles.supportOrgTitle}>Alcohol & Substance Support</Text>
              <Text style={styles.supportOrgDesc}>Helplines & self-help resources</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.supportOrgCard}
            onPress={() => router.push('/regimental-associations')}
            activeOpacity={0.8}
            data-testid="regimental-associations-btn"
          >
            <View style={[styles.supportOrgIcon, { backgroundColor: '#fef3c7' }]}>
              <Ionicons name="medal" size={24} color="#d97706" />
            </View>
            <View style={styles.supportOrgContent}>
              <Text style={styles.supportOrgTitle}>Regimental Associations</Text>
              <Text style={styles.supportOrgDesc}>Find your service family</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.supportOrgCard}
            onPress={() => router.push('/historical-investigations')}
            activeOpacity={0.8}
          >
            <View style={[styles.supportOrgIcon, { backgroundColor: '#e0e7ff' }]}>
              <Ionicons name="document-text" size={24} color="#6366f1" />
            </View>
            <View style={styles.supportOrgContent}>
              <Text style={styles.supportOrgTitle}>Warfare on Lawfare</Text>
              <Text style={styles.supportOrgDesc}>Support for veterans facing investigations</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.supportOrgCard, { borderColor: '#22c55e', borderWidth: 1 }]}
            onPress={() => router.push('/callback')}
            activeOpacity={0.8}
            data-testid="callback-request-btn"
          >
            <View style={[styles.supportOrgIcon, { backgroundColor: '#dcfce7' }]}>
              <Ionicons name="call" size={24} color="#22c55e" />
            </View>
            <View style={styles.supportOrgContent}>
              <Text style={styles.supportOrgTitle}>Request a Callback</Text>
              <Text style={styles.supportOrgDesc}>We'll call you back</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#22c55e" />
          </TouchableOpacity>
        </View>

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

        {/* Self-Care Tools Section - Collapsible */}
        <TouchableOpacity 
          style={styles.sectionTitleRow}
          onPress={() => setShowSelfCareTools(!showSelfCareTools)}
          activeOpacity={0.7}
        >
          <Text style={styles.sectionTitle}>Self-Care Tools</Text>
          <Ionicons 
            name={showSelfCareTools ? "chevron-up" : "chevron-down"} 
            size={24} 
            color={colors.textSecondary} 
          />
        </TouchableOpacity>

        {showSelfCareTools && (
          <View style={styles.selfCareToolsContainer}>
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

              <View style={styles.toolButton} />
              <View style={styles.toolButton} />
            </View>
          </View>
        )}

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
                  style={[styles.modalAvatar, { marginLeft: -15 }]}
                />
              </View>
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => setShowAboutModal(false)}
              >
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.modalText}>{ABOUT_TOMMY_DORIS}</Text>
            </ScrollView>
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={() => {
                setShowAboutModal(false);
                router.push('/ai-buddies');
              }}
            >
              <Text style={styles.modalButtonText}>Start Chatting</Text>
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
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  settingsIcon: {
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 10,
    padding: 8,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
  },
  logoWrapper: {
    width: 100,
    height: 100,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  badgeImage: {
    width: 100,
    height: 100,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  taglineEnglish: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  needToTalkSection: {
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 16,
    paddingVertical: 24,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    marginTop: 8,
  },
  primaryButtonSubtext: {
    fontSize: 14,
    color: '#bfdbfe',
    marginTop: 4,
  },
  aiBuddiesCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  aiBuddiesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiBuddiesAvatars: {
    flexDirection: 'row',
    marginRight: 12,
  },
  aiBuddyAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: colors.background,
  },
  aiBuddyAvatarOverlap: {
    marginLeft: -12,
  },
  aiBuddiesTextContainer: {
    flex: 1,
  },
  aiBuddiesTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  aiBuddiesSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  aboutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 6,
  },
  aboutButtonText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
  emergencyNote: {
    textAlign: 'center',
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 12,
    paddingRight: 4,
  },
  veteranCardsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  veteranCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  bobAvatarContainer: {
    marginBottom: 0,
  },
  veteranCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginTop: 8,
    textAlign: 'center',
  },
  veteranCardSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  supportOrgsContainer: {
    gap: 8,
    marginBottom: 16,
  },
  supportOrgCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  supportOrgIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  supportOrgContent: {
    flex: 1,
  },
  supportOrgTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  supportOrgDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  familyFriendsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  familyFriendsIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#ede9fe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  familyFriendsContent: {
    flex: 1,
  },
  familyFriendsTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  familyFriendsDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  selfCareToolsContainer: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  toolsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  toolButton: {
    alignItems: 'center',
    width: '30%',
  },
  toolIconBg: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  toolEmoji: {
    fontSize: 24,
  },
  toolText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  disclaimer: {
    marginTop: 8,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  disclaimerText: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  staffLogin: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  staffLoginText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalAvatars: {
    flexDirection: 'row',
  },
  modalAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: colors.background,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalScroll: {
    maxHeight: 300,
  },
  modalText: {
    fontSize: 15,
    lineHeight: 24,
    color: colors.text,
  },
  modalButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
