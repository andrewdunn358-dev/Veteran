import React from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  Linking,
  StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../src/context/ThemeContext';

const PRISON_RESOURCES = [
  { name: 'NACRO', desc: 'Support for people with criminal records', phone: '0300 123 1999', url: 'https://www.nacro.org.uk' },
  { name: 'Forces in Mind Trust', desc: 'Research on veterans in justice system', url: 'https://www.fim-trust.org' },
  { name: 'Walking With The Wounded', desc: 'Employment & justice support for the armed forces', url: 'https://walkingwiththewounded.org.uk' },
  { name: 'Project Nova', desc: 'Armed forces personnel in the criminal justice system', phone: '0800 917 7299', url: 'https://www.rfea.org.uk/our-programmes/project-nova/' },
  { name: 'Probation Services', desc: 'Support after prison release', phone: '0800 464 0708', url: 'https://www.gov.uk/guidance/probation-services' },
  { name: "Veterans' Gateway", desc: 'First point of contact for veterans', phone: '0808 802 1212', url: 'https://www.veteransgateway.org.uk' },
];

export default function CriminalJustice() {
  const router = useRouter();
  const { colors, theme } = useTheme();
  const isDark = theme === 'dark';
  const styles = createStyles(colors, isDark);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} data-testid="back-button">
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Criminal Justice Support</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Intro Card */}
        <View style={[styles.introCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <FontAwesome5 name="balance-scale" size={40} color="#4f46e5" />
          <Text style={[styles.introTitle, { color: colors.text }]}>Support for Veterans</Text>
          <Text style={[styles.introText, { color: colors.textSecondary }]}>
            Help for veterans in the criminal justice system or recently released from prison.
          </Text>
        </View>

        {/* Info Card */}
        <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <FontAwesome5 name="info-circle" size={18} color="#4f46e5" />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            Serving personnel and veterans can face unique challenges with the law, often linked to untreated PTSD, substance misuse, 
            or difficulty adjusting to civilian life. Specialist support is available.
          </Text>
        </View>

        {/* Resources */}
        {PRISON_RESOURCES.map((resource, index) => (
          <TouchableOpacity 
            key={index}
            style={[styles.resourceCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => resource.url && Linking.openURL(resource.url)}
          >
            <View style={styles.resourceContent}>
              <Text style={[styles.resourceName, { color: colors.text }]}>{resource.name}</Text>
              <Text style={[styles.resourceDesc, { color: colors.textSecondary }]}>{resource.desc}</Text>
              {resource.phone && (
                <TouchableOpacity 
                  style={styles.resourcePhone}
                  onPress={() => Linking.openURL(`tel:${resource.phone.replace(/\s/g, '')}`)}
                >
                  <FontAwesome5 name="phone-alt" size={14} color="#16a34a" />
                  <Text style={styles.resourcePhoneText}>{resource.phone}</Text>
                </TouchableOpacity>
              )}
            </View>
            <FontAwesome5 name="external-link-alt" size={14} color={colors.textSecondary} />
          </TouchableOpacity>
        ))}

        {/* Tip Card */}
        <View style={[styles.tipCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <FontAwesome5 name="lightbulb" size={20} color="#f59e0b" />
          <Text style={[styles.tipText, { color: colors.textSecondary }]}>
            <Text style={styles.tipBold}>Project Nova </Text>
            works specifically with veterans at every stage of the criminal justice system - from arrest to release.
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.background 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  introCard: {
    padding: 24,
    borderRadius: 16,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  introTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  introText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  infoCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'flex-start',
    gap: 12,
    borderWidth: 1,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  resourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  resourceContent: {
    flex: 1,
  },
  resourceName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  resourceDesc: {
    fontSize: 14,
    marginBottom: 8,
  },
  resourcePhone: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  resourcePhoneText: {
    fontSize: 14,
    color: '#16a34a',
    fontWeight: '600',
  },
  tipCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    alignItems: 'flex-start',
    gap: 12,
    borderWidth: 1,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  tipBold: {
    fontWeight: '600',
    color: '#f59e0b',
  },
});
