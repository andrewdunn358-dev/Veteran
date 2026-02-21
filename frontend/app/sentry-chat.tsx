import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  Modal,
  Linking,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FINCH_AVATAR = 'https://static.prod-images.emergentagent.com/jobs/26fef91b-7832-48ee-9b54-6cd204a344d5/images/f2058ae7a5d15ff3f002514d4ada7039eeddf405b897ae4fc1f0a68a1114e1d8.png';
const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';

interface AvailableStaff {
  counsellors: any[];
  peers: any[];
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'finch';
  timestamp: Date;
}

export default function FinchChatScreen() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [savedEmail, setSavedEmail] = useState<string | null>(null);
  
  // Safeguarding state
  const [showSafeguardingModal, setShowSafeguardingModal] = useState(false);
  const [currentAlertId, setCurrentAlertId] = useState<string | null>(null);
  const [safeguardingView, setSafeguardingView] = useState<'main' | 'callback' | 'connecting' | 'callback_success'>('main');
  const [callbackPhone, setCallbackPhone] = useState('');
  const [callbackName, setCallbackName] = useState('');
  const [callbackEmail, setCallbackEmail] = useState('');
  const [callbackMessage, setCallbackMessage] = useState('');
  const [isSubmittingCallback, setIsSubmittingCallback] = useState(false);
  const [availableStaff, setAvailableStaff] = useState<AvailableStaff>({ counsellors: [], peers: [] });
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [sessionId] = useState(() => `finch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  
  // Verification modal state for returning users
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState('');
  const [verifyPin, setVerifyPin] = useState('');
  const [verifyError, setVerifyError] = useState('');
  const [pendingMessages, setPendingMessages] = useState<Message[] | null>(null);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [pendingPin, setPendingPin] = useState<string | null>(null);
  const [hasLoadedSession, setHasLoadedSession] = useState(false);

  useEffect(() => {
    loadSavedSession();
  }, []);
  
  useEffect(() => {
    // Only show welcome message if no saved session or after verification
    if (hasLoadedSession && messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        text: "Hello, what can I help you with today?",
        sender: 'finch',
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [hasLoadedSession]);

  const loadSavedSession = async () => {
    try {
      const storedEmail = await AsyncStorage.getItem('finch_email');
      const storedPin = await AsyncStorage.getItem('finch_pin');
      const storedMessages = await AsyncStorage.getItem('finch_messages');
      
      if (storedEmail && storedPin && storedMessages) {
        const parsed = JSON.parse(storedMessages);
        const messagesWithDates = parsed.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }));
        
        // Store pending data and show verification modal
        setPendingMessages(messagesWithDates);
        setPendingEmail(storedEmail);
        setPendingPin(storedPin);
        setShowVerifyModal(true);
      } else {
        setHasLoadedSession(true);
      }
    } catch (error) {
      console.error('Error loading session:', error);
      setHasLoadedSession(true);
    }
  };
  
  const handleVerifyIdentity = () => {
    if (verifyEmail.toLowerCase() === pendingEmail?.toLowerCase() && verifyPin === pendingPin) {
      // Verification successful - load the conversation
      if (pendingMessages) {
        setMessages(pendingMessages);
      }
      setSavedEmail(pendingEmail);
      setIsAuthenticated(true);
      setShowVerifyModal(false);
      setHasLoadedSession(true);
      setVerifyError('');
      // Clear pending data
      setPendingMessages(null);
      setPendingEmail(null);
      setPendingPin(null);
    } else {
      setVerifyError('Email or PIN does not match. Please try again.');
    }
  };
  
  const handleStartFresh = async () => {
    // User wants to start a new conversation - clear saved data
    try {
      await AsyncStorage.removeItem('finch_email');
      await AsyncStorage.removeItem('finch_pin');
      await AsyncStorage.removeItem('finch_messages');
    } catch (error) {
      console.error('Error clearing session:', error);
    }
    
    // Clear state and start fresh
    setPendingMessages(null);
    setPendingEmail(null);
    setPendingPin(null);
    setShowVerifyModal(false);
    setVerifyEmail('');
    setVerifyPin('');
    setVerifyError('');
    setHasLoadedSession(true);
  };

  const saveMessages = async (newMessages: Message[]) => {
    if (isAuthenticated) {
      try {
        await AsyncStorage.setItem('finch_messages', JSON.stringify(newMessages));
      } catch (error) {
        console.error('Error saving messages:', error);
      }
    }
  };

  const handleSetupEmail = async () => {
    if (email && pin.length === 4) {
      try {
        await AsyncStorage.setItem('finch_email', email);
        await AsyncStorage.setItem('finch_pin', pin);
        setSavedEmail(email);
        setIsAuthenticated(true);
        setShowEmailModal(false);
        // Save current messages
        await saveMessages(messages);
      } catch (error) {
        console.error('Error saving credentials:', error);
      }
    }
  };

  // Check for available counsellors/peers
  const checkAvailability = async () => {
    setIsCheckingAvailability(true);
    try {
      const [counsellorsRes, peersRes] = await Promise.all([
        fetch(`${API_URL}/api/counsellors/available`),
        fetch(`${API_URL}/api/peer-supporters/available`)
      ]);
      
      const counsellors = await counsellorsRes.json();
      const peers = await peersRes.json();
      
      setAvailableStaff({
        counsellors: Array.isArray(counsellors) ? counsellors : [],
        peers: Array.isArray(peers) ? peers : []
      });
    } catch (error) {
      console.error('Error checking availability:', error);
      setAvailableStaff({ counsellors: [], peers: [] });
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  // Submit callback request
  const submitCallbackRequest = async () => {
    if (!callbackPhone.trim()) {
      Alert.alert('Phone Required', 'Please enter your phone number so we can call you back.');
      return;
    }

    setIsSubmittingCallback(true);

    try {
      let fullMessage = `Safeguarding callback request from Finch chat. Session: ${sessionId}.`;
      if (currentAlertId) {
        fullMessage += ` Alert ID: ${currentAlertId}.`;
      }
      if (callbackMessage.trim()) {
        fullMessage += ` User message: "${callbackMessage.trim()}"`;
      }

      const response = await fetch(`${API_URL}/api/callbacks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: callbackName.trim() || 'Anonymous',
          phone: callbackPhone.trim(),
          email: callbackEmail.trim() || null,
          request_type: 'counsellor',
          message: fullMessage,
          is_urgent: true,
          safeguarding_alert_id: currentAlertId || null
        }),
      });

      if (response.ok) {
        setSafeguardingView('callback_success');
      } else {
        Alert.alert('Error', 'Failed to submit callback request. Please try again or call 116 123.');
      }
    } catch (error) {
      console.error('Callback error:', error);
      Alert.alert('Error', 'Failed to submit callback request. Please try again or call 116 123.');
    } finally {
      setIsSubmittingCallback(false);
    }
  };

  // Handle connecting to live person
  const handleLiveConnect = async (type: 'counsellor' | 'peer') => {
    setSafeguardingView('connecting');
    
    setTimeout(() => {
      setShowSafeguardingModal(false);
      setSafeguardingView('main');
      router.push({
        pathname: '/live-chat',
        params: { 
          staffType: type,
          alertId: currentAlertId || '',
          sessionId: sessionId,
        }
      });
    }, 1500);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputText('');
    setIsLoading(true);

    try {
      // Use the same endpoint as Tommy & Doris - ai-buddies/chat
      const response = await fetch(`${API_URL}/api/ai-buddies/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: inputText.trim(),
          sessionId: sessionId,
          character: 'sentry',
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      
      // Check if safeguarding was triggered
      if (data.safeguardingTriggered) {
        setCurrentAlertId(data.safeguardingAlertId);
        checkAvailability(); // Check who's available
        setShowSafeguardingModal(true);
      }
      
      const finchMessage: Message = {
        id: `finch-${Date.now()}`,
        text: data.reply || "I'm here to listen. Please tell me more about what you're going through.",
        sender: 'finch',
        timestamp: new Date(),
      };

      const updatedMessages = [...newMessages, finchMessage];
      setMessages(updatedMessages);
      await saveMessages(updatedMessages);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: `finch-${Date.now()}`,
        text: "I'm having trouble connecting right now. Please know that support is available. If you need immediate help, please contact Combat Stress on 0800 138 1619 or Samaritans on 116 123.",
        sender: 'finch',
        timestamp: new Date(),
      };
      const updatedMessages = [...newMessages, errorMessage];
      setMessages(updatedMessages);
    } finally {
      setIsLoading(false);
    }
  };

  const clearConversation = async () => {
    const welcomeMessage: Message = {
      id: 'welcome-new',
      text: "I've started a fresh conversation. How can I support you today?",
      sender: 'finch',
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
    if (isAuthenticated) {
      await AsyncStorage.setItem('sentry_messages', JSON.stringify([welcomeMessage]));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Image source={{ uri: FINCH_AVATAR }} style={styles.headerAvatar} />
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Finch</Text>
          <Text style={styles.headerSubtitle}>Legal Support Companion</Text>
        </View>
        <TouchableOpacity onPress={clearConversation} style={styles.menuButton}>
          <Ionicons name="refresh" size={22} color="#7c9cbf" />
        </TouchableOpacity>
      </View>

      {/* Save Conversation Banner */}
      {!isAuthenticated && (
        <TouchableOpacity 
          style={styles.saveBanner}
          onPress={() => setShowEmailModal(true)}
        >
          <Ionicons name="bookmark-outline" size={20} color="#3b82f6" />
          <Text style={styles.saveBannerText}>Save conversation to continue later</Text>
          <Ionicons name="chevron-forward" size={18} color="#3b82f6" />
        </TouchableOpacity>
      )}

      {isAuthenticated && (
        <View style={styles.authenticatedBanner}>
          <Ionicons name="checkmark-circle" size={18} color="#22c55e" />
          <Text style={styles.authenticatedText}>Conversation saved locally as {savedEmail}</Text>
        </View>
      )}

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageBubble,
              message.sender === 'user' ? styles.userBubble : styles.finchBubble,
            ]}
          >
            {message.sender === 'finch' && (
              <View style={styles.finchLabel}>
                <Image source={{ uri: FINCH_AVATAR }} style={styles.finchLabelAvatar} />
                <Text style={styles.finchLabelText}>Finch</Text>
              </View>
            )}
            <Text style={[
              styles.messageText,
              message.sender === 'user' ? styles.userText : styles.finchText,
            ]}>
              {message.text}
            </Text>
          </View>
        ))}
        {isLoading && (
          <View style={[styles.messageBubble, styles.finchBubble]}>
            <View style={styles.finchLabel}>
              <Image source={{ uri: FINCH_AVATAR }} style={styles.finchLabelAvatar} />
              <Text style={styles.finchLabelText}>Finch</Text>
            </View>
            <ActivityIndicator size="small" color="#7c9cbf" />
          </View>
        )}
      </ScrollView>

      {/* Disclaimer */}
      <View style={styles.disclaimer}>
        <Ionicons name="information-circle" size={14} color="#64748b" />
        <Text style={styles.disclaimerText}>
          Not legal advice. For emergencies call 999. Crisis support: 0800 138 1619
        </Text>
      </View>

      {/* Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type your message..."
            placeholderTextColor="#64748b"
            multiline
            maxLength={2000}
          />
          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={handleSendMessage}
            disabled={!inputText.trim() || isLoading}
          >
            <Ionicons name="send" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Email Setup Modal */}
      <Modal
        visible={showEmailModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEmailModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.modalClose}
              onPress={() => setShowEmailModal(false)}
            >
              <Ionicons name="close" size={24} color="#64748b" />
            </TouchableOpacity>
            
            <Ionicons name="bookmark" size={48} color="#3b82f6" />
            <Text style={styles.modalTitle}>Save Your Conversation</Text>
            <Text style={styles.modalDescription}>
              Enter your email and create a 4-digit PIN to save this conversation on your device. 
              You can continue where you left off next time.
            </Text>

            <View style={styles.privacyNotice}>
              <Ionicons name="shield-checkmark" size={20} color="#22c55e" />
              <Text style={styles.privacyText}>
                Your conversation is stored only on your device, not in any database. 
                Your privacy is protected.
              </Text>
            </View>

            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.modalInput}
              value={email}
              onChangeText={setEmail}
              placeholder="your@email.com"
              placeholderTextColor="#94a3b8"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.inputLabel}>4-Digit PIN</Text>
            <TextInput
              style={styles.modalInput}
              value={pin}
              onChangeText={(text) => setPin(text.replace(/[^0-9]/g, '').slice(0, 4))}
              placeholder="1234"
              placeholderTextColor="#94a3b8"
              keyboardType="number-pad"
              maxLength={4}
              secureTextEntry
            />

            <TouchableOpacity
              style={[
                styles.modalButton,
                (!email || pin.length !== 4) && styles.modalButtonDisabled
              ]}
              onPress={handleSetupEmail}
              disabled={!email || pin.length !== 4}
            >
              <Text style={styles.modalButtonText}>Save Conversation</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Verification Modal for Returning Users */}
      <Modal
        visible={showVerifyModal}
        animationType="slide"
        transparent={true}
        onRequestClose={handleStartFresh}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Ionicons name="person-circle" size={48} color="#3b82f6" />
            <Text style={styles.modalTitle}>Welcome Back</Text>
            <Text style={styles.modalDescription}>
              We found a saved conversation. Please verify your identity to continue where you left off.
            </Text>

            {verifyError ? (
              <View style={styles.verifyErrorContainer}>
                <Ionicons name="alert-circle" size={20} color="#dc2626" />
                <Text style={styles.verifyErrorText}>{verifyError}</Text>
              </View>
            ) : null}

            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.modalInput}
              value={verifyEmail}
              onChangeText={setVerifyEmail}
              placeholder="your@email.com"
              placeholderTextColor="#94a3b8"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.inputLabel}>4-Digit PIN</Text>
            <TextInput
              style={styles.modalInput}
              value={verifyPin}
              onChangeText={(text) => setVerifyPin(text.replace(/[^0-9]/g, '').slice(0, 4))}
              placeholder="1234"
              placeholderTextColor="#94a3b8"
              keyboardType="number-pad"
              maxLength={4}
              secureTextEntry
            />

            <TouchableOpacity
              style={[
                styles.modalButton,
                (!verifyEmail || verifyPin.length !== 4) && styles.modalButtonDisabled
              ]}
              onPress={handleVerifyIdentity}
              disabled={!verifyEmail || verifyPin.length !== 4}
            >
              <Text style={styles.modalButtonText}>Continue Conversation</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.startFreshButton}
              onPress={handleStartFresh}
            >
              <Text style={styles.startFreshText}>Start a New Conversation</Text>
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
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#243447',
    borderBottomWidth: 1,
    borderBottomColor: '#3b5068',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#7c9cbf',
  },
  menuButton: {
    padding: 8,
  },
  saveBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e3a5f',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  saveBannerText: {
    flex: 1,
    fontSize: 13,
    color: '#93c5fd',
  },
  authenticatedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#14532d',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  authenticatedText: {
    fontSize: 12,
    color: '#86efac',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  messageBubble: {
    maxWidth: '85%',
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
  },
  userBubble: {
    backgroundColor: '#3b82f6',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  finchBubble: {
    backgroundColor: '#243447',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  finchLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  finchLabelAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 6,
  },
  finchLabelText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7c9cbf',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: '#ffffff',
  },
  finchText: {
    color: '#e2e8f0',
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#1e293b',
    gap: 6,
  },
  disclaimerText: {
    fontSize: 11,
    color: '#64748b',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    backgroundColor: '#243447',
    borderTopWidth: 1,
    borderTopColor: '#3b5068',
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#1a2332',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: '#ffffff',
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#3b82f6',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#475569',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalClose: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 4,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    marginTop: 16,
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  privacyNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#14532d',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    gap: 10,
  },
  privacyText: {
    flex: 1,
    fontSize: 13,
    color: '#86efac',
    lineHeight: 18,
  },
  inputLabel: {
    alignSelf: 'flex-start',
    fontSize: 14,
    fontWeight: '600',
    color: '#94a3b8',
    marginBottom: 6,
  },
  modalInput: {
    width: '100%',
    backgroundColor: '#0f172a',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  modalButton: {
    width: '100%',
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  modalButtonDisabled: {
    backgroundColor: '#475569',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  verifyErrorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#450a0a',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
    width: '100%',
  },
  verifyErrorText: {
    flex: 1,
    fontSize: 14,
    color: '#fca5a5',
  },
  startFreshButton: {
    marginTop: 16,
    paddingVertical: 12,
  },
  startFreshText: {
    fontSize: 14,
    color: '#94a3b8',
    textDecorationLine: 'underline',
  },
});
