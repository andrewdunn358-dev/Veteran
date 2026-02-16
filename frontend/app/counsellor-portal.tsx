import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';

const API_URL = 'https://veterans-support-api.onrender.com';

interface Counsellor {
  id: string;
  name: string;
  specialization: string;
  status: string;
  phone: string;
}

export default function CounsellorPortal() {
  const [counsellor, setCounsellor] = useState<Counsellor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const { user, token, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user || user.role !== 'counsellor') {
      router.replace('/login');
      return;
    }
    fetchCounsellor();
  }, [user]);

  const fetchCounsellor = async () => {
    try {
      const response = await fetch(`${API_URL}/api/counsellors`);
      if (response.ok) {
        const counsellors = await response.json();
        // Find counsellor linked to this user
        const myCounsellor = counsellors.find((c: any) => c.user_id === user?.id);
        if (myCounsellor) {
          setCounsellor(myCounsellor);
        } else {
          // If no linked counsellor, show first one for demo
          // In production, you'd want proper user-counsellor linking
          Alert.alert('Notice', 'No counsellor profile linked to your account. Contact admin.');
        }
      }
    } catch (error) {
      console.error('Error fetching counsellor:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    if (!counsellor) return;
    
    setIsUpdating(true);
    try {
      const response = await fetch(`${API_URL}/api/counsellors/${counsellor.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setCounsellor({ ...counsellor, status: newStatus });
        Alert.alert('Success', `Status updated to ${newStatus}`);
      } else {
        const error = await response.json();
        Alert.alert('Error', error.detail || 'Failed to update status');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return '#22c55e';
      case 'busy': return '#f59e0b';
      default: return '#ef4444';
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#4a90d9" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Counsellor Portal</Text>
          <Text style={styles.subtitle}>Welcome, {user?.name}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="#ef4444" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.profileCard}>
          <Ionicons name="person-circle" size={80} color="#4a90d9" />
          <Text style={styles.profileName}>{counsellor?.name || user?.name}</Text>
          <Text style={styles.profileDetail}>{counsellor?.specialization || 'Counsellor'}</Text>
          
          <View style={styles.currentStatus}>
            <Text style={styles.statusLabel}>Current Status:</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(counsellor?.status || 'off') }]}>
              <Text style={styles.statusText}>{counsellor?.status || 'Not Set'}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Update Your Status</Text>

        <View style={styles.statusButtons}>
          <TouchableOpacity
            style={[styles.statusButton, styles.availableButton]}
            onPress={() => updateStatus('available')}
            disabled={isUpdating}
          >
            <Ionicons name="checkmark-circle" size={32} color="#ffffff" />
            <Text style={styles.statusButtonText}>Available</Text>
            <Text style={styles.statusButtonSubtext}>Ready to help</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.statusButton, styles.busyButton]}
            onPress={() => updateStatus('busy')}
            disabled={isUpdating}
          >
            <Ionicons name="time" size={32} color="#ffffff" />
            <Text style={styles.statusButtonText}>Busy</Text>
            <Text style={styles.statusButtonSubtext}>In a session</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.statusButton, styles.offButton]}
            onPress={() => updateStatus('off')}
            disabled={isUpdating}
          >
            <Ionicons name="moon" size={32} color="#ffffff" />
            <Text style={styles.statusButtonText}>Off Duty</Text>
            <Text style={styles.statusButtonSubtext}>Not available</Text>
          </TouchableOpacity>
        </View>

        {isUpdating && (
          <View style={styles.updatingOverlay}>
            <ActivityIndicator color="#4a90d9" />
            <Text style={styles.updatingText}>Updating...</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a2332',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#243447',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 14,
    color: '#8899a6',
    marginTop: 4,
  },
  logoutButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  profileCard: {
    backgroundColor: '#243447',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 12,
  },
  profileDetail: {
    fontSize: 16,
    color: '#8899a6',
    marginTop: 4,
  },
  currentStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 12,
  },
  statusLabel: {
    color: '#8899a6',
    fontSize: 16,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#ffffff',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  statusButtons: {
    gap: 12,
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    gap: 16,
  },
  availableButton: {
    backgroundColor: '#22c55e',
  },
  busyButton: {
    backgroundColor: '#f59e0b',
  },
  offButton: {
    backgroundColor: '#ef4444',
  },
  statusButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  statusButtonSubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginLeft: 'auto',
  },
  updatingOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    gap: 12,
  },
  updatingText: {
    color: '#8899a6',
  },
});
