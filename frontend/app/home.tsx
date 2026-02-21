import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar, Image, Modal, LayoutAnimation, Platform, UIManager } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../src/context/ThemeContext';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const NEW_LOGO_URL = 'https://customer-assets.emergentagent.com/job_wellness-vibes/artifacts/um22zx0o_Gemini_Generated_Image_u4tpnxu4tpnxu4tp.png';

// AI Team Avatars
const AI_TEAM = [
  {
    name: 'Tommy',
    avatar: 'https://customer-assets.emergentagent.com/job_47488e3d-c9ce-4f22-ba89-b000b32c4954/artifacts/slx9i8gj_image.png',
    description: 'Your battle buddy',
    route: '/ai-chat?character=tommy',
  },
  {
    name: 'Doris',
    avatar: 'https://customer-assets.emergentagent.com/job_47488e3d-c9ce-4f22-ba89-b000b32c4954/artifacts/1cxzxfrj_image.png',
    description: 'Warm support',
    route: '/ai-chat?character=doris',
  },
  {
    name: 'Bob',
    avatar: 'https://static.prod-images.emergentagent.com/jobs/e42bf70a-a287-4141-b70d-0728db3b1a3c/images/5ccb4f3dba33762dc691a5023cd5a26342d43ef9a7e95308f48f38301df65f8c.png',
    description: 'Ex-Para peer support',
    route: '/bob-chat',
  },
  {
    name: 'Finch',
    avatar: 'https://static.prod-images.emergentagent.com/jobs/26fef91b-7832-48ee-9b54-6cd204a344d5/images/f2058ae7a5d15ff3f002514d4ada7039eeddf405b897ae4fc1f0a68a1114e1d8.png',
    description: 'Legal info support',
    route: '/sentry-chat',
  },
];

export default function Index() {
  const router = useRouter();
  const { colors, theme } = useTheme();
  const styles = createStyles(colors);
  const [showAITeam, setShowAITeam] = useState(false);

  const toggleAITeam = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowAITeam(!showAITeam);
  };

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

        {/* Header with logo */}
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

        {/* Main Menu Cards */}
        <View style={styles.menuContainer}>
          {/* Need to Talk - Primary CTA */}
          <TouchableOpacity 
            style={styles.primaryCard}
            onPress={() => router.push('/crisis-support')}
            activeOpacity={0.9}
            data-testid="need-to-talk-btn"
          >
            <View style={styles.cardIconContainer}>
              <Ionicons name="heart" size={32} color="#3b82f6" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Need to Talk?</Text>
              <Text style={styles.cardDescription}>Connect with support now</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#3b82f6" />
          </TouchableOpacity>

          {/* Talk to a Veteran */}
          <TouchableOpacity 
            style={styles.menuCard}
            onPress={() => router.push('/peer-support')}
            activeOpacity={0.9}
            data-testid="talk-to-veteran-btn"
          >
            <View style={[styles.cardIconContainer, { backgroundColor: '#dcfce7' }]}>
              <Ionicons name="people" size={28} color="#22c55e" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Talk to a Veteran</Text>
              <Text style={styles.cardDescription}>Peer support from those who understand</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
          </TouchableOpacity>

          {/* Warfare on Lawfare */}
          <TouchableOpacity 
            style={styles.menuCard}
            onPress={() => router.push('/historical-investigations')}
            activeOpacity={0.9}
            data-testid="warfare-lawfare-btn"
          >
            <View style={[styles.cardIconContainer, { backgroundColor: '#e0e7ff' }]}>
              <Ionicons name="shield" size={28} color="#6366f1" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Warfare on Lawfare</Text>
              <Text style={styles.cardDescription}>Support for historical investigations</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
          </TouchableOpacity>

          {/* Support Organisations */}
          <TouchableOpacity 
            style={styles.menuCard}
            onPress={() => router.push('/organizations')}
            activeOpacity={0.9}
            data-testid="support-orgs-btn"
          >
            <View style={[styles.cardIconContainer, { backgroundColor: '#fef3c7' }]}>
              <Ionicons name="list" size={28} color="#f59e0b" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Support Organisations</Text>
              <Text style={styles.cardDescription}>Directory of veteran services</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
          </TouchableOpacity>

          {/* Request a Callback */}
          <TouchableOpacity 
            style={[styles.menuCard, styles.callbackCard]}
            onPress={() => router.push('/callback')}
            activeOpacity={0.9}
            data-testid="callback-btn"
          >
            <View style={[styles.cardIconContainer, { backgroundColor: '#dcfce7' }]}>
              <Ionicons name="call" size={28} color="#22c55e" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Request a Callback</Text>
              <Text style={styles.cardDescription}>We'll call you back</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#22c55e" />
          </TouchableOpacity>

          {/* Self-Care Tools */}
          <TouchableOpacity 
            style={styles.menuCard}
            onPress={() => router.push('/self-care')}
            activeOpacity={0.9}
            data-testid="self-care-btn"
          >
            <View style={[styles.cardIconContainer, { backgroundColor: '#fce7f3' }]}>
              <Ionicons name="fitness" size={28} color="#ec4899" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Self-Care Tools</Text>
              <Text style={styles.cardDescription}>Journal, grounding, breathing & more</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
          </TouchableOpacity>

          {/* Friends & Family */}
          <TouchableOpacity 
            style={styles.menuCard}
            onPress={() => router.push('/family-friends')}
            activeOpacity={0.9}
            data-testid="family-friends-btn"
          >
            <View style={[styles.cardIconContainer, { backgroundColor: '#ede9fe' }]}>
              <Ionicons name="heart-circle" size={28} color="#7c3aed" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Friends & Family</Text>
              <Text style={styles.cardDescription}>Worried about a veteran?</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Meet the AI Team Section */}
        <View style={styles.aiTeamSection}>
          <TouchableOpacity 
            style={styles.aiTeamHeader}
            onPress={toggleAITeam}
            activeOpacity={0.8}
          >
            <View>
              <Text style={styles.aiTeamTitle}>Meet the AI Team</Text>
              <Text style={styles.aiTeamSubtitle}>Available 24/7 to chat</Text>
            </View>
            <View style={styles.aiTeamToggle}>
              <Text style={styles.aiTeamToggleText}>{showAITeam ? 'Hide' : 'Show'}</Text>
              <Ionicons 
                name={showAITeam ? 'chevron-up' : 'chevron-down'} 
                size={20} 
                color={colors.primary} 
              />
            </View>
          </TouchableOpacity>
          
          {showAITeam && (
            <View style={styles.aiTeamGrid}>
              {AI_TEAM.map((member) => (
                <TouchableOpacity 
                  key={member.name}
                  style={styles.aiTeamMember}
                  onPress={() => router.push(member.route as any)}
                  activeOpacity={0.8}
                >
                  <Image source={{ uri: member.avatar }} style={styles.aiTeamAvatar} />
                  <Text style={styles.aiTeamName}>{member.name}</Text>
                  <Text style={styles.aiTeamDesc}>{member.description}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
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
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  badgeImage: {
    width: 80,
    height: 80,
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
  menuContainer: {
    gap: 12,
    marginBottom: 32,
  },
  primaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    borderRadius: 16,
    padding: 18,
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  callbackCard: {
    borderColor: '#22c55e',
    borderWidth: 2,
  },
  cardIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  cardDescription: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  aiTeamSection: {
    marginBottom: 24,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  aiTeamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  aiTeamTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  aiTeamSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  aiTeamToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    gap: 4,
  },
  aiTeamToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  aiTeamGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 16,
  },
  aiTeamMember: {
    width: '47%',
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  aiTeamAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 10,
  },
  aiTeamName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  aiTeamDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
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
});
