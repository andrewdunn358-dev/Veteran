import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  ScrollView,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';

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

interface CallbackRequest {
  id: string;
  name: string;
  phone: string;
  email?: string;
  message: string;
  request_type: string;
  status: string;
  assigned_to?: string;
  assigned_name?: string;
  created_at: string;
}

export default function PeerPortal() {
  const [peer, setPeer] = useState<PeerSupporter | null>(null);
  const [callbacks, setCallbacks] = useState<CallbackRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showPanicModal, setShowPanicModal] = useState(false);
  const [panicSubmitting, setPanicSubmitting] = useState(false);
  const [panicMessage, setPanicMessage] = useState('');
  const { user, token, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user || user.role !== 'peer') {
      router.replace('/login');
      return;
    }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch peer profile
      const peersResponse = await fetch(`${API_URL}/api/peer-supporters`);
      if (peersResponse.ok) {
        const peers = await peersResponse.json();
        const myPeer = peers.find((p: any) => p.user_id === user?.id);
        if (myPeer) {
          setPeer(myPeer);
        }
      }
      
      // Fetch callback requests assigned to peer
      const callbacksResponse = await fetch(`${API_URL}/api/callbacks`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (callbacksResponse.ok) {
        const data = await callbacksResponse.json();
        setCallbacks(data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
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

  const takeCallback = async (callbackId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/callbacks/${callbackId}/take`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        Alert.alert('Success', 'Callback assigned to you');
        fetchData();
      } else {
        const error = await response.json();
        Alert.alert('Error', error.detail || 'Failed to take callback');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error');
    }
  };

  const releaseCallback = async (callbackId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/callbacks/${callbackId}/release`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        Alert.alert('Success', 'Callback released');
        fetchData();
      }
    } catch (error) {
      Alert.alert('Error', 'Network error');
    }
  };

  const completeCallback = async (callbackId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/callbacks/${callbackId}/complete`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        Alert.alert('Success', 'Callback marked as complete');
        fetchData();
      }
    } catch (error) {
      Alert.alert('Error', 'Network error');
    }
  };

  const submitPanicAlert = async () => {
    setPanicSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/api/panic-alert`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          user_name: user?.name || peer?.firstName,
          user_phone: peer?.phone,
          message: panicMessage || 'Peer supporter needs immediate counsellor assistance',
        }),
      });

      if (response.ok) {
        setShowPanicModal(false);
        setPanicMessage('');
        Alert.alert(
          'Alert Sent',
          'A counsellor has been notified and will assist you shortly.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', 'Could not send alert. Please try again or call directly.');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please call a counsellor directly.');
    } finally {
      setPanicSubmitting(false);
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

  const getCallbackStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'in_progress': return '#4a90d9';
      case 'completed': return '#22c55e';
      default: return '#8899a6';
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#4a90d9" />
      </SafeAreaView>
    );
  }

  const pendingCallbacks = callbacks.filter(c => c.status === 'pending');
  const myCallbacks = callbacks.filter(c => c.assigned_to === user?.id && c.status === 'in_progress');

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

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* PANIC BUTTON - Always visible */}
        <TouchableOpacity 
          style={styles.panicButton}
          onPress={() => setShowPanicModal(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="warning" size={28} color="#ffffff" />
          <View style={styles.panicTextContainer}>
            <Text style={styles.panicButtonText}>NEED COUNSELLOR HELP</Text>
            <Text style={styles.panicButtonSubtext}>Alert a counsellor for assistance</Text>
          </View>
        </TouchableOpacity>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <Ionicons name="people-circle" size={60} color="#22c55e" />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{peer?.firstName || user?.name}</Text>
            <Text style={styles.profileDetail}>
              {peer ? `${peer.background}` : 'Peer Supporter'}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(peer?.status || 'unavailable') }]}>
            <Text style={styles.statusText}>{peer?.status || 'Not Set'}</Text>
          </View>
        </View>

        {/* Status Update Buttons */}
        <Text style={styles.sectionTitle}>Your Status</Text>
        <View style={styles.statusButtonsRow}>
          <TouchableOpacity
            style={[styles.statusButtonSmall, peer?.status === 'available' && styles.statusButtonActive, { backgroundColor: '#22c55e' }]}
            onPress={() => updateStatus('available')}
            disabled={isUpdating}
          >
            <Ionicons name="checkmark-circle" size={20} color="#ffffff" />
            <Text style={styles.statusButtonSmallText}>Available</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.statusButtonSmall, peer?.status === 'limited' && styles.statusButtonActive, { backgroundColor: '#f59e0b' }]}
            onPress={() => updateStatus('limited')}
            disabled={isUpdating}
          >
            <Ionicons name="time" size={20} color="#ffffff" />
            <Text style={styles.statusButtonSmallText}>Limited</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.statusButtonSmall, peer?.status === 'unavailable' && styles.statusButtonActive, { backgroundColor: '#ef4444' }]}
            onPress={() => updateStatus('unavailable')}
            disabled={isUpdating}
          >
            <Ionicons name="close-circle" size={20} color="#ffffff" />
            <Text style={styles.statusButtonSmallText}>Unavailable</Text>
          </TouchableOpacity>
        </View>

        {/* My Active Callbacks */}
        {myCallbacks.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Your Active Callbacks</Text>
            {myCallbacks.map((callback) => (
              <View key={callback.id} style={styles.callbackCard}>
                <View style={styles.callbackHeader}>
                  <Text style={styles.callbackName}>{callback.name}</Text>
                  <View style={[styles.callbackStatusBadge, { backgroundColor: getCallbackStatusColor(callback.status) }]}>
                    <Text style={styles.callbackStatusText}>{callback.status.replace('_', ' ')}</Text>
                  </View>
                </View>
                <Text style={styles.callbackPhone}>{callback.phone}</Text>
                <Text style={styles.callbackMessage} numberOfLines={2}>{callback.message}</Text>
                <View style={styles.callbackActions}>
                  <TouchableOpacity 
                    style={styles.callbackActionButton}
                    onPress={() => completeCallback(callback.id)}
                  >
                    <Ionicons name="checkmark" size={18} color="#22c55e" />
                    <Text style={[styles.callbackActionText, { color: '#22c55e' }]}>Complete</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.callbackActionButton}
                    onPress={() => releaseCallback(callback.id)}
                  >
                    <Ionicons name="arrow-undo" size={18} color="#f59e0b" />
                    <Text style={[styles.callbackActionText, { color: '#f59e0b' }]}>Release</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        )}

        {/* Pending Callbacks */}
        <Text style={styles.sectionTitle}>
          Pending Callbacks {pendingCallbacks.length > 0 && `(${pendingCallbacks.length})`}
        </Text>
        {pendingCallbacks.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle" size={32} color="#22c55e" />
            <Text style={styles.emptyStateText}>No pending callbacks</Text>
          </View>
        ) : (
          pendingCallbacks.map((callback) => (
            <View key={callback.id} style={styles.callbackCard}>
              <View style={styles.callbackHeader}>
                <Text style={styles.callbackName}>{callback.name}</Text>
                <View style={[styles.callbackStatusBadge, { backgroundColor: getCallbackStatusColor(callback.status) }]}>
                  <Text style={styles.callbackStatusText}>Pending</Text>
                </View>
              </View>
              <Text style={styles.callbackPhone}>{callback.phone}</Text>
              <Text style={styles.callbackMessage} numberOfLines={2}>{callback.message}</Text>
              <Text style={styles.callbackTime}>
                {new Date(callback.created_at).toLocaleString()}
              </Text>
              <TouchableOpacity 
                style={styles.takeCallbackButton}
                onPress={() => takeCallback(callback.id)}
              >
                <Ionicons name="hand-left" size={18} color="#ffffff" />
                <Text style={styles.takeCallbackText}>Take This Callback</Text>
              </TouchableOpacity>
            </View>
          ))
        )}

        {isUpdating && (
          <View style={styles.updatingOverlay}>
            <ActivityIndicator color="#4a90d9" />
            <Text style={styles.updatingText}>Updating...</Text>
          </View>
        )}
      </ScrollView>

      {/* Panic Modal */}
      <Modal visible={showPanicModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Ionicons name="warning" size={32} color="#ef4444" />
              <Text style={styles.modalTitle}>Alert Counsellor</Text>
            </View>
            
            <Text style={styles.modalSubtext}>
              A counsellor will be notified immediately to assist you with your current call.
            </Text>

            <TextInput
              style={styles.modalInput}
              placeholder="What do you need help with? (optional)"
              placeholderTextColor="#8899a6"
              value={panicMessage}
              onChangeText={setPanicMessage}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalCancelButton}
                onPress={() => setShowPanicModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.modalSendButton}
                onPress={submitPanicAlert}
                disabled={panicSubmitting}
              >
                {panicSubmitting ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <>
                    <Ionicons name="send" size={18} color="#ffffff" />
                    <Text style={styles.modalSendText}>Send Alert</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
