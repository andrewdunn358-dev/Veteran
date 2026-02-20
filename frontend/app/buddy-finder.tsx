import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Modal
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../src/context/ThemeContext';

// Service branches
const SERVICE_BRANCHES = [
  { id: 'army', name: 'British Army', icon: 'shield', color: '#dc2626' },
  { id: 'navy', name: 'Royal Navy', icon: 'boat', color: '#1d4ed8' },
  { id: 'raf', name: 'Royal Air Force', icon: 'airplane', color: '#0891b2' },
  { id: 'marines', name: 'Royal Marines', icon: 'fitness', color: '#15803d' },
];

// UK Regions
const UK_REGIONS = [
  'London & South East',
  'South West',
  'East of England',
  'East Midlands',
  'West Midlands',
  'Yorkshire & Humber',
  'North West',
  'North East',
  'Scotland',
  'Wales',
  'Northern Ireland',
  'Overseas/Germany (BAOR)',
  'Overseas/Cyprus',
  'Overseas/Other',
];

// Regiments by service (since 1970)
const REGIMENTS: { [key: string]: { category: string; units: string[] }[] } = {
  army: [
    {
      category: 'Household Cavalry',
      units: [
        'The Life Guards',
        'The Blues and Royals (Royal Horse Guards and 1st Dragoons)',
      ]
    },
    {
      category: 'Foot Guards',
      units: [
        'Grenadier Guards',
        'Coldstream Guards',
        'Scots Guards',
        'Irish Guards',
        'Welsh Guards',
      ]
    },
    {
      category: 'Royal Armoured Corps',
      units: [
        '1st The Queen\'s Dragoon Guards',
        'Royal Scots Dragoon Guards (Carabiniers and Greys)',
        'Royal Dragoon Guards',
        'Queen\'s Royal Hussars (The Queen\'s Own and Royal Irish)',
        '9th/12th Royal Lancers (Prince of Wales\'s)',
        'King\'s Royal Hussars',
        'Light Dragoons',
        'Royal Tank Regiment',
        '13th/18th Royal Hussars (Queen Mary\'s Own)',
        '14th/20th King\'s Hussars',
        '15th/19th The King\'s Royal Hussars',
        '16th/5th The Queen\'s Royal Lancers',
        '17th/21st Lancers',
        '4th/7th Royal Dragoon Guards',
        '5th Royal Inniskilling Dragoon Guards',
      ]
    },
    {
      category: 'Infantry - Scottish',
      units: [
        'Royal Regiment of Scotland',
        'Royal Scots (The Royal Regiment)',
        'Royal Highland Fusiliers',
        'King\'s Own Scottish Borderers',
        'Black Watch (Royal Highland Regiment)',
        'Queen\'s Own Highlanders (Seaforth and Camerons)',
        'Gordon Highlanders',
        'Argyll and Sutherland Highlanders',
        'Cameronians (Scottish Rifles)',
      ]
    },
    {
      category: 'Infantry - English',
      units: [
        'Royal Regiment of Fusiliers',
        'Royal Anglian Regiment',
        'Princess of Wales\'s Royal Regiment',
        'Duke of Lancaster\'s Regiment',
        'Yorkshire Regiment',
        'Mercian Regiment',
        'The Rifles',
        'Queen\'s Regiment',
        'Royal Hampshire Regiment',
        'Gloucestershire Regiment',
        'Worcestershire and Sherwood Foresters',
        'Staffordshire Regiment',
        'Cheshire Regiment',
        'Royal Green Jackets',
        'Light Infantry',
        'Devon and Dorset Regiment',
        'Royal Berkshire Regiment',
        'Duke of Edinburgh\'s Royal Regiment',
        'King\'s Regiment',
        'King\'s Own Royal Border Regiment',
        'Queen\'s Lancashire Regiment',
        'Duke of Wellington\'s Regiment',
        'Green Howards',
        'Prince of Wales\'s Own Regiment of Yorkshire',
      ]
    },
    {
      category: 'Infantry - Welsh',
      units: [
        'Royal Welsh',
        'Royal Regiment of Wales',
        'Royal Welch Fusiliers',
      ]
    },
    {
      category: 'Infantry - Irish',
      units: [
        'Royal Irish Regiment',
        'Royal Irish Rangers',
        'Ulster Defence Regiment',
      ]
    },
    {
      category: 'Infantry - Airborne & Special',
      units: [
        'Parachute Regiment',
        'Special Air Service (SAS)',
        'Royal Gurkha Rifles',
        '2nd King Edward VII\'s Own Gurkha Rifles',
        '6th Queen Elizabeth\'s Own Gurkha Rifles',
        '7th Duke of Edinburgh\'s Own Gurkha Rifles',
        '10th Princess Mary\'s Own Gurkha Rifles',
      ]
    },
    {
      category: 'Royal Artillery',
      units: [
        'Royal Regiment of Artillery',
        'Royal Horse Artillery',
      ]
    },
    {
      category: 'Royal Engineers',
      units: [
        'Corps of Royal Engineers',
      ]
    },
    {
      category: 'Royal Signals',
      units: [
        'Royal Corps of Signals',
      ]
    },
    {
      category: 'Army Air Corps',
      units: [
        'Army Air Corps',
      ]
    },
    {
      category: 'Logistics & Support',
      units: [
        'Royal Logistic Corps',
        'Royal Army Medical Corps',
        'Royal Electrical and Mechanical Engineers',
        'Adjutant General\'s Corps',
        'Royal Army Veterinary Corps',
        'Royal Army Dental Corps',
        'Intelligence Corps',
        'Royal Army Physical Training Corps',
        'Royal Military Police',
      ]
    },
  ],
  navy: [
    {
      category: 'Surface Fleet',
      units: [
        'HMS Ark Royal',
        'HMS Invincible',
        'HMS Illustrious',
        'HMS Ocean',
        'HMS Bulwark',
        'HMS Albion',
        'HMS Queen Elizabeth',
        'HMS Prince of Wales',
        'HMS Belfast',
        'Type 42 Destroyer',
        'Type 45 Destroyer',
        'Type 23 Frigate',
        'Type 26 Frigate',
      ]
    },
    {
      category: 'Submarine Service',
      units: [
        'HMS Vanguard',
        'HMS Victorious',
        'HMS Vigilant',
        'HMS Vengeance',
        'HMS Astute',
        'Polaris Submarine',
        'Trident Submarine',
      ]
    },
    {
      category: 'Fleet Air Arm',
      units: [
        'Fleet Air Arm',
        '800 Naval Air Squadron',
        '801 Naval Air Squadron',
        '820 Naval Air Squadron',
        '845 Naval Air Squadron',
        '846 Naval Air Squadron',
        '849 Naval Air Squadron',
      ]
    },
  ],
  raf: [
    {
      category: 'Fighter Command',
      units: [
        'No. 1 Squadron',
        'No. 2 Squadron',
        'No. 3 Squadron',
        'No. 6 Squadron',
        'No. 11 Squadron',
        'No. 12 Squadron',
        'No. 14 Squadron',
        'No. 17 Squadron',
        'No. 29 Squadron',
        'No. 43 Squadron',
        'No. 54 Squadron',
        'No. 56 Squadron',
        'No. 111 Squadron',
      ]
    },
    {
      category: 'Bomber/Strike',
      units: [
        'No. 9 Squadron',
        'No. 12 Squadron',
        'No. 27 Squadron',
        'No. 31 Squadron',
        'No. 617 Squadron (Dambusters)',
      ]
    },
    {
      category: 'Transport',
      units: [
        'No. 10 Squadron',
        'No. 24 Squadron',
        'No. 30 Squadron',
        'No. 47 Squadron',
        'No. 70 Squadron',
        'No. 99 Squadron',
        'No. 101 Squadron',
      ]
    },
    {
      category: 'Support',
      units: [
        'RAF Regiment',
        'RAF Police',
        'RAF Medical Services',
      ]
    },
  ],
  marines: [
    {
      category: 'Commando Units',
      units: [
        '40 Commando',
        '42 Commando',
        '45 Commando',
        'Commando Logistics Regiment',
        'Commando Helicopter Force',
        '539 Assault Squadron',
        '30 Commando Information Exploitation Group',
        '43 Commando Fleet Protection Group',
        'Special Boat Service (SBS)',
      ]
    },
    {
      category: 'Support Units',
      units: [
        '29 Commando Regiment Royal Artillery',
        '24 Commando Royal Engineers',
        'Commando Training Centre',
      ]
    },
  ],
};

// Sample veterans data (in production this would come from backend)
const SAMPLE_VETERANS = [
  { id: '1', name: 'Dave M.', service: 'army', region: 'North West', regiment: 'Royal Regiment of Fusiliers', years: '1995-2010' },
  { id: '2', name: 'Steve R.', service: 'army', region: 'Yorkshire & Humber', regiment: 'Yorkshire Regiment', years: '2001-2015' },
  { id: '3', name: 'Mike T.', service: 'navy', region: 'South West', regiment: 'HMS Ocean', years: '1998-2012' },
  { id: '4', name: 'John B.', service: 'raf', region: 'East of England', regiment: 'No. 617 Squadron (Dambusters)', years: '2005-2018' },
  { id: '5', name: 'Chris P.', service: 'marines', region: 'Scotland', regiment: '45 Commando', years: '2000-2014' },
  { id: '6', name: 'Paul W.', service: 'army', region: 'London & South East', regiment: 'Parachute Regiment', years: '1992-2008' },
  { id: '7', name: 'Gary L.', service: 'army', region: 'West Midlands', regiment: 'Mercian Regiment', years: '2003-2016' },
  { id: '8', name: 'Ian K.', service: 'navy', region: 'Scotland', regiment: 'HMS Illustrious', years: '1997-2011' },
  { id: '9', name: 'Rob H.', service: 'army', region: 'North East', regiment: 'Green Howards', years: '1985-2000' },
  { id: '10', name: 'Kev D.', service: 'army', region: 'Overseas/Germany (BAOR)', regiment: 'Royal Tank Regiment', years: '1988-2004' },
];

export default function BuddyFinderScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedRegiment, setSelectedRegiment] = useState<string | null>(null);
  const [showRegimentPicker, setShowRegimentPicker] = useState(false);
  const [searchResults, setSearchResults] = useState<typeof SAMPLE_VETERANS>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = () => {
    setIsSearching(true);
    setHasSearched(true);
    
    // Simulate API call
    setTimeout(() => {
      let results = SAMPLE_VETERANS;
      
      if (selectedService) {
        results = results.filter(v => v.service === selectedService);
      }
      if (selectedRegion) {
        results = results.filter(v => v.region === selectedRegion);
      }
      if (selectedRegiment) {
        results = results.filter(v => v.regiment === selectedRegiment);
      }
      
      setSearchResults(results);
      setIsSearching(false);
    }, 500);
  };

  const clearFilters = () => {
    setSelectedService(null);
    setSelectedRegion(null);
    setSelectedRegiment(null);
    setSearchResults([]);
    setHasSearched(false);
  };

  const getServiceInfo = (serviceId: string) => {
    return SERVICE_BRANCHES.find(s => s.id === serviceId);
  };

  const getRegimentsForService = () => {
    if (!selectedService) return [];
    return REGIMENTS[selectedService] || [];
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={isDark ? '#ffffff' : '#1e293b'} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, isDark && styles.textLight]}>Buddy Finder</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Intro */}
        <View style={[styles.introCard, isDark && styles.cardDark]}>
          <Ionicons name="people" size={32} color="#3b82f6" />
          <Text style={[styles.introTitle, isDark && styles.textLight]}>Find Fellow Veterans</Text>
          <Text style={[styles.introText, isDark && styles.textMuted]}>
            Connect with veterans who served in the same branch or region. 
            Sometimes it helps to talk to someone who's walked a similar path.
          </Text>
        </View>

        {/* Service Branch Filter */}
        <View style={styles.filterSection}>
          <Text style={[styles.filterLabel, isDark && styles.textLight]}>Service Branch</Text>
          <View style={styles.serviceGrid}>
            {SERVICE_BRANCHES.map((service) => (
              <TouchableOpacity
                key={service.id}
                style={[
                  styles.serviceButton,
                  isDark && styles.serviceButtonDark,
                  selectedService === service.id && { backgroundColor: service.color, borderColor: service.color }
                ]}
                onPress={() => setSelectedService(selectedService === service.id ? null : service.id)}
              >
                <Ionicons 
                  name={service.icon as any} 
                  size={20} 
                  color={selectedService === service.id ? '#ffffff' : service.color} 
                />
                <Text style={[
                  styles.serviceButtonText,
                  isDark && styles.textMuted,
                  selectedService === service.id && styles.serviceButtonTextSelected
                ]}>
                  {service.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Region Filter */}
        <View style={styles.filterSection}>
          <Text style={[styles.filterLabel, isDark && styles.textLight]}>Region</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.regionScroll}>
            {UK_REGIONS.map((region) => (
              <TouchableOpacity
                key={region}
                style={[
                  styles.regionChip,
                  isDark && styles.regionChipDark,
                  selectedRegion === region && styles.regionChipSelected
                ]}
                onPress={() => setSelectedRegion(selectedRegion === region ? null : region)}
              >
                <Text style={[
                  styles.regionChipText,
                  isDark && styles.textMuted,
                  selectedRegion === region && styles.regionChipTextSelected
                ]}>
                  {region}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Search Button */}
        <View style={styles.searchActions}>
          <TouchableOpacity 
            style={styles.searchButton}
            onPress={handleSearch}
          >
            <Ionicons name="search" size={20} color="#ffffff" />
            <Text style={styles.searchButtonText}>Find Veterans</Text>
          </TouchableOpacity>
          
          {(selectedService || selectedRegion) && (
            <TouchableOpacity 
              style={[styles.clearButton, isDark && styles.clearButtonDark]}
              onPress={clearFilters}
            >
              <Ionicons name="close-circle" size={18} color={isDark ? '#94a3b8' : '#64748b'} />
              <Text style={[styles.clearButtonText, isDark && styles.textMuted]}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Results */}
        {isSearching && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text style={[styles.loadingText, isDark && styles.textMuted]}>Searching...</Text>
          </View>
        )}

        {hasSearched && !isSearching && (
          <View style={styles.resultsSection}>
            <Text style={[styles.resultsTitle, isDark && styles.textLight]}>
              {searchResults.length} {searchResults.length === 1 ? 'Veteran' : 'Veterans'} Found
            </Text>
            
            {searchResults.length === 0 ? (
              <View style={[styles.noResultsCard, isDark && styles.cardDark]}>
                <Ionicons name="search-outline" size={48} color="#94a3b8" />
                <Text style={[styles.noResultsText, isDark && styles.textMuted]}>
                  No veterans found matching your criteria. Try adjusting your filters.
                </Text>
              </View>
            ) : (
              searchResults.map((veteran) => {
                const serviceInfo = getServiceInfo(veteran.service);
                return (
                  <View key={veteran.id} style={[styles.veteranCard, isDark && styles.cardDark]}>
                    <View style={[styles.veteranAvatar, { backgroundColor: serviceInfo?.color || '#64748b' }]}>
                      <Ionicons name={serviceInfo?.icon as any || 'person'} size={24} color="#ffffff" />
                    </View>
                    <View style={styles.veteranInfo}>
                      <Text style={[styles.veteranName, isDark && styles.textLight]}>{veteran.name}</Text>
                      <Text style={[styles.veteranDetail, isDark && styles.textMuted]}>
                        {serviceInfo?.name} • {veteran.regiment}
                      </Text>
                      <Text style={[styles.veteranDetail, isDark && styles.textMuted]}>
                        {veteran.region} • Served {veteran.years}
                      </Text>
                    </View>
                    <TouchableOpacity style={styles.connectButton}>
                      <Ionicons name="chatbubble-ellipses" size={20} color="#3b82f6" />
                    </TouchableOpacity>
                  </View>
                );
              })
            )}
          </View>
        )}

        {/* Info Notice */}
        <View style={[styles.infoNotice, isDark && styles.infoNoticeDark]}>
          <Ionicons name="information-circle" size={20} color="#3b82f6" />
          <Text style={[styles.infoNoticeText, isDark && styles.textMuted]}>
            This is a peer connection feature. All communications are voluntary 
            and should not replace professional support.
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  containerDark: {
    backgroundColor: '#0f172a',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
  },
  placeholder: {
    width: 40,
  },
  textLight: {
    color: '#f1f5f9',
  },
  textMuted: {
    color: '#94a3b8',
  },
  introCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardDark: {
    backgroundColor: '#1e293b',
  },
  introTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 12,
    marginBottom: 8,
  },
  introText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
  filterSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  serviceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  serviceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    gap: 8,
  },
  serviceButtonDark: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
  },
  serviceButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569',
  },
  serviceButtonTextSelected: {
    color: '#ffffff',
  },
  regionScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  regionChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginRight: 8,
  },
  regionChipDark: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
  },
  regionChipSelected: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  regionChipText: {
    fontSize: 14,
    color: '#475569',
  },
  regionChipTextSelected: {
    color: '#ffffff',
  },
  searchActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  searchButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  searchButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    gap: 6,
  },
  clearButtonDark: {
    backgroundColor: '#1e293b',
  },
  clearButtonText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '500',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748b',
  },
  resultsSection: {
    marginHorizontal: 20,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  noResultsCard: {
    backgroundColor: '#ffffff',
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 16,
  },
  veteranCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  veteranAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  veteranInfo: {
    flex: 1,
    marginLeft: 12,
  },
  veteranName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  veteranDetail: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  connectButton: {
    padding: 12,
    backgroundColor: '#eff6ff',
    borderRadius: 10,
  },
  infoNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#eff6ff',
    marginHorizontal: 20,
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  infoNoticeDark: {
    backgroundColor: '#1e3a5f',
  },
  infoNoticeText: {
    flex: 1,
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
  },
});
