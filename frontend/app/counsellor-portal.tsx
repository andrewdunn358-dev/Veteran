import React, { useState, useEffect, useCallback } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';

const API_URL = Platform.select({
  web: process.env.EXPO_PUBLIC_BACKEND_URL || '',
  default: process.env.EXPO_PUBLIC_BACKEND_URL || ''
});

interface Counsellor {
  id: string;
  name: string;
  specialization: string;
  status: string;
  phone: string;
}

interface PanicAlert {
  id: string;
  user_name: string;
  user_phone: string;
  message: string;
  status: string;
  created_at: string;
  acknowledged_by?: string;
  acknowledged_name?: string;
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

export default function CounsellorPortal() {
  const [counsellor, setCounsellor] = useState<Counsellor | null>(null);
  const [panicAlerts, setPanicAlerts] = useState<PanicAlert[]>([]);
  const [callbacks, setCallbacks] = useState<CallbackRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const { user, token, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user || user.role !== 'counsellor') {
      router.replace('/login');
      return;
    }
    fetchData();
    
    // Poll for new alerts every 10 seconds
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const fetchData = useCallback(async () => {
    try {
      // Fetch counsellor profile
      const counsellorsResponse = await fetch(`${API_URL}/api/counsellors`);
      if (counsellorsResponse.ok) {
        const counsellors = await counsellorsResponse.json();
        const myCounsellor = counsellors.find((c: any) => c.user_id === user?.id);
        if (myCounsellor) {
          setCounsellor(myCounsellor);
        }
      }

      // Fetch panic alerts
      const alertsResponse = await fetch(`${API_URL}/api/panic-alerts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (alertsResponse.ok) {
        const alerts = await alertsResponse.json();
        setPanicAlerts(alerts);
      }

      // Fetch callback requests
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
  }, [user, token]);

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

  const acknowledgeAlert = async (alertId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/panic-alerts/${alertId}/acknowledge`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        Alert.alert('Success', 'Alert acknowledged - please contact the peer supporter');
        fetchData();
      }
    } catch (error) {
      Alert.alert('Error', 'Network error');
    }
  };

  const resolveAlert = async (alertId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/panic-alerts/${alertId}/resolve`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        Alert.alert('Success', 'Alert resolved');
        fetchData();
      }
    } catch (error) {
      Alert.alert('Error', 'Network error');
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

  const completeCallback = async (callbackId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/callbacks/${callbackId}/complete`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        Alert.alert('Success', 'Callback completed');
        fetchData();
      }
    } catch (error) {
      Alert.alert('Error', 'Network error');
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

  const activeAlerts = panicAlerts.filter(a => a.status === 'pending' || a.status === 'acknowledged');
  const pendingCallbacks = callbacks.filter(c => c.status === 'pending');
  const myCallbacks = callbacks.filter(c => c.assigned_to === user?.id && c.status === 'in_progress');

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

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* PANIC ALERTS - Priority display */}
        {activeAlerts.length > 0 && (
          <View style={styles.alertSection}>
            <View style={styles.alertHeader}>
              <Ionicons name="warning" size={24} color="#ef4444" />
              <Text style={styles.alertTitle}>PANIC ALERTS ({activeAlerts.length})</Text>
            </View>
            {activeAlerts.map((alert) => (
              <View key={alert.id} style={styles.alertCard}>
                <View style={styles.alertCardHeader}>
                  <Text style={styles.alertName}>{alert.user_name || 'Peer Supporter'}</Text>
                  <View style={[styles.alertStatusBadge, { backgroundColor: alert.status === 'pending' ? '#ef4444' : '#f59e0b' }]}>
                    <Text style={styles.alertStatusText}>{alert.status}</Text>
                  </View>
                </View>
                {alert.user_phone && (
                  <Text style={styles.alertPhone}>{alert.user_phone}</Text>
                )}
                <Text style={styles.alertMessage}>{alert.message || 'Peer needs immediate assistance'}</Text>
                <Text style={styles.alertTime}>
                  {new Date(alert.created_at).toLocaleString()}
                </Text>
                {alert.acknowledged_name && (
                  <Text style={styles.alertAcknowledged}>
                    Acknowledged by: {alert.acknowledged_name}
                  </Text>
                )}
                <View style={styles.alertActions}>
                  {alert.status === 'pending' && (
                    <TouchableOpacity 
                      style={styles.acknowledgeButton}
                      onPress={() => acknowledgeAlert(alert.id)}
                    >
                      <Ionicons name="hand-left" size={18} color="#ffffff" />
                      <Text style={styles.acknowledgeText}>Acknowledge</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity 
                    style={styles.resolveButton}
                    onPress={() => resolveAlert(alert.id)}
                  >
                    <Ionicons name="checkmark" size={18} color="#ffffff" />
                    <Text style={styles.resolveText}>Resolve</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <Ionicons name="person-circle" size={60} color="#4a90d9" />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{counsellor?.name || user?.name}</Text>
            <Text style={styles.profileDetail}>{counsellor?.specialization || 'Counsellor'}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(counsellor?.status || 'off') }]}>
            <Text style={styles.statusText}>{counsellor?.status || 'Not Set'}</Text>
          </View>
        </View>

        {/* Status Update */}
        <Text style={styles.sectionTitle}>Your Status</Text>
        <View style={styles.statusButtonsRow}>
          <TouchableOpacity
            style={[styles.statusButtonSmall, counsellor?.status === 'available' && styles.statusButtonActive, { backgroundColor: '#22c55e' }]}
            onPress={() => updateStatus('available')}
            disabled={isUpdating}
          >
            <Ionicons name="checkmark-circle" size={20} color="#ffffff" />
            <Text style={styles.statusButtonSmallText}>Available</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.statusButtonSmall, counsellor?.status === 'busy' && styles.statusButtonActive, { backgroundColor: '#f59e0b' }]}
            onPress={() => updateStatus('busy')}
            disabled={isUpdating}
          >
            <Ionicons name="time" size={20} color="#ffffff" />
            <Text style={styles.statusButtonSmallText}>Busy</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.statusButtonSmall, counsellor?.status === 'off' && styles.statusButtonActive, { backgroundColor: '#ef4444' }]}
            onPress={() => updateStatus('off')}
            disabled={isUpdating}
          >
            <Ionicons name="moon" size={20} color="#ffffff" />
            <Text style={styles.statusButtonSmallText}>Off</Text>
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
                  <View style={[styles.callbackStatusBadge, { backgroundColor: '#4a90d9' }]}>
                    <Text style={styles.callbackStatusText}>In Progress</Text>
                  </View>
                </View>
                <Text style={styles.callbackPhone}>{callback.phone}</Text>
                <Text style={styles.callbackMessage} numberOfLines={2}>{callback.message}</Text>
                <TouchableOpacity 
                  style={styles.completeButton}
                  onPress={() => completeCallback(callback.id)}
                >
                  <Ionicons name="checkmark" size={18} color="#ffffff" />
                  <Text style={styles.completeText}>Mark Complete</Text>
                </TouchableOpacity>
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
                <View style={[styles.callbackStatusBadge, { backgroundColor: '#f59e0b' }]}>
                  <Text style={styles.callbackStatusText}>Pending</Text>
                </View>
              </View>
              <Text style={styles.callbackPhone}>{callback.phone}</Text>
              <Text style={styles.callbackMessage} numberOfLines={2}>{callback.message}</Text>
              <Text style={styles.callbackTime}>
                {new Date(callback.created_at).toLocaleString()}
              </Text>
              <TouchableOpacity 
                style={styles.takeButton}
                onPress={() => takeCallback(callback.id)}
              >
                <Ionicons name="hand-left" size={18} color="#ffffff" />
                <Text style={styles.takeText}>Take This Callback</Text>
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
