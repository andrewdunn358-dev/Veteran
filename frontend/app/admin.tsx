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
import { useAuth } from '../src/context/AuthContext';
import { Toast } from '../src/components/Toast';

const API_URL = 'https://veterans-support-api.onrender.com';

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

interface Organization {
  id: string;
  name: string;
  description: string;
  phone: string;
  sms?: string;
  whatsapp?: string;
}

interface Resource {
  id: string;
  title: string;
  description?: string;
  category: string;
  content?: string;
  link?: string;
  image_url?: string;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'counsellors' | 'peers' | 'orgs' | 'resources' | 'users' | 'content' | 'metrics' | 'callbacks' | 'alerts'>('counsellors');
  const [counsellors, setCounsellors] = useState<Counsellor[]>([]);
  const [peers, setPeers] = useState<PeerSupporter[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [content, setContent] = useState<Record<string, Record<string, string>>>({});
  const [callMetrics, setCallMetrics] = useState<any>(null);
  const [callbacks, setCallbacks] = useState<any[]>([]);
  const [panicAlerts, setPanicAlerts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showContentModal, setShowContentModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<{ type: 'counsellor' | 'peer'; id: string; name: string; currentStatus: string } | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editingContent, setEditingContent] = useState({ page: '', section: '', value: '' });
  const { user, token, logout } = useAuth();
  const router = useRouter();

  // Toast state
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' | 'info' }>({
    visible: false,
    message: '',
    type: 'success',
  });

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ visible: true, message, type });
  };

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
    // User account fields
    createAccount: false,
    email: '',
    password: '',
    // Organization fields
    description: '',
  });

  const [userFormData, setUserFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'counsellor',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [resetPassword, setResetPassword] = useState('');

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
      const [counsellorsRes, peersRes, orgsRes, resourcesRes, usersRes, contentRes, metricsRes] = await Promise.all([
        fetch(`${API_URL}/api/counsellors`),
        fetch(`${API_URL}/api/peer-supporters`),
        fetch(`${API_URL}/api/organizations`),
        fetch(`${API_URL}/api/resources`),
        fetch(`${API_URL}/api/auth/users`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_URL}/api/content`),
        fetch(`${API_URL}/api/call-logs`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
      ]);
      
      if (counsellorsRes.ok) setCounsellors(await counsellorsRes.json());
      if (peersRes.ok) setPeers(await peersRes.json());
      if (orgsRes.ok) setOrganizations(await orgsRes.json());
      if (resourcesRes.ok) setResources(await resourcesRes.json());
      if (usersRes.ok) setUsers(await usersRes.json());
      if (contentRes.ok) setContent(await contentRes.json());
      if (metricsRes.ok) setCallMetrics(await metricsRes.json());
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCounsellor = async () => {
    try {
      // First create user account if requested
      let userId = null;
      if (formData.createAccount && formData.email && formData.password) {
        const userResponse = await fetch(`${API_URL}/api/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            name: formData.name,
            role: 'counsellor',
          }),
        });

        if (!userResponse.ok) {
          const error = await userResponse.json();
          Alert.alert('Error', error.detail || 'Failed to create user account');
          return;
        }
        const userData = await userResponse.json();
        userId = userData.id;
      }

      // Then create counsellor profile
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
          user_id: userId,
        }),
      });

      if (response.ok) {
        showToast(formData.createAccount 
          ? 'Counsellor added with login account' 
          : 'Counsellor added successfully', 'success');
        setShowAddModal(false);
        resetForm();
        fetchData();
      } else {
        const error = await response.json();
        showToast(error.detail || 'Failed to add counsellor', 'error');
      }
    } catch (error) {
      showToast('Network error', 'error');
    }
  };

  const handleAddPeer = async () => {
    try {
      // First create user account if requested
      let userId = null;
      if (formData.createAccount && formData.email && formData.password) {
        const userResponse = await fetch(`${API_URL}/api/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            name: formData.firstName,
            role: 'peer',
          }),
        });

        if (!userResponse.ok) {
          const error = await userResponse.json();
          Alert.alert('Error', error.detail || 'Failed to create user account');
          return;
        }
        const userData = await userResponse.json();
        userId = userData.id;
      }

      // Then create peer supporter profile
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
          user_id: userId,
        }),
      });

      if (response.ok) {
        showToast(formData.createAccount 
          ? 'Peer supporter added with login account' 
          : 'Peer supporter added successfully', 'success');
        setShowAddModal(false);
        resetForm();
        fetchData();
      } else {
        const error = await response.json();
        showToast(error.detail || 'Failed to add peer supporter', 'error');
      }
    } catch (error) {
      showToast('Network error', 'error');
    }
  };

  const handleAddOrganization = async () => {
    try {
      const response = await fetch(`${API_URL}/api/organizations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          phone: formData.phone,
          sms: formData.sms || null,
          whatsapp: formData.whatsapp || null,
        }),
      });

      if (response.ok) {
        showToast('Organization added successfully', 'success');
        setShowAddModal(false);
        resetForm();
        fetchData();
      } else {
        const error = await response.json();
        showToast(error.detail || 'Failed to add organization', 'error');
      }
    } catch (error) {
      showToast('Network error', 'error');
    }
  };

  const handleSeedOrganizations = async () => {
    try {
      const response = await fetch(`${API_URL}/api/organizations/seed`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        showToast(data.message, 'success');
        fetchData();
      } else {
        showToast('Failed to seed organizations', 'error');
      }
    } catch (error) {
      showToast('Network error', 'error');
    }
  };

  const handleAddResource = async () => {
    try {
      const response = await fetch(`${API_URL}/api/resources`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.name,
          description: formData.description,
          category: formData.specialization || 'General',
          link: formData.whatsapp || null,
        }),
      });

      if (response.ok) {
        showToast('Resource added successfully', 'success');
        setShowAddModal(false);
        resetForm();
        fetchData();
      } else {
        const error = await response.json();
        showToast(error.detail || 'Failed to add resource', 'error');
      }
    } catch (error) {
      showToast('Network error', 'error');
    }
  };

  const handleSeedResources = async () => {
    try {
      const response = await fetch(`${API_URL}/api/resources/seed`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        showToast(data.message, 'success');
        fetchData();
      } else {
        showToast('Failed to seed resources', 'error');
      }
    } catch (error) {
      showToast('Network error', 'error');
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
        showToast(`User account created for ${userFormData.email}`, 'success');
        setShowUserModal(false);
        setUserFormData({ email: '', password: '', name: '', role: 'counsellor' });
        fetchData();
      } else {
        const error = await response.json();
        showToast(error.detail || 'Failed to create user', 'error');
      }
    } catch (error) {
      showToast('Network error', 'error');
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: passwordData.currentPassword,
          new_password: passwordData.newPassword,
        }),
      });

      if (response.ok) {
        showToast('Password changed successfully', 'success');
        setShowPasswordModal(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        const error = await response.json();
        showToast(error.detail || 'Failed to change password', 'error');
      }
    } catch (error) {
      showToast('Network error', 'error');
    }
  };

  const handleResetUserPassword = async () => {
    if (!selectedUser || !resetPassword) return;

    try {
      const response = await fetch(`${API_URL}/api/auth/admin-reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: selectedUser.id,
          new_password: resetPassword,
        }),
      });

      if (response.ok) {
        showToast(`Password reset for ${selectedUser.email}`, 'success');
        setShowResetModal(false);
        setSelectedUser(null);
        setResetPassword('');
      } else {
        const error = await response.json();
        showToast(error.detail || 'Failed to reset password', 'error');
      }
    } catch (error) {
      showToast('Network error', 'error');
    }
  };

  const handleUpdateContent = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/content/${editingContent.page}/${editingContent.section}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ content: editingContent.value }),
        }
      );

      if (response.ok) {
        showToast('Content updated successfully', 'success');
        setShowContentModal(false);
        fetchData();
      } else {
        const error = await response.json();
        showToast(error.detail || 'Failed to update content', 'error');
      }
    } catch (error) {
      showToast('Network error', 'error');
    }
  };

  const handleSeedContent = async () => {
    try {
      const response = await fetch(`${API_URL}/api/content/seed`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        showToast('Default content created', 'success');
        fetchData();
      }
    } catch (error) {
      showToast('Failed to seed content', 'error');
    }
  };

  const handleDelete = async (type: 'counsellor' | 'peer' | 'org' | 'resource' | 'user', id: string) => {
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
              let endpoint = '';
              if (type === 'counsellor') endpoint = `counsellors/${id}`;
              else if (type === 'peer') endpoint = `peer-supporters/${id}`;
              else if (type === 'org') endpoint = `organizations/${id}`;
              else if (type === 'resource') endpoint = `resources/${id}`;
              else endpoint = `auth/users/${id}`;

              const response = await fetch(`${API_URL}/api/${endpoint}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
              });
              if (response.ok) {
                showToast('Deleted successfully', 'success');
                fetchData();
              }
            } catch (error) {
              showToast('Failed to delete', 'error');
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
      createAccount: false,
      email: '',
      password: '',
      description: '',
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

  const pageNames: Record<string, string> = {
    'home': 'Home Page',
    'crisis-support': 'Crisis Support',
    'peer-support': 'Peer Support',
    'historical-investigations': 'Historical Investigations',
    'organizations': 'Organizations',
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Toast Notification */}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast({ ...toast, visible: false })}
      />

      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Admin Dashboard</Text>
          <Text style={styles.subtitle}>Welcome, {user?.name}</Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity onPress={() => setShowPasswordModal(true)} style={styles.headerButton}>
            <Ionicons name="key-outline" size={20} color="#4a90d9" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} style={styles.headerButton}>
            <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer}>
        <View style={styles.tabs}>
          {(['counsellors', 'peers', 'orgs', 'resources', 'users', 'content', 'metrics'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {tab === 'content' ? 'CMS' : tab === 'metrics' ? 'Calls' : tab === 'orgs' ? 'Orgs' : tab === 'resources' ? 'Resources' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {activeTab !== 'content' && activeTab !== 'metrics' && activeTab !== 'resources' && (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
            <Ionicons name="add" size={20} color="#ffffff" />
            <Text style={styles.addButtonText}>
              Add New {activeTab === 'counsellors' ? 'Counsellor' : activeTab === 'peers' ? 'Peer Supporter' : activeTab === 'orgs' ? 'Organization' : 'User'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {activeTab === 'resources' && (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
            <Ionicons name="add" size={20} color="#ffffff" />
            <Text style={styles.addButtonText}>Add New Resource</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.seedButton, { marginLeft: 8 }]} onPress={handleSeedResources}>
            <Ionicons name="cloud-download" size={20} color="#ffffff" />
            <Text style={styles.addButtonText}>Load Defaults</Text>
          </TouchableOpacity>
        </View>
      )}

      {activeTab === 'orgs' && (
        <View style={[styles.actions, { marginTop: -8 }]}>
          <TouchableOpacity style={styles.seedButton} onPress={handleSeedOrganizations}>
            <Ionicons name="cloud-download" size={20} color="#ffffff" />
            <Text style={styles.addButtonText}>Load UK Support Orgs</Text>
          </TouchableOpacity>
        </View>
      )}

      {activeTab === 'content' && (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.seedButton} onPress={handleSeedContent}>
            <Ionicons name="refresh" size={20} color="#ffffff" />
            <Text style={styles.addButtonText}>Load Default Content</Text>
          </TouchableOpacity>
        </View>
      )}

      {activeTab === 'metrics' && (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.seedButton} onPress={fetchData}>
            <Ionicons name="refresh" size={20} color="#ffffff" />
            <Text style={styles.addButtonText}>Refresh Data</Text>
          </TouchableOpacity>
        </View>
      )}

      {isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#4a90d9" />
        </View>
      ) : (
        <ScrollView style={styles.list}>
          {activeTab === 'counsellors' && (
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
          )}

          {activeTab === 'peers' && (
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

          {activeTab === 'orgs' && (
            organizations.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="business" size={48} color="#7c9cbf" />
                <Text style={styles.emptyText}>No organizations added yet</Text>
                <Text style={styles.emptySubtext}>Click "Load UK Veteran Resources" to add default organizations</Text>
              </View>
            ) : (
              organizations.map((org) => (
                <View key={org.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardName}>{org.name}</Text>
                    <Ionicons name="shield-checkmark" size={20} color="#7c9cbf" />
                  </View>
                  <Text style={styles.cardDetail} numberOfLines={2}>{org.description}</Text>
                  <Text style={styles.cardDetail}>{org.phone}</Text>
                  {org.sms && <Text style={styles.cardDetailSmall}>SMS: {org.sms}</Text>}
                  {org.whatsapp && <Text style={styles.cardDetailSmall}>WhatsApp: {org.whatsapp}</Text>}
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDelete('org', org.id)}
                  >
                    <Ionicons name="trash-outline" size={18} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              ))
            )
          )}

          {activeTab === 'resources' && (
            resources.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="library" size={48} color="#7c9cbf" />
                <Text style={styles.emptyText}>No resources added yet</Text>
                <Text style={styles.emptySubtext}>Click "Load Defaults" to add starter resources</Text>
              </View>
            ) : (
              resources.map((res) => (
                <View key={res.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardName}>{res.title}</Text>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryText}>{res.category}</Text>
                    </View>
                  </View>
                  <Text style={styles.cardDetail} numberOfLines={2}>{res.description}</Text>
                  {res.link && <Text style={styles.cardDetailSmall}>Link: {res.link}</Text>}
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDelete('resource', res.id)}
                  >
                    <Ionicons name="trash-outline" size={18} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              ))
            )
          )}

          {activeTab === 'users' && (
            users.length === 0 ? (
              <Text style={styles.emptyText}>No users found</Text>
            ) : (
              users.map((u) => (
                <View key={u.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardName}>{u.name}</Text>
                    <View style={[styles.roleBadge, u.role === 'admin' && styles.adminBadge]}>
                      <Text style={styles.roleText}>{u.role}</Text>
                    </View>
                  </View>
                  <Text style={styles.cardDetail}>{u.email}</Text>
                  <View style={styles.cardActions}>
                    <TouchableOpacity
                      style={styles.resetButton}
                      onPress={() => {
                        setSelectedUser(u);
                        setShowResetModal(true);
                      }}
                    >
                      <Ionicons name="key-outline" size={16} color="#4a90d9" />
                      <Text style={styles.resetButtonText}>Reset Password</Text>
                    </TouchableOpacity>
                    {u.role !== 'admin' && (
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDelete('user', u.id)}
                      >
                        <Ionicons name="trash-outline" size={18} color="#ef4444" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))
            )
          )}

          {activeTab === 'content' && (
            Object.keys(content).length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No content found</Text>
                <Text style={styles.emptySubtext}>Click "Load Default Content" to get started</Text>
              </View>
            ) : (
              Object.entries(content).map(([pageName, sections]) => (
                <View key={pageName} style={styles.contentCard}>
                  <Text style={styles.contentPageTitle}>{pageNames[pageName] || pageName}</Text>
                  {Object.entries(sections).map(([section, value]) => (
                    <TouchableOpacity
                      key={section}
                      style={styles.contentItem}
                      onPress={() => {
                        setEditingContent({ page: pageName, section, value });
                        setShowContentModal(true);
                      }}
                    >
                      <Text style={styles.contentSection}>{section.replace(/_/g, ' ')}</Text>
                      <Text style={styles.contentValue} numberOfLines={2}>{value}</Text>
                      <Ionicons name="pencil" size={16} color="#4a90d9" style={styles.editIcon} />
                    </TouchableOpacity>
                  ))}
                </View>
              ))
            )
          )}

          {/* Call Metrics Tab */}
          {activeTab === 'metrics' && (
            callMetrics ? (
              <>
                {/* Summary Cards */}
                <View style={styles.metricsContainer}>
                  <View style={styles.metricCard}>
                    <Ionicons name="call" size={28} color="#22c55e" />
                    <Text style={styles.metricValue}>{callMetrics.total_calls}</Text>
                    <Text style={styles.metricLabel}>Total Calls (30 days)</Text>
                  </View>
                </View>

                {/* Calls by Type */}
                <View style={styles.contentCard}>
                  <Text style={styles.contentPageTitle}>Calls by Contact Type</Text>
                  {Object.entries(callMetrics.calls_by_type || {}).map(([type, count]) => (
                    <View key={type} style={styles.metricRow}>
                      <View style={styles.metricRowLeft}>
                        <Ionicons 
                          name={type === 'counsellor' ? 'medkit' : type === 'peer' ? 'people' : 'call'} 
                          size={18} 
                          color="#7c9cbf" 
                        />
                        <Text style={styles.metricRowLabel}>{type.charAt(0).toUpperCase() + type.slice(1)}</Text>
                      </View>
                      <Text style={styles.metricRowValue}>{count as number}</Text>
                    </View>
                  ))}
                </View>

                {/* Calls by Method */}
                <View style={styles.contentCard}>
                  <Text style={styles.contentPageTitle}>Calls by Method</Text>
                  {Object.entries(callMetrics.calls_by_method || {}).map(([method, count]) => (
                    <View key={method} style={styles.metricRow}>
                      <View style={styles.metricRowLeft}>
                        <Ionicons 
                          name={method === 'phone' ? 'call' : method === 'sms' ? 'chatbubble' : 'logo-whatsapp'} 
                          size={18} 
                          color="#7c9cbf" 
                        />
                        <Text style={styles.metricRowLabel}>{method.charAt(0).toUpperCase() + method.slice(1)}</Text>
                      </View>
                      <Text style={styles.metricRowValue}>{count as number}</Text>
                    </View>
                  ))}
                </View>

                {/* Recent Activity */}
                <View style={styles.contentCard}>
                  <Text style={styles.contentPageTitle}>Recent Activity</Text>
                  {(callMetrics.recent_logs || []).slice(0, 10).map((log: any, index: number) => (
                    <View key={index} style={styles.logItem}>
                      <View style={styles.logIcon}>
                        <Ionicons 
                          name={log.call_method === 'phone' ? 'call' : log.call_method === 'sms' ? 'chatbubble' : 'logo-whatsapp'} 
                          size={16} 
                          color="#4a90d9" 
                        />
                      </View>
                      <View style={styles.logDetails}>
                        <Text style={styles.logName}>{log.contact_name}</Text>
                        <Text style={styles.logMeta}>
                          {log.contact_type} • {new Date(log.timestamp).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>
                  ))}
                  {(callMetrics.recent_logs || []).length === 0 && (
                    <Text style={styles.emptySubtext}>No call activity yet</Text>
                  )}
                </View>
              </>
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="analytics" size={48} color="#7c9cbf" />
                <Text style={styles.emptyText}>No call data available</Text>
                <Text style={styles.emptySubtext}>Call metrics will appear here once users start making calls</Text>
              </View>
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
                Add {activeTab === 'counsellors' ? 'Counsellor' : activeTab === 'peers' ? 'Peer Supporter' : activeTab === 'orgs' ? 'Organization' : activeTab === 'resources' ? 'Resource' : 'User'}
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
              ) : activeTab === 'peers' ? (
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
              ) : activeTab === 'orgs' ? (
                <>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Organization Name"
                    placeholderTextColor="#8899a6"
                    value={formData.name}
                    onChangeText={(text) => setFormData({ ...formData, name: text })}
                  />
                  <TextInput
                    style={[styles.modalInput, { minHeight: 80, textAlignVertical: 'top' }]}
                    placeholder="Description"
                    placeholderTextColor="#8899a6"
                    value={formData.description}
                    onChangeText={(text) => setFormData({ ...formData, description: text })}
                    multiline
                    numberOfLines={3}
                  />
                </>
              ) : activeTab === 'resources' ? (
                <>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Title"
                    placeholderTextColor="#8899a6"
                    value={formData.name}
                    onChangeText={(text) => setFormData({ ...formData, name: text })}
                  />
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Category (e.g., Mental Health, Housing, Employment)"
                    placeholderTextColor="#8899a6"
                    value={formData.specialization}
                    onChangeText={(text) => setFormData({ ...formData, specialization: text })}
                  />
                  <TextInput
                    style={[styles.modalInput, { minHeight: 80, textAlignVertical: 'top' }]}
                    placeholder="Description"
                    placeholderTextColor="#8899a6"
                    value={formData.description}
                    onChangeText={(text) => setFormData({ ...formData, description: text })}
                    multiline
                    numberOfLines={3}
                  />
                  <TextInput
                    style={styles.modalInput}
                    placeholder="External Link (optional)"
                    placeholderTextColor="#8899a6"
                    value={formData.whatsapp}
                    onChangeText={(text) => setFormData({ ...formData, whatsapp: text })}
                  />
                </>
              ) : (
                <>
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
                    {['counsellor', 'peer', 'admin'].map((role) => (
                      <TouchableOpacity
                        key={role}
                        style={[styles.roleButton, userFormData.role === role && styles.roleButtonActive]}
                        onPress={() => setUserFormData({ ...userFormData, role })}
                      >
                        <Text style={styles.roleButtonText}>{role}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}
              
              {(activeTab === 'counsellors' || activeTab === 'peers' || activeTab === 'orgs') && (
                <>
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

                  {/* Create Login Account Section - Only for counsellors and peers */}
                  {(activeTab === 'counsellors' || activeTab === 'peers') && (
                  <View style={styles.accountSection}>
                    <TouchableOpacity 
                      style={styles.checkboxRow}
                      onPress={() => setFormData({ ...formData, createAccount: !formData.createAccount })}
                    >
                      <View style={[styles.checkbox, formData.createAccount && styles.checkboxChecked]}>
                        {formData.createAccount && <Ionicons name="checkmark" size={16} color="#ffffff" />}
                      </View>
                      <Text style={styles.checkboxLabel}>Create login account for this person</Text>
                    </TouchableOpacity>

                    {formData.createAccount && (
                      <>
                        <TextInput
                          style={styles.modalInput}
                          placeholder="Email for login"
                          placeholderTextColor="#8899a6"
                          value={formData.email}
                          onChangeText={(text) => setFormData({ ...formData, email: text })}
                          keyboardType="email-address"
                          autoCapitalize="none"
                        />
                        <TextInput
                          style={styles.modalInput}
                          placeholder="Password"
                          placeholderTextColor="#8899a6"
                          value={formData.password}
                          onChangeText={(text) => setFormData({ ...formData, password: text })}
                          secureTextEntry
                        />
                      </>
                    )}
                  </View>
                  )}
                </>
              )}
            </ScrollView>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => {
                if (activeTab === 'counsellors') {
                  handleAddCounsellor();
                } else if (activeTab === 'peers') {
                  handleAddPeer();
                } else if (activeTab === 'orgs') {
                  handleAddOrganization();
                } else if (activeTab === 'resources') {
                  handleAddResource();
                } else if (activeTab === 'users') {
                  handleCreateUser();
                }
              }}
            >
              <Text style={styles.saveButtonText}>
                {activeTab === 'users' ? 'Create User' : 'Save'}
              </Text>
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
                {['counsellor', 'peer', 'admin'].map((role) => (
                  <TouchableOpacity
                    key={role}
                    style={[styles.roleButton, userFormData.role === role && styles.roleButtonActive]}
                    onPress={() => setUserFormData({ ...userFormData, role })}
                  >
                    <Text style={styles.roleButtonText}>{role}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <TouchableOpacity style={styles.saveButton} onPress={handleCreateUser}>
              <Text style={styles.saveButtonText}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Change Password Modal */}
      <Modal visible={showPasswordModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change Your Password</Text>
              <TouchableOpacity onPress={() => setShowPasswordModal(false)}>
                <Ionicons name="close" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <TextInput
                style={styles.modalInput}
                placeholder="Current Password"
                placeholderTextColor="#8899a6"
                value={passwordData.currentPassword}
                onChangeText={(text) => setPasswordData({ ...passwordData, currentPassword: text })}
                secureTextEntry
              />
              <TextInput
                style={styles.modalInput}
                placeholder="New Password"
                placeholderTextColor="#8899a6"
                value={passwordData.newPassword}
                onChangeText={(text) => setPasswordData({ ...passwordData, newPassword: text })}
                secureTextEntry
              />
              <TextInput
                style={styles.modalInput}
                placeholder="Confirm New Password"
                placeholderTextColor="#8899a6"
                value={passwordData.confirmPassword}
                onChangeText={(text) => setPasswordData({ ...passwordData, confirmPassword: text })}
                secureTextEntry
              />
            </ScrollView>

            <TouchableOpacity style={styles.saveButton} onPress={handleChangePassword}>
              <Text style={styles.saveButtonText}>Change Password</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Reset User Password Modal */}
      <Modal visible={showResetModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Reset Password</Text>
              <TouchableOpacity onPress={() => setShowResetModal(false)}>
                <Ionicons name="close" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>

            <Text style={styles.resetUserInfo}>
              Resetting password for: {selectedUser?.email}
            </Text>

            <TextInput
              style={styles.modalInput}
              placeholder="New Password"
              placeholderTextColor="#8899a6"
              value={resetPassword}
              onChangeText={setResetPassword}
              secureTextEntry
            />

            <TouchableOpacity style={styles.saveButton} onPress={handleResetUserPassword}>
              <Text style={styles.saveButtonText}>Reset Password</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Edit Content Modal */}
      <Modal visible={showContentModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Content</Text>
              <TouchableOpacity onPress={() => setShowContentModal(false)}>
                <Ionicons name="close" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>

            <Text style={styles.contentEditLabel}>
              {pageNames[editingContent.page] || editingContent.page} - {editingContent.section.replace(/_/g, ' ')}
            </Text>

            <TextInput
              style={[styles.modalInput, styles.contentTextArea]}
              placeholder="Content"
              placeholderTextColor="#8899a6"
              value={editingContent.value}
              onChangeText={(text) => setEditingContent({ ...editingContent, value: text })}
              multiline
              numberOfLines={4}
            />

            <TouchableOpacity style={styles.saveButton} onPress={handleUpdateContent}>
              <Text style={styles.saveButtonText}>Save Content</Text>
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
  headerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    padding: 8,
    backgroundColor: '#243447',
    borderRadius: 8,
  },
  tabsContainer: {
    maxHeight: 60,
  },
  tabs: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#243447',
    borderRadius: 8,
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
  seedButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f59e0b',
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
  emptyContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    color: '#8899a6',
    textAlign: 'center',
    marginTop: 40,
  },
  emptySubtext: {
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
    fontSize: 12,
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
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#4a90d9',
  },
  adminBadge: {
    backgroundColor: '#8b5cf6',
  },
  roleText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#22c55e',
  },
  categoryText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  cardDetail: {
    color: '#8899a6',
    marginBottom: 4,
  },
  cardDetailSmall: {
    color: '#6b7280',
    fontSize: 12,
    marginBottom: 2,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 12,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 8,
    backgroundColor: '#1a2332',
    borderRadius: 6,
  },
  resetButtonText: {
    color: '#4a90d9',
    fontSize: 12,
  },
  deleteButton: {
    padding: 8,
  },
  contentCard: {
    backgroundColor: '#243447',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  contentPageTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
    paddingBottom: 8,
  },
  contentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  contentSection: {
    width: 120,
    color: '#8899a6',
    fontSize: 12,
    textTransform: 'capitalize',
  },
  contentValue: {
    flex: 1,
    color: '#ffffff',
    fontSize: 14,
  },
  editIcon: {
    marginLeft: 8,
  },
  accountSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#3d4f5f',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#7c9cbf',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#4a90e2',
    borderColor: '#4a90e2',
  },
  checkboxLabel: {
    color: '#ffffff',
    fontSize: 14,
  },
  roleSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 8,
    flexWrap: 'wrap',
  },
  roleLabel: {
    color: '#b0c4de',
    fontSize: 14,
    marginRight: 8,
  },
  roleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#3d4f5f',
  },
  roleButtonActive: {
    backgroundColor: '#4a90e2',
  },
  roleButtonText: {
    color: '#ffffff',
    fontSize: 12,
    textTransform: 'capitalize',
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
  contentTextArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  contentEditLabel: {
    color: '#8899a6',
    marginBottom: 12,
    textTransform: 'capitalize',
  },
  resetUserInfo: {
    color: '#8899a6',
    marginBottom: 16,
  },
  roleSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
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
    textTransform: 'capitalize',
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
  // Metrics Tab Styles
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    gap: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#243447',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 8,
  },
  metricLabel: {
    fontSize: 12,
    color: '#8899a6',
    marginTop: 4,
    textAlign: 'center',
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2a3f55',
  },
  metricRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metricRowLabel: {
    fontSize: 14,
    color: '#ffffff',
  },
  metricRowValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4a90d9',
  },
  logItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#2a3f55',
  },
  logIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(74, 144, 217, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  logDetails: {
    flex: 1,
  },
  logName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
  },
  logMeta: {
    fontSize: 12,
    color: '#8899a6',
    marginTop: 2,
  },
});
