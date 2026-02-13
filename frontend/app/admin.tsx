import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from './context/AuthContext';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'https://veterans-support-api.onrender.com';

interface Counsellor {
  id: string;
  name: string;
  specialization: string;
  status: string;
  phone: string;
  sms?: string;
  whatsapp?: string;
}

interface PeerSupporter {
  id: string;
  firstName: string;
  area: string;
  background: string;
  yearsServed: string;
  status: string;
  phone: string;
  sms?: string;
  whatsapp?: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'counsellors' | 'peers' | 'users'>('counsellors');
  const [counsellors, setCounsellors] = useState<Counsellor[]>([]);
  const [peers, setPeers] = useState<PeerSupporter[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const { user, token, logout } = useAuth();
  const router = useRouter();

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    specialization: '',
    phone: '',
    sms: '',
    whatsapp: '',
    firstName: '',
    area: '',
    background: '',
    yearsServed: '',
  });

  const [userFormData, setUserFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'counsellor',
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.replace('/login');
      return;
    }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [counsellorsRes, peersRes] = await Promise.all([
        fetch(`${API_URL}/api/counsellors`),
        fetch(`${API_URL}/api/peer-supporters`),
      ]);
      
      if (counsellorsRes.ok) setCounsellors(await counsellorsRes.json());
      if (peersRes.ok) setPeers(await peersRes.json());
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCounsellor = async () => {
    try {
      const response = await fetch(`${API_URL}/api/counsellors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          specialization: formData.specialization,
          phone: formData.phone,
          sms: formData.sms || null,
          whatsapp: formData.whatsapp || null,
        }),
      });

      if (response.ok) {
        Alert.alert('Success', 'Counsellor added successfully');
        setShowAddModal(false);
        resetForm();
        fetchData();
      } else {
        const error = await response.json();
        Alert.alert('Error', error.detail || 'Failed to add counsellor');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error');
    }
  };

  const handleAddPeer = async () => {
    try {
      const response = await fetch(`${API_URL}/api/peer-supporters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          area: formData.area,
          background: formData.background,
          yearsServed: formData.yearsServed,
          phone: formData.phone,
          sms: formData.sms || null,
          whatsapp: formData.whatsapp || null,
        }),
      });

      if (response.ok) {
        Alert.alert('Success', 'Peer supporter added successfully');
        setShowAddModal(false);
        resetForm();
        fetchData();
      } else {
        const error = await response.json();
        Alert.alert('Error', error.detail || 'Failed to add peer supporter');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error');
    }
  };

  const handleCreateUser = async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(userFormData),
      });

      if (response.ok) {
        Alert.alert('Success', `User account created for ${userFormData.email}`);
        setShowUserModal(false);
        setUserFormData({ email: '', password: '', name: '', role: 'counsellor' });
      } else {
        const error = await response.json();
        Alert.alert('Error', error.detail || 'Failed to create user');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error');
    }
  };

  const handleDelete = async (type: 'counsellor' | 'peer', id: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this record?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const endpoint = type === 'counsellor' ? 'counsellors' : 'peer-supporters';
              const response = await fetch(`${API_URL}/api/${endpoint}/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
              });
              if (response.ok) {
                fetchData();
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete');
            }
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setFormData({
      name: '',
      specialization: '',
      phone: '',
      sms: '',
      whatsapp: '',
      firstName: '',
      area: '',
      background: '',
      yearsServed: '',
    });
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return '#22c55e';
      case 'busy': case 'limited': return '#f59e0b';
      default: return '#ef4444';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Admin Dashboard</Text>
          <Text style={styles.subtitle}>Welcome, {user?.name}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="#ef4444" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'counsellors' && styles.activeTab]}
          onPress={() => setActiveTab('counsellors')}
        >
          <Text style={[styles.tabText, activeTab === 'counsellors' && styles.activeTabText]}>
            Counsellors
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'peers' && styles.activeTab]}
          onPress={() => setActiveTab('peers')}
        >
          <Text style={[styles.tabText, activeTab === 'peers' && styles.activeTabText]}>
            Peers
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Ionicons name="add" size={20} color="#ffffff" />
          <Text style={styles.addButtonText}>
            Add {activeTab === 'counsellors' ? 'Counsellor' : 'Peer'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.userButton}
          onPress={() => setShowUserModal(true)}
        >
          <Ionicons name="person-add" size={20} color="#ffffff" />
          <Text style={styles.addButtonText}>Create Login</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#4a90d9" />
        </View>
      ) : (
        <ScrollView style={styles.list}>
          {activeTab === 'counsellors' ? (
            counsellors.length === 0 ? (
              <Text style={styles.emptyText}>No counsellors added yet</Text>
            ) : (
              counsellors.map((c) => (
                <View key={c.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardName}>{c.name}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(c.status) }]}>
                      <Text style={styles.statusText}>{c.status}</Text>
                    </View>
                  </View>
                  <Text style={styles.cardDetail}>{c.specialization}</Text>
                  <Text style={styles.cardDetail}>{c.phone}</Text>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDelete('counsellor', c.id)}
                  >
                    <Ionicons name="trash-outline" size={18} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              ))
            )
          ) : (
            peers.length === 0 ? (
              <Text style={styles.emptyText}>No peer supporters added yet</Text>
            ) : (
              peers.map((p) => (
                <View key={p.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardName}>{p.firstName}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(p.status) }]}>
                      <Text style={styles.statusText}>{p.status}</Text>
                    </View>
                  </View>
                  <Text style={styles.cardDetail}>{p.area} - {p.background}</Text>
                  <Text style={styles.cardDetail}>{p.yearsServed} years served</Text>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDelete('peer', p.id)}
                  >
                    <Ionicons name="trash-outline" size={18} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              ))
            )
          )}
        </ScrollView>
      )}

      {/* Add Counsellor/Peer Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Add {activeTab === 'counsellors' ? 'Counsellor' : 'Peer Supporter'}
              </Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              {activeTab === 'counsellors' ? (
                <>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Name"
                    placeholderTextColor="#8899a6"
                    value={formData.name}
                    onChangeText={(text) => setFormData({ ...formData, name: text })}
                  />
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Specialization (e.g., PTSD Support)"
                    placeholderTextColor="#8899a6"
                    value={formData.specialization}
                    onChangeText={(text) => setFormData({ ...formData, specialization: text })}
                  />
                </>
              ) : (
                <>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="First Name"
                    placeholderTextColor="#8899a6"
                    value={formData.firstName}
                    onChangeText={(text) => setFormData({ ...formData, firstName: text })}
                  />
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Area (e.g., London)"
                    placeholderTextColor="#8899a6"
                    value={formData.area}
                    onChangeText={(text) => setFormData({ ...formData, area: text })}
                  />
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Background (e.g., Royal Marines)"
                    placeholderTextColor="#8899a6"
                    value={formData.background}
                    onChangeText={(text) => setFormData({ ...formData, background: text })}
                  />
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Years Served"
                    placeholderTextColor="#8899a6"
                    value={formData.yearsServed}
                    onChangeText={(text) => setFormData({ ...formData, yearsServed: text })}
                  />
                </>
              )}
              <TextInput
                style={styles.modalInput}
                placeholder="Phone Number"
                placeholderTextColor="#8899a6"
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
              />
              <TextInput
                style={styles.modalInput}
                placeholder="SMS Number (optional)"
                placeholderTextColor="#8899a6"
                value={formData.sms}
                onChangeText={(text) => setFormData({ ...formData, sms: text })}
              />
              <TextInput
                style={styles.modalInput}
                placeholder="WhatsApp Number (optional)"
                placeholderTextColor="#8899a6"
                value={formData.whatsapp}
                onChangeText={(text) => setFormData({ ...formData, whatsapp: text })}
              />
            </ScrollView>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={activeTab === 'counsellors' ? handleAddCounsellor : handleAddPeer}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Create User Modal */}
      <Modal visible={showUserModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Login Account</Text>
              <TouchableOpacity onPress={() => setShowUserModal(false)}>
                <Ionicons name="close" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <TextInput
                style={styles.modalInput}
                placeholder="Name"
                placeholderTextColor="#8899a6"
                value={userFormData.name}
                onChangeText={(text) => setUserFormData({ ...userFormData, name: text })}
              />
              <TextInput
                style={styles.modalInput}
                placeholder="Email"
                placeholderTextColor="#8899a6"
                value={userFormData.email}
                onChangeText={(text) => setUserFormData({ ...userFormData, email: text })}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TextInput
                style={styles.modalInput}
                placeholder="Password"
                placeholderTextColor="#8899a6"
                value={userFormData.password}
                onChangeText={(text) => setUserFormData({ ...userFormData, password: text })}
                secureTextEntry
              />
              <View style={styles.roleSelector}>
                <Text style={styles.roleLabel}>Role:</Text>
                <TouchableOpacity
                  style={[styles.roleButton, userFormData.role === 'counsellor' && styles.roleButtonActive]}
                  onPress={() => setUserFormData({ ...userFormData, role: 'counsellor' })}
                >
                  <Text style={styles.roleButtonText}>Counsellor</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.roleButton, userFormData.role === 'peer' && styles.roleButtonActive]}
                  onPress={() => setUserFormData({ ...userFormData, role: 'peer' })}
                >
                  <Text style={styles.roleButtonText}>Peer</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            <TouchableOpacity style={styles.saveButton} onPress={handleCreateUser}>
              <Text style={styles.saveButtonText}>Create Account</Text>
            </TouchableOpacity>
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
  tabs: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#243447',
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#4a90d9',
  },
  tabText: {
    color: '#8899a6',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#ffffff',
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  addButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#22c55e',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  userButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8b5cf6',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    flex: 1,
    paddingHorizontal: 16,
  },
  emptyText: {
    color: '#8899a6',
    textAlign: 'center',
    marginTop: 40,
  },
  card: {
    backgroundColor: '#243447',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  cardDetail: {
    color: '#8899a6',
    marginBottom: 4,
  },
  deleteButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1a2332',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  modalForm: {
    maxHeight: 400,
  },
  modalInput: {
    backgroundColor: '#243447',
    borderRadius: 8,
    padding: 14,
    color: '#ffffff',
    marginBottom: 12,
  },
  roleSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  roleLabel: {
    color: '#ffffff',
    fontSize: 16,
  },
  roleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#243447',
    borderRadius: 8,
  },
  roleButtonActive: {
    backgroundColor: '#4a90d9',
  },
  roleButtonText: {
    color: '#ffffff',
  },
  saveButton: {
    backgroundColor: '#4a90d9',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
