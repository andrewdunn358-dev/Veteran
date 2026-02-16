import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar, Linking, Platform, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../src/context/ThemeContext';

export default function Index() {
  const router = useRouter();
  const { colors, theme } = useTheme();
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
          <Image 
            source={require('../assets/images/veteran-badge.png')}
            style={styles.badgeImage}
            resizeMode="contain"
          />
          <Text style={styles.headerTitle}>Veterans Support</Text>
          <Text style={styles.taglineEnglish}>Once in service, forever united</Text>
          <Text style={styles.taglineLatin}>Semel Servientes, Semper Uniti</Text>
        </View>

        {/* Emergency Notice - Display only, no call functionality */}
        <View style={styles.emergencyNotice}>
          <Ionicons name="alert-circle" size={24} color="#ff4444" />
          <View style={styles.emergencyTextContainer}>
            <Text style={styles.emergencyTitle}>Immediate Danger?</Text>
            <Text style={styles.emergencyText}>Dial 999 for emergency services</Text>
          </View>
        </View>

        {/* Main Actions */}
        <View style={styles.mainActions}>
          {/* Primary Help Button */}
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => router.push('/crisis-support')}
            activeOpacity={0.9}
          >
            <Ionicons name="help-circle" size={48} color="#ffffff" />
            <Text style={styles.primaryButtonText}>I NEED HELP NOW</Text>
            <Text style={styles.primaryButtonSubtext}>24/7 Crisis Support</Text>
          </TouchableOpacity>

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
              <Text style={styles.secondaryButtonText}>Issues Related to Historical Investigations</Text>
              <Text style={styles.secondaryButtonSubtext}>Support for investigation-related stress</Text>
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
          </View>
        </View>

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
            onPress={() => router.push('/resources')}
            activeOpacity={0.8}
          >
            <View style={[styles.toolIconBg, { backgroundColor: '#dcfce7' }]}>
              <Ionicons name="library" size={24} color="#22c55e" />
            </View>
            <Text style={styles.toolText}>Resources</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.toolButton}
            onPress={() => router.push('/settings')}
            activeOpacity={0.8}
          >
            <View style={[styles.toolIconBg, { backgroundColor: '#f3e8ff' }]}>
              <Ionicons name="settings" size={24} color="#9333ea" />
            </View>
            <Text style={styles.toolText}>Settings</Text>
          </TouchableOpacity>
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
  primaryButton: {
    backgroundColor: '#cc0000',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#cc0000',
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  toolsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
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
});