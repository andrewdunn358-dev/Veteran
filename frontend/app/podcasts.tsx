import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar, Image, Linking, ActivityIndicator } from 'react-native';
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
  logo: string;
  rssUrl?: string;
  spotifyUrl?: string;
  appleUrl?: string;
  youtubeUrl?: string;
  websiteUrl?: string;
}

interface LatestEpisode {
  title: string;
  date: string;
  link?: string;
}

const PODCASTS: Podcast[] = [
  {
    id: 'frankies-pod',
    name: "Frankie's Pod: Uncorking the Unforgettable",
    host: 'Frankie Dunn',
    description: 'Raw stories from British military veterans covering PTSD, resilience, and recovery after service.',
    focus: ['PTSD', 'Recovery', 'Veteran Stories'],
    logo: 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts221/v4/65/0f/b5/650fb58e-36c5-4b08-6b3b-d5f31d94c96d/mza_10652230787498956498.jpg/600x600bb.jpg',
    rssUrl: 'https://feeds.acast.com/public/shows/6714f073e3d9082a5a2bf617',
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
    logo: 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts221/v4/f7/de/2f/f7de2f93-0421-3c7e-4e0b-f4d2d8c4e65c/mza_6927505427832815116.jpg/600x600bb.jpg',
    rssUrl: 'https://anchor.fm/s/10a795454/podcast/rss',
    spotifyUrl: 'https://open.spotify.com/show/0nqV8qef8CmvjurAPtV0qj',
    appleUrl: 'https://podcasts.apple.com/us/podcast/speed-aggression-surprise-the-untold-truth-behind/id1846864165',
    youtubeUrl: 'https://www.youtube.com/@speedaggressionsurprise',
    websiteUrl: 'https://www.tompetch.com/podcasts',
  },
  {
    id: 'old-paratrooper',
    name: 'The Old Paratrooper Podcast',
    host: 'Chris Binch (ex-2 PARA)',
    description: 'Interviews with British Paras, SAS veterans, and special forces personnel on combat and mental health.',
    focus: ['Parachute Regiment', 'Special Forces', 'Combat Stories'],
    logo: 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts221/v4/b7/d7/8e/b7d78e6f-5c5c-4e8c-9c4b-d7c3c9a8d5f4/mza_11458620986458746712.jpg/600x600bb.jpg',
    rssUrl: 'https://feeds.acast.com/public/shows/679a9f6b65f74095105c2af2',
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
    logo: 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts116/v4/41/a6/b7/41a6b7b5-5e3c-4d8a-9f2e-c4d6e8f9a1b3/mza_4627149836542893021.jpg/600x600bb.jpg',
    spotifyUrl: 'https://open.spotify.com/show/4MwejGmTY5CdDT8zsRkUTQ',
    youtubeUrl: 'https://www.youtube.com/channel/UCh_L_4t746PldKRfIKvj-0w',
  },
  {
    id: 'combat-stress-100',
    name: 'Combat Stress 100 Podcast',
    host: 'Combat Stress Charity',
    description: 'Clinical expertise combined with veteran testimonies on PTSD, depression, and substance misuse.',
    focus: ['PTSD', 'Depression', 'Clinical Support'],
    logo: 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts125/v4/a4/c3/27/a4c327d6-0b91-4f45-b8d6-8c9a5e7f2d1c/mza_5378906534268427952.jpg/600x600bb.jpg',
    rssUrl: 'https://feeds.acast.com/public/shows/62a8eda1-799d-4268-805c-6dd9ebd85c8e',
    appleUrl: 'https://podcasts.apple.com/us/podcast/the-combat-stress-100-podcast/id1534726321',
    websiteUrl: 'https://combatstress.org.uk/combat-stress-100-podcast',
  },
  {
    id: 'military-veterans',
    name: 'Military Veterans Podcast',
    host: 'Gavin Watson (British Army)',
    description: 'Veterans share experiences from before, during, and after service. Includes dedicated PTSD episodes.',
    focus: ['Service Life', 'PTSD', 'Peer Support'],
    logo: 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts115/v4/63/8d/4f/638d4f67-9e8a-4b5c-a1d3-e6f7b8c9d0e2/mza_8371602934567812345.jpg/600x600bb.jpg',
    appleUrl: 'https://podcasts.apple.com/gb/podcast/military-veterans-podcast/id1531710391',
    youtubeUrl: 'https://www.youtube.com/c/MilitaryVeteransPodcast',
    websiteUrl: 'https://milvetpodcast.com',
  },
  {
    id: 'talking-wounded',
    name: 'Talking with the Wounded',
    host: 'Ben',
    description: 'Frank, often humorous conversations with physically and mentally wounded veterans about recovery.',
    focus: ['Wounded Veterans', 'Recovery', 'PTSD Resolution'],
    logo: 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts116/v4/82/d5/f9/82d5f928-7c4a-4e9b-b3d1-a5c7e9f8b2d4/mza_2938471650382917463.jpg/600x600bb.jpg',
    rssUrl: 'https://talkingwiththewounded.podbean.com/feed.xml',
    appleUrl: 'https://podcasts.apple.com/gb/podcast/talking-with-the-wounded/id1712320662',
    spotifyUrl: 'https://open.spotify.com/show/3kP9jH6mN4vR8sT2wX5yZ1',
  },
  {
    id: 'stray-voltage',
    name: 'Stray Voltage',
    host: 'Veterans',
    description: 'By veterans, for veterans. Covering British military transitions and mental health topics.',
    focus: ['Veteran to Veteran', 'Transitions', 'Mental Health'],
    logo: 'https://i.scdn.co/image/ab6765630000ba8a8a9b0c1d2e3f4a5b6c7d8e9f',
    spotifyUrl: 'https://open.spotify.com/show/6gyPTRjSXBuD2ImEnWGseD',
    youtubeUrl: 'https://www.youtube.com/channel/UCz1sjXkh9mOI2UoovGMsQjw',
  },
];

// Backend URL for fetching latest episodes
const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'https://compliance-portal-23.preview.emergentagent.com';

export default function PodcastsScreen() {
  const router = useRouter();
  const { colors, theme } = useTheme();
  const styles = createStyles(colors);
  const [latestEpisodes, setLatestEpisodes] = useState<Record<string, LatestEpisode>>({});
  const [loadingEpisodes, setLoadingEpisodes] = useState(true);

  useEffect(() => {
    fetchLatestEpisodes();
  }, []);

  const fetchLatestEpisodes = async () => {
    try {
      const response = await fetch(`${API_URL}/api/podcasts/latest`);
      if (response.ok) {
        const data = await response.json();
        setLatestEpisodes(data);
      }
    } catch (error) {
      console.log('Could not fetch latest episodes, showing static content');
    } finally {
      setLoadingEpisodes(false);
    }
  };

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

  const formatDate = (dateStr: string): string => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
      return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    } catch {
      return '';
    }
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
          {PODCASTS.map((podcast) => {
            const latestEp = latestEpisodes[podcast.id];
            
            return (
              <View key={podcast.id} style={styles.podcastCard}>
                {/* Header with Logo */}
                <View style={styles.podcastHeader}>
                  <Image 
                    source={{ uri: podcast.logo }} 
                    style={styles.podcastLogo}
                    defaultSource={require('../assets/images/icon.png')}
                  />
                  <View style={styles.podcastInfo}>
                    <Text style={styles.podcastName} numberOfLines={2}>{podcast.name}</Text>
                    <Text style={styles.podcastHost}>Hosted by {podcast.host}</Text>
                  </View>
                </View>
                
                <Text style={styles.podcastDescription}>{podcast.description}</Text>
                
                {/* Latest Episode */}
                {latestEp && (
                  <TouchableOpacity 
                    style={styles.latestEpisode}
                    onPress={() => latestEp.link && openLink(latestEp.link)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.latestEpisodeIcon}>
                      <Ionicons name="play-circle" size={20} color="#db2777" />
                    </View>
                    <View style={styles.latestEpisodeInfo}>
                      <Text style={styles.latestEpisodeLabel}>Latest Episode</Text>
                      <Text style={styles.latestEpisodeTitle} numberOfLines={1}>{latestEp.title}</Text>
                      {latestEp.date && (
                        <Text style={styles.latestEpisodeDate}>{formatDate(latestEp.date)}</Text>
                      )}
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
                  </TouchableOpacity>
                )}
                
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
                      <Ionicons name="logo-spotify" size={18} color="#1DB954" />
                      <Text style={styles.platformText}>Spotify</Text>
                    </TouchableOpacity>
                  )}
                  {podcast.appleUrl && (
                    <TouchableOpacity
                      style={styles.platformButton}
                      onPress={() => openLink(podcast.appleUrl!)}
                      data-testid={`${podcast.id}-apple`}
                    >
                      <Ionicons name="logo-apple" size={18} color={colors.text} />
                      <Text style={styles.platformText}>Apple</Text>
                    </TouchableOpacity>
                  )}
                  {podcast.youtubeUrl && (
                    <TouchableOpacity
                      style={styles.platformButton}
                      onPress={() => openLink(podcast.youtubeUrl!)}
                      data-testid={`${podcast.id}-youtube`}
                    >
                      <Ionicons name="logo-youtube" size={18} color="#FF0000" />
                      <Text style={styles.platformText}>YouTube</Text>
                    </TouchableOpacity>
                  )}
                  {podcast.websiteUrl && (
                    <TouchableOpacity
                      style={styles.platformButton}
                      onPress={() => openLink(podcast.websiteUrl!)}
                      data-testid={`${podcast.id}-website`}
                    >
                      <Ionicons name="globe-outline" size={18} color={colors.primary} />
                      <Text style={styles.platformText}>Website</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
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
  podcastLogo: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: colors.background,
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
  latestEpisode: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fdf2f8',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  latestEpisodeIcon: {
    marginRight: 10,
  },
  latestEpisodeInfo: {
    flex: 1,
  },
  latestEpisodeLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#db2777',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  latestEpisodeTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginTop: 2,
  },
  latestEpisodeDate: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
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
