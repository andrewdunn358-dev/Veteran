import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet,
  TextInput,
  Linking,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../src/context/ThemeContext';

// Service branch filters
const SERVICE_FILTERS = [
  { id: 'all', name: 'All', icon: 'list' },
  { id: 'army', name: 'Army', icon: 'shield' },
  { id: 'navy', name: 'Royal Navy', icon: 'boat' },
  { id: 'raf', name: 'RAF', icon: 'airplane' },
  { id: 'marines', name: 'Marines', icon: 'fitness' },
];

// Comprehensive list of associations
const ASSOCIATIONS = [
  // ARMY - Guards
  { id: 'coldstream', name: 'Coldstream Guards Association', service: 'army', category: 'Guards', website: 'https://www.coldstreamguards.org.uk', phone: null, email: null },
  { id: 'grenadier', name: 'Grenadier Guards Association', service: 'army', category: 'Guards', website: 'https://www.grengds.com', phone: null, email: null },
  { id: 'scotsguards', name: 'Scots Guards Association', service: 'army', category: 'Guards', website: 'https://www.scotsguards.co.uk', phone: null, email: null },
  { id: 'irishguards', name: 'Irish Guards Association', service: 'army', category: 'Guards', website: 'https://www.irishguards.org.uk', phone: null, email: null },
  { id: 'welshguards', name: 'Welsh Guards Association', service: 'army', category: 'Guards', website: 'https://www.welshguardsassociation.com', phone: null, email: null },
  
  // ARMY - Scottish Regiments
  { id: 'blackwatch', name: 'The Black Watch Association', service: 'army', category: 'Scottish', website: 'https://www.theblackwatch.co.uk', phone: null, email: null },
  { id: 'royalscots', name: 'The Royal Scots Association', service: 'army', category: 'Scottish', website: 'https://www.theroyalscots.co.uk', phone: null, email: null },
  { id: 'kosb', name: 'Kings Own Scottish Borderers Association', service: 'army', category: 'Scottish', website: 'https://www.kosb.co.uk', phone: null, email: null },
  { id: 'gordons', name: 'Gordon Highlanders Association', service: 'army', category: 'Scottish', website: 'https://www.gordonhighlanders.org.uk', phone: null, email: null },
  { id: 'argylls', name: 'Argyll & Sutherland Highlanders Association', service: 'army', category: 'Scottish', website: 'https://www.argylls.co.uk', phone: null, email: null },
  { id: 'rhf', name: 'Royal Highland Fusiliers Association', service: 'army', category: 'Scottish', website: 'https://www.rhf.org.uk', phone: null, email: null },
  
  // ARMY - English Regiments
  { id: 'fusiliers', name: 'Royal Regiment of Fusiliers Association', service: 'army', category: 'Infantry', website: 'https://www.thefusiliers.org', phone: null, email: null },
  { id: 'anglian', name: 'Royal Anglian Regiment Association', service: 'army', category: 'Infantry', website: 'https://www.royalanglianregiment.com', phone: '01onal 628455', email: null },
  { id: 'rifles', name: 'The Rifles Association', service: 'army', category: 'Infantry', website: 'https://www.theriflesassociation.co.uk', phone: null, email: null },
  { id: 'mercian', name: 'Mercian Regiment Association', service: 'army', category: 'Infantry', website: 'https://www.mercianregiment.co.uk', phone: null, email: null },
  { id: 'yorkshire', name: 'Yorkshire Regiment Association', service: 'army', category: 'Infantry', website: 'https://www.yorkshireregiment.com', phone: null, email: null },
  { id: 'lancs', name: 'Duke of Lancasters Regiment Association', service: 'army', category: 'Infantry', website: 'https://www.army.mod.uk/lancs', phone: null, email: null },
  { id: 'pwrr', name: 'Princess of Wales\'s Royal Regiment Association', service: 'army', category: 'Infantry', website: 'https://www.pwrr.org.uk', phone: null, email: null },
  { id: 'greenhowards', name: 'Green Howards Association', service: 'army', category: 'Infantry', website: 'https://www.greenhowards.org.uk', phone: null, email: null },
  { id: 'rgj', name: 'Royal Green Jackets Association', service: 'army', category: 'Infantry', website: 'https://www.rgjassociation.com', phone: null, email: null },
  { id: 'lightinfantry', name: 'Light Infantry Association', service: 'army', category: 'Infantry', website: 'https://www.lightinfantry.org.uk', phone: null, email: null },
  
  // ARMY - Welsh & Irish
  { id: 'royalwelsh', name: 'Royal Welsh Association', service: 'army', category: 'Welsh', website: 'https://www.royalwelsh.org.uk', phone: null, email: null },
  { id: 'rwf', name: 'Royal Welch Fusiliers Association', service: 'army', category: 'Welsh', website: 'https://www.rwfmuseum.org.uk', phone: null, email: null },
  { id: 'royalirish', name: 'Royal Irish Regiment Association', service: 'army', category: 'Irish', website: 'https://www.royalirishassociation.com', phone: '01onal 232086', email: null },
  { id: 'ulsterrifles', name: 'Royal Ulster Rifles Association', service: 'army', category: 'Irish', website: null, phone: null, email: null },
  
  // ARMY - Cavalry & Armoured
  { id: 'rtr', name: 'Royal Tank Regiment Association', service: 'army', category: 'Armoured', website: 'https://www.royaltankregiment.com', phone: '01929 403331', email: null },
  { id: 'qdg', name: 'Queens Dragoon Guards Association', service: 'army', category: 'Cavalry', website: 'https://www.qdg.org.uk', phone: null, email: null },
  { id: 'scotsdg', name: 'Royal Scots Dragoon Guards Association', service: 'army', category: 'Cavalry', website: 'https://www.scotsdg.org.uk', phone: null, email: null },
  { id: 'qrh', name: 'Queens Royal Hussars Association', service: 'army', category: 'Cavalry', website: 'https://www.qrh.org.uk', phone: null, email: null },
  { id: 'krh', name: 'Kings Royal Hussars Association', service: 'army', category: 'Cavalry', website: 'https://www.krh.org.uk', phone: null, email: null },
  { id: 'lightdragoons', name: 'Light Dragoons Association', service: 'army', category: 'Cavalry', website: 'https://www.lightdragoons.org.uk', phone: null, email: null },
  { id: 'lifeguards', name: 'Life Guards Association', service: 'army', category: 'Household Cavalry', website: 'https://www.householdcavalry.info', phone: null, email: null },
  { id: 'bluesroyals', name: 'Blues and Royals Association', service: 'army', category: 'Household Cavalry', website: 'https://www.householdcavalry.info', phone: null, email: null },
  
  // ARMY - Airborne & Special
  { id: 'para', name: 'Parachute Regimental Association', service: 'army', category: 'Airborne', website: 'https://www.pra.org.uk', phone: null, email: null },
  { id: 'sas', name: 'SAS Regimental Association', service: 'army', category: 'Special Forces', website: null, phone: null, email: null },
  { id: 'gurkha', name: 'Gurkha Brigade Association', service: 'army', category: 'Gurkha', website: 'https://www.gurkhabrigade.org.uk', phone: null, email: null },
  
  // ARMY - Corps
  { id: 'ra', name: 'Royal Artillery Association', service: 'army', category: 'Corps', website: 'https://www.theraa.co.uk', phone: null, email: null },
  { id: 're', name: 'Royal Engineers Association', service: 'army', category: 'Corps', website: 'https://www.reahq.org.uk', phone: null, email: null },
  { id: 'rsignals', name: 'Royal Signals Association', service: 'army', category: 'Corps', website: 'https://www.royalsignals.org', phone: null, email: null },
  { id: 'rlc', name: 'Royal Logistic Corps Association', service: 'army', category: 'Corps', website: 'https://www.rlcassociation.org', phone: null, email: null },
  { id: 'reme', name: 'REME Association', service: 'army', category: 'Corps', website: 'https://www.remeassociation.org.uk', phone: null, email: null },
  { id: 'ramc', name: 'Royal Army Medical Corps Association', service: 'army', category: 'Corps', website: 'https://www.ramcassociation.org.uk', phone: null, email: null },
  { id: 'rmp', name: 'Royal Military Police Association', service: 'army', category: 'Corps', website: 'https://www.rhqrmp.org', phone: '01243 786311', email: null },
  { id: 'aac', name: 'Army Air Corps Association', service: 'army', category: 'Corps', website: 'https://www.armyaircorpsassociation.co.uk', phone: null, email: null },
  { id: 'int', name: 'Intelligence Corps Association', service: 'army', category: 'Corps', website: 'https://www.intelligencecorps.org.uk', phone: null, email: null },
  { id: 'agc', name: 'Adjutant Generals Corps Association', service: 'army', category: 'Corps', website: 'https://www.agcassociation.co.uk', phone: null, email: null },
  { id: 'wrac', name: 'WRAC Association', service: 'army', category: 'Corps', website: 'https://www.wracassociation.co.uk', phone: null, email: null },
  
  // ROYAL NAVY
  { id: 'rna', name: 'Royal Naval Association', service: 'navy', category: 'Main Association', website: 'https://www.royal-naval-association.co.uk', phone: '023 9272 3747', email: 'admin@rnassoc.org' },
  { id: 'arno', name: 'Association of Royal Naval Officers', service: 'navy', category: 'Officers', website: 'https://www.arno.org.uk', phone: null, email: null },
  { id: 'wrens', name: 'Association of Wrens', service: 'navy', category: 'Womens', website: 'https://www.wrens.org.uk', phone: null, email: null },
  { id: 'rnmba', name: 'Royal Naval Medical Branch Association', service: 'navy', category: 'Branch', website: null, phone: null, email: null },
  { id: 'cfva', name: 'Coastal Forces Veterans Association', service: 'navy', category: 'Branch', website: 'https://www.coastalforces.org.uk', phone: null, email: null },
  { id: 'soca', name: 'Submariners Old Comrades Association', service: 'navy', category: 'Submarines', website: 'https://www.submarinersassociation.co.uk', phone: null, email: null },
  { id: 'faa', name: 'Fleet Air Arm Association', service: 'navy', category: 'Aviation', website: 'https://www.fleetairarmoa.org', phone: null, email: null },
  { id: 'rnrmc', name: 'Royal Navy & Royal Marines Charity', service: 'navy', category: 'Charity', website: 'https://www.rnrmc.org.uk', phone: '023 9387 1520', email: null },
  
  // ROYAL MARINES
  { id: 'rma', name: 'Royal Marines Association', service: 'marines', category: 'Main Association', website: 'https://www.royalmarinesassociation.org.uk', phone: '023 9283 7543', email: null },
  { id: 'commando', name: '40 Commando Association', service: 'marines', category: 'Commando', website: null, phone: null, email: null },
  { id: '42cdo', name: '42 Commando Association', service: 'marines', category: 'Commando', website: null, phone: null, email: null },
  { id: '45cdo', name: '45 Commando Association', service: 'marines', category: 'Commando', website: null, phone: null, email: null },
  { id: 'sbsassoc', name: 'SBS Association', service: 'marines', category: 'Special Forces', website: null, phone: null, email: null },
  
  // RAF
  { id: 'rafa', name: 'Royal Air Forces Association', service: 'raf', category: 'Main Association', website: 'https://www.rafa.org.uk', phone: '0800 018 2361', email: null },
  { id: 'rafra', name: 'RAF Register of Associations', service: 'raf', category: 'Directory', website: 'http://www.associations.rafinfo.org.uk', phone: null, email: null },
  { id: 'rafreg', name: 'RAF Regiment Association', service: 'raf', category: 'Regiment', website: 'https://www.rafregtassoc.org', phone: null, email: null },
  { id: 'rafpolice', name: 'RAF Police Association', service: 'raf', category: 'Branch', website: 'https://www.rafpa.com', phone: null, email: null },
  { id: '617sqn', name: '617 Squadron (Dambusters) Association', service: 'raf', category: 'Squadron', website: 'https://www.617squadron.co.uk', phone: null, email: null },
  { id: '6sqn', name: '6 Squadron Association', service: 'raf', category: 'Squadron', website: 'https://www.sixsqnassociation.org.uk', phone: null, email: 'sixsqnassoc@outlook.com' },
  { id: '8sqn', name: '8 Squadron Association', service: 'raf', category: 'Squadron', website: 'http://www.8squadron.co.uk', phone: null, email: null },
  { id: '9sqn', name: '9 Squadron Association', service: 'raf', category: 'Squadron', website: null, phone: null, email: 'association.sec@9sqn.co.uk' },
  { id: '10sqn', name: '10 Squadron Association', service: 'raf', category: 'Squadron', website: 'https://www.10sqnass.co.uk', phone: null, email: null },
  { id: 'wraf', name: 'WRAF Association', service: 'raf', category: 'Womens', website: 'https://www.wrafassoc.co.uk', phone: null, email: null },
  { id: 'rafbf', name: 'RAF Benevolent Fund', service: 'raf', category: 'Charity', website: 'https://www.rafbf.org', phone: '0300 102 1919', email: null },
];

export default function AssociationsScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAssociations = ASSOCIATIONS.filter(assoc => {
    const matchesFilter = selectedFilter === 'all' || assoc.service === selectedFilter;
    const matchesSearch = assoc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          assoc.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Group by category
  const groupedAssociations = filteredAssociations.reduce((acc, assoc) => {
    const key = `${assoc.service}-${assoc.category}`;
    if (!acc[key]) {
      acc[key] = {
        service: assoc.service,
        category: assoc.category,
        items: []
      };
    }
    acc[key].items.push(assoc);
    return acc;
  }, {} as Record<string, { service: string; category: string; items: typeof ASSOCIATIONS }>);

  const handleContact = (assoc: typeof ASSOCIATIONS[0]) => {
    if (assoc.website) {
      Linking.openURL(assoc.website);
    } else if (assoc.phone) {
      Linking.openURL(`tel:${assoc.phone.replace(/\s/g, '')}`);
    } else if (assoc.email) {
      Linking.openURL(`mailto:${assoc.email}`);
    }
  };

  const getServiceColor = (service: string) => {
    switch (service) {
      case 'army': return '#dc2626';
      case 'navy': return '#1d4ed8';
      case 'raf': return '#0891b2';
      case 'marines': return '#15803d';
      default: return '#64748b';
    }
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={isDark ? '#ffffff' : '#1e293b'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isDark && styles.textLight]}>Regimental & Service Associations</Text>
      </View>

      {/* Search */}
      <View style={[styles.searchContainer, isDark && styles.searchContainerDark]}>
        <Ionicons name="search" size={20} color="#64748b" />
        <TextInput
          style={[styles.searchInput, isDark && styles.textLight]}
          placeholder="Search associations..."
          placeholderTextColor="#94a3b8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#94a3b8" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {SERVICE_FILTERS.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            style={[
              styles.filterTab,
              isDark && styles.filterTabDark,
              selectedFilter === filter.id && styles.filterTabActive,
              selectedFilter === filter.id && { backgroundColor: getServiceColor(filter.id === 'all' ? 'army' : filter.id) }
            ]}
            onPress={() => setSelectedFilter(filter.id)}
          >
            <Ionicons 
              name={filter.icon as any} 
              size={16} 
              color={selectedFilter === filter.id ? '#ffffff' : (isDark ? '#94a3b8' : '#64748b')} 
            />
            <Text style={[
              styles.filterTabText,
              isDark && styles.textMuted,
              selectedFilter === filter.id && styles.filterTabTextActive
            ]}>
              {filter.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Results Count */}
      <View style={styles.resultsHeader}>
        <Text style={[styles.resultsCount, isDark && styles.textMuted]}>
          {filteredAssociations.length} associations found
        </Text>
      </View>

      {/* Associations List */}
      <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
        {Object.values(groupedAssociations).map((group) => (
          <View key={`${group.service}-${group.category}`} style={styles.groupContainer}>
            <View style={styles.groupHeader}>
              <View style={[styles.groupBadge, { backgroundColor: getServiceColor(group.service) }]}>
                <Text style={styles.groupBadgeText}>
                  {group.service.toUpperCase()}
                </Text>
              </View>
              <Text style={[styles.groupTitle, isDark && styles.textLight]}>
                {group.category}
              </Text>
            </View>
            
            {group.items.map((assoc) => (
              <TouchableOpacity
                key={assoc.id}
                style={[styles.associationCard, isDark && styles.cardDark]}
                onPress={() => handleContact(assoc)}
                disabled={!assoc.website && !assoc.phone && !assoc.email}
              >
                <View style={styles.associationInfo}>
                  <Text style={[styles.associationName, isDark && styles.textLight]}>
                    {assoc.name}
                  </Text>
                  <View style={styles.contactInfo}>
                    {assoc.phone && (
                      <View style={styles.contactItem}>
                        <Ionicons name="call" size={14} color="#22c55e" />
                        <Text style={[styles.contactText, isDark && styles.textMuted]}>{assoc.phone}</Text>
                      </View>
                    )}
                    {assoc.email && (
                      <View style={styles.contactItem}>
                        <Ionicons name="mail" size={14} color="#3b82f6" />
                        <Text style={[styles.contactText, isDark && styles.textMuted]}>{assoc.email}</Text>
                      </View>
                    )}
                    {assoc.website && (
                      <View style={styles.contactItem}>
                        <Ionicons name="globe" size={14} color="#8b5cf6" />
                        <Text style={[styles.contactText, isDark && styles.textMuted]}>Website</Text>
                      </View>
                    )}
                  </View>
                </View>
                {(assoc.website || assoc.phone || assoc.email) && (
                  <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* Info Notice */}
        <View style={[styles.infoNotice, isDark && styles.infoNoticeDark]}>
          <Ionicons name="information-circle" size={20} color="#3b82f6" />
          <Text style={[styles.infoNoticeText, isDark && styles.textMuted]}>
            Can't find your association? Many regiments have local branches. 
            Contact the main association or visit Cobseo.org.uk for a full directory.
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  textLight: {
    color: '#f1f5f9',
  },
  textMuted: {
    color: '#94a3b8',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchContainerDark: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1e293b',
  },
  filterContainer: {
    marginTop: 12,
    maxHeight: 50,
  },
  filterContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 6,
    marginRight: 8,
  },
  filterTabDark: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
  },
  filterTabActive: {
    borderColor: 'transparent',
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748b',
  },
  filterTabTextActive: {
    color: '#ffffff',
  },
  resultsHeader: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  resultsCount: {
    fontSize: 13,
    color: '#64748b',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  groupContainer: {
    marginBottom: 20,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  groupBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  groupBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
  },
  groupTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
  },
  associationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardDark: {
    backgroundColor: '#1e293b',
  },
  associationInfo: {
    flex: 1,
  },
  associationName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  contactInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  contactText: {
    fontSize: 12,
    color: '#64748b',
  },
  infoNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#eff6ff',
    padding: 14,
    borderRadius: 12,
    gap: 10,
    marginTop: 8,
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
