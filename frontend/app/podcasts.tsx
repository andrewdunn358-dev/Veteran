import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar, Image, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../src/context/ThemeContext';

interface Podcast {
  id: string;
  name: string;
  host: string;
  description: string;
  focus: string[];
  image: string;
  spotifyUrl?: string;
  appleUrl?: string;
  youtubeUrl?: string;
  websiteUrl?: string;
}

const PODCASTS: Podcast[] = [
  {
    id: 'frankies-pod',
    name: "Frankie's Pod: Uncorking the Unforgettable",
    host: 'Frankie Dunn',
    description: 'Raw stories from British military veterans covering PTSD, resilience, and recovery after service.',
    focus: ['PTSD', 'Recovery', 'Veteran Stories'],
    image: 'https://i.scdn.co/image/ab6765630000ba8a7d4f9b8e3c2c6b4f5a8d9c1e',
    spotifyUrl: 'https://open.spotify.com/show/7wrcVZ8zdtX5urzIvZSaUJ',
    appleUrl: 'https://podcasts.apple.com/us/podcast/frankies-pod-uncorking-the-unforgettable/id1729850191',
    youtubeUrl: 'https://www.youtube.com/@FrankiesPod',
  },
  {
    id: 'tom-petch',
    name: 'Speed. Aggression. Surprise.',
    host: 'Tom Petch',
    description: 'Raw, candid conversations with military figures including SAS veterans and commanders.',
    focus: ['Military History', 'Leadership', 'Personal Stories'],
    image: 'https://i.scdn.co/image/ab6765630000ba8a2c3d4e5f6a7b8c9d0e1f2a3b',
    spotifyUrl: 'https://open.spotify.com/show/0nqV8qef8CmvjurAPtV0qj',
    appleUrl: 'https://podcasts.apple.com/us/podcast/speed-aggression-surprise-the-untold-truth-behind/id1846864165',
    websiteUrl: 'https://www.tompetch.com/podcasts',
  },
  {
    id: 'old-paratrooper',
    name: 'The Old Paratrooper Podcast',
    host: 'Chris Binch (ex-2 PARA)',
    description: 'Interviews with British Paras, SAS veterans, and special forces personnel on combat and mental health.',
    focus: ['Parachute Regiment', 'Special Forces', 'Combat Stories'],
    image: 'https://i.scdn.co/image/ab6765630000ba8a3b4c5d6e7f8a9b0c1d2e3f4a',
    spotifyUrl: 'https://open.spotify.com/show/4jm3x1EoBBcPqQUXTwD1xc',
    appleUrl: 'https://podcasts.apple.com/us/podcast/the-old-paratrooper-podcast/id1859991469',
    youtubeUrl: 'https://www.youtube.com/@TheOldParatrooperpodcast',
  },
  {
    id: 'beyond-barracks',
    name: 'Beyond the Barracks',
    host: 'RSL Victoria / Gina Allsop',
    description: 'Unfiltered stories from veterans covering transitions to civilian life, resilience, and recovery.',
    focus: ['Transition', 'Recovery', 'Family Support'],
    image: 'https://i.scdn.co/image/ab6765630000ba8a4c5d6e7f8a9b0c1d2e3f4a5b',
    spotifyUrl: 'https://open.spotify.com/show/4MwejGmTY5CdDT8zsRkUTQ',
    youtubeUrl: 'https://www.youtube.com/channel/UCh_L_4t746PldKRfIKvj-0w',
  },
  {
    id: 'combat-stress-100',
    name: 'Combat Stress 100 Podcast',
    host: 'Combat Stress Charity',
    description: 'Clinical expertise combined with veteran testimonies on PTSD, depression, and substance misuse.',
    focus: ['PTSD', 'Depression', 'Clinical Support'],
    image: 'https://i.scdn.co/image/ab6765630000ba8a5d6e7f8a9b0c1d2e3f4a5b6c',
    appleUrl: 'https://podcasts.apple.com/us/podcast/the-combat-stress-100-podcast/id1534726321',
    websiteUrl: 'https://combatstress.org.uk/combat-stress-100-podcast',
  },
  {
    id: 'military-veterans',
    name: 'Military Veterans Podcast',
    host: 'Gavin Watson (British Army)',
    description: 'Veterans share experiences from before, during, and after service. Includes dedicated PTSD episodes.',
    focus: ['Service Life', 'PTSD', 'Peer Support'],
    image: 'https://i.scdn.co/image/ab6765630000ba8a6e7f8a9b0c1d2e3f4a5b6c7d',
    appleUrl: 'https://podcasts.apple.com/gb/podcast/military-veterans-podcast/id1531710391',
  },
  {
    id: 'talking-wounded',
    name: 'Talking with the Wounded',
    host: 'Various',
    description: 'Frank, often humorous conversations with physically and mentally wounded veterans about recovery.',
    focus: ['Wounded Veterans', 'Recovery', 'PTSD Resolution'],
    image: 'https://i.scdn.co/image/ab6765630000ba8a7f8a9b0c1d2e3f4a5b6c7d8e',
    appleUrl: 'https://podcasts.apple.com/gb/podcast/talking-with-the-wounded/id1712320662',
  },
  {
    id: 'stray-voltage',
    name: 'Stray Voltage',
    host: 'Veterans',
    description: 'By veterans, for veterans. Covering British military transitions and mental health topics.',
    focus: ['Veteran to Veteran', 'Transitions', 'Mental Health'],
    image: 'https://i.scdn.co/image/ab6765630000ba8a8a9b0c1d2e3f4a5b6c7d8e9f',
    spotifyUrl: 'https://open.spotify.com/show/6gyPTRjSXBuD2ImEnWGseD',
  },
];

export default function PodcastsScreen() {
  const router = useRouter();
  const { colors, theme } = useTheme();
  const styles = createStyles(colors);

  const openLink = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      }
    } catch (error) {
      console.error('Error opening link:', error);
    }
  };

  const getPrimaryLink = (podcast: Podcast): string | undefined => {
    return podcast.spotifyUrl || podcast.appleUrl || podcast.youtubeUrl || podcast.websiteUrl;
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
          data-testid="back-button"
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Recommended Podcasts</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Intro Section */}
        <View style={styles.introSection}>
          <View style={styles.introIconContainer}>
            <Ionicons name="headset" size={32} color="#db2777" />
          </View>
          <Text style={styles.introTitle}>Listen & Learn</Text>
          <Text style={styles.introText}>
            Curated podcasts from veterans, for veterans. Real stories about service, 
            recovery, mental health, and life after the military.
          </Text>
        </View>

        {/* Podcasts List */}
        <View style={styles.podcastsList}>
          {PODCASTS.map((podcast) => (
            <TouchableOpacity
              key={podcast.id}
              style={styles.podcastCard}
              onPress={() => {
                const link = getPrimaryLink(podcast);
                if (link) openLink(link);
              }}
              activeOpacity={0.8}
              data-testid={`podcast-${podcast.id}`}
            >
              <View style={styles.podcastHeader}>
                <View style={styles.podcastIconContainer}>
                  <Ionicons name="mic" size={28} color="#db2777" />
                </View>
                <View style={styles.podcastInfo}>
                  <Text style={styles.podcastName}>{podcast.name}</Text>
                  <Text style={styles.podcastHost}>Hosted by {podcast.host}</Text>
                </View>
              </View>
              
              <Text style={styles.podcastDescription}>{podcast.description}</Text>
              
              {/* Focus Tags */}
              <View style={styles.tagsContainer}>
                {podcast.focus.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
              
              {/* Platform Links */}
              <View style={styles.platformsContainer}>
                {podcast.spotifyUrl && (
                  <TouchableOpacity
                    style={styles.platformButton}
                    onPress={() => openLink(podcast.spotifyUrl!)}
                    data-testid={`${podcast.id}-spotify`}
                  >
                    <Ionicons name="logo-spotify" size={20} color="#1DB954" />
                    <Text style={styles.platformText}>Spotify</Text>
                  </TouchableOpacity>
                )}
                {podcast.appleUrl && (
                  <TouchableOpacity
                    style={styles.platformButton}
                    onPress={() => openLink(podcast.appleUrl!)}
                    data-testid={`${podcast.id}-apple`}
                  >
                    <Ionicons name="logo-apple" size={20} color={colors.text} />
                    <Text style={styles.platformText}>Apple</Text>
                  </TouchableOpacity>
                )}
                {podcast.youtubeUrl && (
                  <TouchableOpacity
                    style={styles.platformButton}
                    onPress={() => openLink(podcast.youtubeUrl!)}
                    data-testid={`${podcast.id}-youtube`}
                  >
                    <Ionicons name="logo-youtube" size={20} color="#FF0000" />
                    <Text style={styles.platformText}>YouTube</Text>
                  </TouchableOpacity>
                )}
                {podcast.websiteUrl && !podcast.spotifyUrl && !podcast.appleUrl && (
                  <TouchableOpacity
                    style={styles.platformButton}
                    onPress={() => openLink(podcast.websiteUrl!)}
                    data-testid={`${podcast.id}-website`}
                  >
                    <Ionicons name="globe-outline" size={20} color={colors.primary} />
                    <Text style={styles.platformText}>Website</Text>
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Footer Note */}
        <View style={styles.footerNote}>
          <Ionicons name="information-circle-outline" size={20} color={colors.textSecondary} />
          <Text style={styles.footerText}>
            These podcasts are independently produced. Radio Check recommends them 
            as helpful resources but is not affiliated with their creators.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  headerSpacer: {
    width: 40,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  introSection: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 8,
  },
  introIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fce7f3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  introTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  introText: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  podcastsList: {
    gap: 16,
  },
  podcastCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  podcastHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  podcastIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#fce7f3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  podcastInfo: {
    flex: 1,
  },
  podcastName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  podcastHost: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  podcastDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    backgroundColor: colors.background,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  platformsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  platformButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  platformText: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '500',
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    gap: 12,
  },
  footerText: {
    flex: 1,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});
