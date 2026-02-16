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

import { Platform } from 'react-native';

const API_URL = Platform.select({
  web: process.env.EXPO_PUBLIC_BACKEND_URL || '',
  default: process.env.EXPO_PUBLIC_BACKEND_URL || ''
});

interface PeerSupporter {
  id: string;
  firstName: string;
  area: string;
  background: string;
  yearsServed: string;
  status: string;
  phone: string;
}

export default function PeerPortal() {
  const [peer, setPeer] = useState<PeerSupporter | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const { user, token, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user || user.role !== 'peer') {
      router.replace('/login');
      return;
    }
    fetchPeer();
  }, [user]);

  const fetchPeer = async () => {
    try {
      const response = await fetch(`${API_URL}/api/peer-supporters`);
      if (response.ok) {
        const peers = await response.json();
        // Find peer linked to this user
        const myPeer = peers.find((p: any) => p.user_id === user?.id);
        if (myPeer) {
          setPeer(myPeer);
        } else {
          Alert.alert('Notice', 'No peer profile linked to your account. Contact admin.');
        }
      }
    } catch (error) {
      console.error('Error fetching peer:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    if (!peer) return;
    
    setIsUpdating(true);
    try {
      const response = await fetch(`${API_URL}/api/peer-supporters/${peer.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setPeer({ ...peer, status: newStatus });
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
      case 'limited': return '#f59e0b';
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
          <Text style={styles.title}>Peer Support Portal</Text>
          <Text style={styles.subtitle}>Welcome, {user?.name}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="#ef4444" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.profileCard}>
          <Ionicons name="people-circle" size={80} color="#22c55e" />
          <Text style={styles.profileName}>{peer?.firstName || user?.name}</Text>
          <Text style={styles.profileDetail}>
            {peer ? `${peer.background} - ${peer.yearsServed} years` : 'Peer Supporter'}
          </Text>
          {peer?.area && <Text style={styles.profileArea}>{peer.area}</Text>}
          
          <View style={styles.currentStatus}>
            <Text style={styles.statusLabel}>Current Status:</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(peer?.status || 'unavailable') }]}>
              <Text style={styles.statusText}>{peer?.status || 'Not Set'}</Text>
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
            <Text style={styles.statusButtonSubtext}>Ready to chat</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.statusButton, styles.limitedButton]}
            onPress={() => updateStatus('limited')}
            disabled={isUpdating}
          >
            <Ionicons name="time" size={32} color="#ffffff" />
            <Text style={styles.statusButtonText}>Limited</Text>
            <Text style={styles.statusButtonSubtext}>May be slow to respond</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.statusButton, styles.unavailableButton]}
            onPress={() => updateStatus('unavailable')}
            disabled={isUpdating}
          >
            <Ionicons name="close-circle" size={32} color="#ffffff" />
            <Text style={styles.statusButtonText}>Unavailable</Text>
            <Text style={styles.statusButtonSubtext}>Not taking calls</Text>
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
  profileArea: {
    fontSize: 14,
    color: '#4a90d9',
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
  limitedButton: {
    backgroundColor: '#f59e0b',
  },
  unavailableButton: {
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
