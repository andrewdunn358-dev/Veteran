import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';

interface BuddyProfile {
  id: string;
  display_name: string;
  region: string;
  service_branch: string;
  regiment?: string;
  years_served?: string;
  bio?: string;
  interests: string[];
  last_active: string;
}

export default function BuddyFinderPage() {
  const router = useRouter();
  const [view, setView] = useState<'browse' | 'signup' | 'profile'>('browse');
  const [profiles, setProfiles] = useState<BuddyProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [regions, setRegions] = useState<string[]>([]);
  const [branches, setBranches] = useState<string[]>([]);
  
  // Filter state
  const [filterRegion, setFilterRegion] = useState('');
  const [filterBranch, setFilterBranch] = useState('');
  
  // Signup form state
  const [formData, setFormData] = useState({
    display_name: '',
    region: '',
    service_branch: '',
    regiment: '',
    years_served: '',
    bio: '',
    interests: '',
    contact_preference: 'in_app',
    email: '',
    gdpr_consent: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [profilesRes, regionsRes, branchesRes] = await Promise.all([
        fetch(`${API_URL}/api/buddy-finder/profiles`),
        fetch(`${API_URL}/api/buddy-finder/regions`),
        fetch(`${API_URL}/api/buddy-finder/branches`),
      ]);
      
      const profilesData = await profilesRes.json();
      const regionsData = await regionsRes.json();
      const branchesData = await branchesRes.json();
      
      setProfiles(Array.isArray(profilesData) ? profilesData : []);
      setRegions(regionsData.regions || []);
      setBranches(branchesData.branches || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchProfiles = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterRegion) params.append('region', filterRegion);
      if (filterBranch) params.append('service_branch', filterBranch);
      
      const res = await fetch(`${API_URL}/api/buddy-finder/profiles?${params}`);
      const data = await res.json();
      setProfiles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!formData.gdpr_consent) {
      Alert.alert('Consent Required', 'Please accept the GDPR consent to continue.');
      return;
    }
    if (!formData.display_name || !formData.region || !formData.service_branch) {
      Alert.alert('Required Fields', 'Please fill in your name, region, and service branch.');
      return;
    }
    if (formData.contact_preference === 'email' && !formData.email) {
      Alert.alert('Email Required', 'Please provide an email for contact preference.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/buddy-finder/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          interests: formData.interests.split(',').map(i => i.trim()).filter(i => i),
        }),
      });

      if (res.ok) {
        Alert.alert('Welcome!', 'Your profile has been created. Other veterans can now find you.');
        setView('browse');
        loadData();
      } else {
        const error = await res.json();
        Alert.alert('Error', error.detail || 'Failed to create profile');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderBrowse = () => (
    <>
      {/* Filters */}
      <View style={styles.filterSection}>
        <Text style={styles.filterLabel}>Find Veterans</Text>
        <View style={styles.filterRow}>
          <TouchableOpacity 
            style={[styles.filterDropdown, filterRegion && styles.filterActive]}
            onPress={() => {
              const idx = regions.indexOf(filterRegion);
              setFilterRegion(idx < regions.length - 1 ? regions[idx + 1] : '');
            }}
          >
            <Text style={styles.filterText}>{filterRegion || 'Any Region'}</Text>
            <Ionicons name="chevron-down" size={16} color="#94a3b8" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.filterDropdown, filterBranch && styles.filterActive]}
            onPress={() => {
              const idx = branches.indexOf(filterBranch);
              setFilterBranch(idx < branches.length - 1 ? branches[idx + 1] : '');
            }}
          >
            <Text style={styles.filterText}>{filterBranch || 'Any Branch'}</Text>
            <Ionicons name="chevron-down" size={16} color="#94a3b8" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.searchButton} onPress={searchProfiles}>
          <Ionicons name="search" size={18} color="#fff" />
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {/* Results */}
      {loading ? (
        <ActivityIndicator size="large" color="#3b82f6" style={{ marginTop: 40 }} />
      ) : profiles.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="people-outline" size={64} color="#475569" />
          <Text style={styles.emptyTitle}>No Veterans Found</Text>
          <Text style={styles.emptyText}>Be the first to join from your area!</Text>
          <TouchableOpacity style={styles.signupPrompt} onPress={() => setView('signup')}>
            <Text style={styles.signupPromptText}>Sign Up Now</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.profilesList} showsVerticalScrollIndicator={false}>
          {profiles.map((profile) => (
            <TouchableOpacity key={profile.id} style={styles.profileCard}>
              <View style={styles.profileHeader}>
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>
                    {profile.display_name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.profileInfo}>
                  <Text style={styles.profileName}>{profile.display_name}</Text>
                  <Text style={styles.profileMeta}>
                    {profile.service_branch} - {profile.region}
                  </Text>
                  {profile.regiment && (
                    <Text style={styles.profileRegiment}>{profile.regiment}</Text>
                  )}
                </View>
              </View>
              {profile.bio && (
                <Text style={styles.profileBio} numberOfLines={2}>{profile.bio}</Text>
              )}
              {profile.interests.length > 0 && (
                <View style={styles.interestsTags}>
                  {profile.interests.slice(0, 3).map((interest, idx) => (
                    <View key={idx} style={styles.interestTag}>
                      <Text style={styles.interestText}>{interest}</Text>
                    </View>
                  ))}
                </View>
              )}
              <TouchableOpacity style={styles.connectButton}>
                <Ionicons name="chatbubble-outline" size={16} color="#3b82f6" />
                <Text style={styles.connectText}>Send Message</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </>
  );

  const renderSignup = () => (
    <ScrollView style={styles.signupForm} showsVerticalScrollIndicator={false}>
      <View style={styles.gdprNotice}>
        <FontAwesome5 name="shield-alt" size={24} color="#3b82f6" />
        <Text style={styles.gdprTitle}>Your Privacy Matters</Text>
        <Text style={styles.gdprText}>
          We only collect information needed to connect you with other veterans. 
          You can delete your profile at any time. Your data is handled in accordance with GDPR.
        </Text>
      </View>

      <Text style={styles.inputLabel}>Display Name *</Text>
      <TextInput
        style={styles.input}
        placeholder="How you want to be known (can be a nickname)"
        placeholderTextColor="#64748b"
        value={formData.display_name}
        onChangeText={(text) => setFormData({...formData, display_name: text})}
      />

      <Text style={styles.inputLabel}>Region *</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pickerScroll}>
        <View style={styles.pickerWrapper}>
          {regions.map((region) => (
            <TouchableOpacity
              key={region}
              style={[
                styles.pickerOption,
                formData.region === region && styles.pickerOptionSelected
              ]}
              onPress={() => setFormData({...formData, region})}
            >
              <Text style={[
                styles.pickerOptionText,
                formData.region === region && styles.pickerOptionTextSelected
              ]}>{region}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <Text style={styles.inputLabel}>Service Branch *</Text>
      <View style={styles.pickerWrapperWrap}>
        {branches.map((branch) => (
          <TouchableOpacity
            key={branch}
            style={[
              styles.pickerOption,
              formData.service_branch === branch && styles.pickerOptionSelected
            ]}
            onPress={() => setFormData({...formData, service_branch: branch})}
          >
            <Text style={[
              styles.pickerOptionText,
              formData.service_branch === branch && styles.pickerOptionTextSelected
            ]}>{branch}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.inputLabel}>Regiment (Optional)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., Royal Anglian Regiment"
        placeholderTextColor="#64748b"
        value={formData.regiment}
        onChangeText={(text) => setFormData({...formData, regiment: text})}
      />

      <Text style={styles.inputLabel}>Years Served (Optional)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., 1990-2005"
        placeholderTextColor="#64748b"
        value={formData.years_served}
        onChangeText={(text) => setFormData({...formData, years_served: text})}
      />

      <Text style={styles.inputLabel}>About You (Optional)</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="A brief introduction..."
        placeholderTextColor="#64748b"
        value={formData.bio}
        onChangeText={(text) => setFormData({...formData, bio: text})}
        multiline
        numberOfLines={3}
      />

      <Text style={styles.inputLabel}>Interests (Optional)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., hiking, fishing, football (comma separated)"
        placeholderTextColor="#64748b"
        value={formData.interests}
        onChangeText={(text) => setFormData({...formData, interests: text})}
      />

      <Text style={styles.inputLabel}>Email (for account recovery)</Text>
      <TextInput
        style={styles.input}
        placeholder="your.email@example.com"
        placeholderTextColor="#64748b"
        value={formData.email}
        onChangeText={(text) => setFormData({...formData, email: text})}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* GDPR Consent */}
      <TouchableOpacity 
        style={styles.consentRow}
        onPress={() => setFormData({...formData, gdpr_consent: !formData.gdpr_consent})}
      >
        <View style={[styles.checkbox, formData.gdpr_consent && styles.checkboxChecked]}>
          {formData.gdpr_consent && <Ionicons name="checkmark" size={16} color="#fff" />}
        </View>
        <Text style={styles.consentText}>
          I consent to my information being stored and shared with other veterans for the 
          purpose of peer connection. I understand I can delete my profile at any time.
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.submitButton, isSubmitting && styles.buttonDisabled]}
        onPress={handleSignup}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>Create My Profile</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Buddy Finder</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Tab Buttons */}
      <View style={styles.tabs}>
        <TouchableOpacity 
          style={[styles.tab, view === 'browse' && styles.tabActive]}
          onPress={() => setView('browse')}
        >
          <Ionicons name="search" size={18} color={view === 'browse' ? '#fff' : '#94a3b8'} />
          <Text style={[styles.tabText, view === 'browse' && styles.tabTextActive]}>Browse</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, view === 'signup' && styles.tabActive]}
          onPress={() => setView('signup')}
        >
          <Ionicons name="person-add" size={18} color={view === 'signup' ? '#fff' : '#94a3b8'} />
          <Text style={[styles.tabText, view === 'signup' && styles.tabTextActive]}>Sign Up</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        {view === 'browse' ? renderBrowse() : renderSignup()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#1e293b',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  placeholder: {
    width: 32,
  },
  tabs: {
    flexDirection: 'row',
    padding: 12,
    gap: 12,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#1e293b',
    gap: 8,
  },
  tabActive: {
    backgroundColor: '#3b82f6',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#94a3b8',
  },
  tabTextActive: {
    color: '#fff',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  filterSection: {
    backgroundColor: '#1e293b',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  filterDropdown: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0f172a',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  filterActive: {
    borderColor: '#3b82f6',
  },
  filterText: {
    fontSize: 14,
    color: '#e2e8f0',
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  searchButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  profilesList: {
    flex: 1,
  },
  profileCard: {
    backgroundColor: '#1e293b',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 12,
  },
  profileName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
  },
  profileMeta: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 2,
  },
  profileRegiment: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  profileBio: {
    fontSize: 14,
    color: '#cbd5e1',
    lineHeight: 20,
    marginBottom: 12,
  },
  interestsTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  interestTag: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  interestText: {
    fontSize: 12,
    color: '#94a3b8',
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1e3a5f',
    padding: 10,
    borderRadius: 8,
    gap: 6,
  },
  connectText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 15,
    color: '#94a3b8',
    marginTop: 8,
  },
  signupPrompt: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginTop: 24,
  },
  signupPromptText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  signupForm: {
    flex: 1,
  },
  gdprNotice: {
    backgroundColor: '#1e3a5f',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  gdprTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
    marginTop: 10,
  },
  gdprText: {
    fontSize: 13,
    color: '#93c5fd',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94a3b8',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#334155',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  pickerScroll: {
    marginBottom: 8,
  },
  pickerWrapper: {
    flexDirection: 'row',
    gap: 8,
  },
  pickerWrapperWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pickerOption: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
  },
  pickerOptionSelected: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  pickerOptionText: {
    fontSize: 13,
    color: '#94a3b8',
  },
  pickerOptionTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  consentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 20,
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#475569',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#22c55e',
    borderColor: '#22c55e',
  },
  consentText: {
    flex: 1,
    fontSize: 13,
    color: '#94a3b8',
    lineHeight: 20,
  },
  submitButton: {
    backgroundColor: '#22c55e',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  buttonDisabled: {
    backgroundColor: '#475569',
  },
});
