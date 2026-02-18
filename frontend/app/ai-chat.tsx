import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
  Image,
  Modal,
  Linking,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'https://veterans-support-api.onrender.com';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'buddy';
  timestamp: Date;
}

interface CharacterInfo {
  name: string;
  avatar: string;
}

interface AvailableStaff {
  counsellors: any[];
  peers: any[];
}

export default function AIChat() {
  const router = useRouter();
  const { character = 'tommy' } = useLocalSearchParams<{ character: string }>();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [characterInfo, setCharacterInfo] = useState<CharacterInfo>({ name: 'Tommy', avatar: '' });
  const [sessionId] = useState(() => `${character}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  const [showSafeguardingModal, setShowSafeguardingModal] = useState(false);
  const [safeguardingView, setSafeguardingView] = useState<'main' | 'callback' | 'connecting'>('main');
  const [callbackPhone, setCallbackPhone] = useState('');
  const [callbackName, setCallbackName] = useState('');
  const [callbackEmail, setCallbackEmail] = useState('');
  const [callbackMessage, setCallbackMessage] = useState('');
  const [isSubmittingCallback, setIsSubmittingCallback] = useState(false);
  const [availableStaff, setAvailableStaff] = useState<AvailableStaff>({ counsellors: [], peers: [] });
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [currentAlertId, setCurrentAlertId] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Fetch character info
    fetchCharacterInfo();
    // Send initial greeting
    sendInitialGreeting();
  }, [character]);

  const fetchCharacterInfo = async () => {
    try {
      const response = await fetch(`${API_URL}/api/ai-buddies/characters`);
      const data = await response.json();
      const char = data.characters.find((c: any) => c.id === character);
      if (char) {
        setCharacterInfo({ name: char.name, avatar: char.avatar });
      }
    } catch (error) {
      console.error('Error fetching character:', error);
    }
  };

  const sendInitialGreeting = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/ai-buddies/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Hello',
          sessionId: sessionId,
          character: character,
        }),
      });

      const data = await response.json();
      if (response.ok && data.reply) {
        setCharacterInfo({ name: data.characterName, avatar: data.characterAvatar });
        setMessages([{
          id: 'greeting',
          text: data.reply,
          sender: 'buddy',
          timestamp: new Date(),
        }]);
      }
    } catch (error) {
      console.error('Error getting greeting:', error);
      setMessages([{
        id: 'greeting',
        text: `Hello, I'm ${character === 'doris' ? 'Doris' : 'Tommy'}. I'm here to listen whenever you need to talk.`,
        sender: 'buddy',
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
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

    try {
      const response = await fetch(`${API_URL}/api/callbacks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: callbackName.trim() || 'Anonymous',
          phone: callbackPhone.trim(),
          request_type: 'counsellor',
          message: `Safeguarding callback request from AI chat. Session: ${sessionId}. Alert ID: ${currentAlertId || 'N/A'}`,
          is_urgent: true,
          safeguarding_alert_id: currentAlertId || null
        }),
      });

      if (response.ok) {
        Alert.alert(
          'Callback Requested',
          'Someone will call you back as soon as possible. If you need immediate help, please call 999 or Samaritans on 116 123.',
          [{ text: 'OK', onPress: () => {
            setShowSafeguardingModal(false);
            setSafeguardingView('main');
            setCallbackPhone('');
            setCallbackName('');
          }}]
        );
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Callback error:', errorData);
        Alert.alert('Error', 'Failed to submit callback request. Please try again or call 116 123.');
      }
    } catch (error) {
      console.error('Callback error:', error);
      Alert.alert('Error', 'Failed to submit callback request. Please try again or call 116 123.');
    }
  };

  // Handle connecting to live person
  const handleLiveConnect = async (type: 'counsellor' | 'peer', staffMember: any) => {
    setSafeguardingView('connecting');
    
    // Navigate to live chat with staff info after brief delay
    setTimeout(() => {
      setShowSafeguardingModal(false);
      setSafeguardingView('main');
      router.push({
        pathname: '/live-chat',
        params: { 
          staffId: staffMember.id,
          staffName: staffMember.name || staffMember.firstName,
          staffType: type,
          alertId: currentAlertId || '',
          sessionId: sessionId,
        }
      });
    }, 1500);
  };

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/ai-buddies/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.text,
          sessionId: sessionId,
          character: character,
        }),
      });

      const data = await response.json();

      if (response.ok && data.reply) {
        const buddyMessage: Message = {
          id: `buddy-${Date.now()}`,
          text: data.reply,
          sender: 'buddy',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, buddyMessage]);
        
        // Check if safeguarding was triggered
        if (data.safeguardingTriggered) {
          setCurrentAlertId(data.safeguardingAlertId);
          checkAvailability(); // Check who's available
          setShowSafeguardingModal(true);
        }
      } else {
        const errorMessage: Message = {
          id: `error-${Date.now()}`,
          text: data.detail || "I'm having trouble right now. Please try again or speak to a real person using the buttons below.",
          sender: 'buddy',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        text: "I'm having trouble connecting. Please check your internet or speak to a real person using the buttons below.",
        sender: 'buddy',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <FontAwesome5 name="arrow-left" size={20} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          {characterInfo.avatar ? (
            <Image source={{ uri: characterInfo.avatar }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <FontAwesome5 name="user" size={20} color="#3b82f6" />
            </View>
          )}
          <View>
            <Text style={styles.headerTitle}>{characterInfo.name}</Text>
            <Text style={styles.headerSubtitle}>On stag 24/7</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => router.push('/ai-buddies')} style={styles.switchButton}>
          <FontAwesome5 name="exchange-alt" size={16} color="#94a3b8" />
        </TouchableOpacity>
      </View>

      {/* Disclaimer */}
      <View style={styles.disclaimer}>
        <FontAwesome5 name="info-circle" size={14} color="#64748b" />
        <Text style={styles.disclaimerText}>
          {characterInfo.name} is an AI and cannot provide advice or replace human support.
        </Text>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={scrollToBottom}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageBubble,
              message.sender === 'user' ? styles.userBubble : styles.buddyBubble,
            ]}
          >
            {message.sender === 'buddy' && (
              <View style={styles.buddyLabel}>
                {characterInfo.avatar ? (
                  <Image source={{ uri: characterInfo.avatar }} style={styles.buddyLabelAvatar} />
                ) : null}
                <Text style={styles.buddyLabelText}>{characterInfo.name} (AI Battle Buddy)</Text>
              </View>
            )}
            <Text
              style={[
                styles.messageText,
                message.sender === 'user' ? styles.userText : styles.buddyText,
              ]}
            >
              {message.text}
            </Text>
          </View>
        ))}
        {isLoading && (
          <View style={[styles.messageBubble, styles.buddyBubble]}>
            <View style={styles.buddyLabel}>
              {characterInfo.avatar ? (
                <Image source={{ uri: characterInfo.avatar }} style={styles.buddyLabelAvatar} />
              ) : null}
              <Text style={styles.buddyLabelText}>{characterInfo.name} (AI Battle Buddy)</Text>
            </View>
            <View style={styles.typingIndicator}>
              <ActivityIndicator size="small" color="#3b82f6" />
              <Text style={styles.typingText}>{characterInfo.name} is typing...</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Talk to Real Person Buttons */}
      <View style={styles.realPersonButtons}>
        <TouchableOpacity
          style={styles.realPersonButton}
          onPress={() => router.push('/peer-support')}
        >
          <FontAwesome5 name="users" size={16} color="#16a34a" />
          <Text style={styles.realPersonButtonText}>Talk to a peer</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.realPersonButton, styles.counsellorButton]}
          onPress={() => router.push('/crisis-support')}
        >
          <FontAwesome5 name="user-md" size={16} color="#2563eb" />
          <Text style={[styles.realPersonButtonText, styles.counsellorButtonText]}>
            Talk to a counsellor
          </Text>
        </TouchableOpacity>
      </View>

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Type a message..."
          placeholderTextColor="#94a3b8"
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={sendMessage}
          multiline
          maxLength={500}
          editable={!isLoading}
        />
        <TouchableOpacity
          style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!inputText.trim() || isLoading}
        >
          <FontAwesome5 name="paper-plane" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Safeguarding Support Modal */}
      <Modal
        visible={showSafeguardingModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {}}
      >
        <View style={styles.safeguardingOverlay}>
          <View style={styles.safeguardingModal}>
            {/* Main View */}
            {safeguardingView === 'main' && (
              <>
                <View style={styles.safeguardingHeader}>
                  <FontAwesome5 name="heart" size={32} color="#dc2626" />
                  <Text style={styles.safeguardingTitle}>We're Here For You</Text>
                </View>
                
                <Text style={styles.safeguardingText}>
                  It sounds like you might be going through something difficult. 
                  You don't have to face this alone.
                </Text>
                
                <ScrollView style={styles.safeguardingScroll} showsVerticalScrollIndicator={false}>
                  {/* Option A: Request Callback */}
                  <TouchableOpacity
                    style={styles.safeguardingOption}
                    onPress={() => setSafeguardingView('callback')}
                  >
                    <FontAwesome5 name="phone-alt" size={24} color="#2563eb" />
                    <View style={styles.safeguardingOptionContent}>
                      <Text style={styles.safeguardingOptionTitle}>Request a Callback</Text>
                      <Text style={styles.safeguardingOptionDesc}>Leave your number, we'll call you</Text>
                    </View>
                    <FontAwesome5 name="chevron-right" size={16} color="#94a3b8" />
                  </TouchableOpacity>
                  
                  {/* Option C: Connect to Live Person */}
                  <View style={styles.liveConnectSection}>
                    <Text style={styles.liveConnectLabel}>Connect Now</Text>
                    {isCheckingAvailability ? (
                      <ActivityIndicator size="small" color="#2563eb" />
                    ) : (
                      <>
                        {availableStaff.counsellors.length > 0 && (
                          <TouchableOpacity
                            style={[styles.safeguardingOption, styles.liveOption]}
                            onPress={() => handleLiveConnect('counsellor', availableStaff.counsellors[0])}
                          >
                            <View style={styles.availableDot} />
                            <FontAwesome5 name="user-md" size={20} color="#16a34a" />
                            <View style={styles.safeguardingOptionContent}>
                              <Text style={styles.safeguardingOptionTitle}>Counsellor Available</Text>
                              <Text style={styles.safeguardingOptionDesc}>{availableStaff.counsellors[0].name} is online</Text>
                            </View>
                            <FontAwesome5 name="chevron-right" size={16} color="#94a3b8" />
                          </TouchableOpacity>
                        )}
                        
                        {availableStaff.peers.length > 0 && (
                          <TouchableOpacity
                            style={[styles.safeguardingOption, styles.liveOption]}
                            onPress={() => handleLiveConnect('peer', availableStaff.peers[0])}
                          >
                            <View style={styles.availableDot} />
                            <FontAwesome5 name="users" size={20} color="#16a34a" />
                            <View style={styles.safeguardingOptionContent}>
                              <Text style={styles.safeguardingOptionTitle}>Peer Available</Text>
                              <Text style={styles.safeguardingOptionDesc}>{availableStaff.peers[0].name} is online</Text>
                            </View>
                            <FontAwesome5 name="chevron-right" size={16} color="#94a3b8" />
                          </TouchableOpacity>
                        )}
                        
                        {availableStaff.counsellors.length === 0 && availableStaff.peers.length === 0 && (
                          <Text style={styles.noOneAvailable}>No one available right now - please request a callback</Text>
                        )}
                      </>
                    )}
                  </View>
                  
                  {/* External Options */}
                  <TouchableOpacity
                    style={styles.safeguardingOption}
                    onPress={() => Linking.openURL('tel:116123')}
                  >
                    <FontAwesome5 name="phone-volume" size={24} color="#7c3aed" />
                    <View style={styles.safeguardingOptionContent}>
                      <Text style={styles.safeguardingOptionTitle}>Samaritans</Text>
                      <Text style={styles.safeguardingOptionDesc}>Call 116 123 (free, 24/7)</Text>
                    </View>
                    <FontAwesome5 name="external-link-alt" size={14} color="#94a3b8" />
                  </TouchableOpacity>
                </ScrollView>
                
                <View style={styles.emergencyNote}>
                  <FontAwesome5 name="exclamation-triangle" size={14} color="#f59e0b" />
                  <Text style={styles.emergencyNoteText}>
                    If you're in immediate danger, call 999
                  </Text>
                </View>
                
                <TouchableOpacity
                  style={styles.safeguardingContinue}
                  onPress={() => {
                    setShowSafeguardingModal(false);
                    setSafeguardingView('main');
                  }}
                >
                  <Text style={styles.safeguardingContinueText}>
                    I understand, continue chatting
                  </Text>
                </TouchableOpacity>
              </>
            )}
            
            {/* Callback View */}
            {safeguardingView === 'callback' && (
              <>
                <TouchableOpacity 
                  style={styles.backToMain}
                  onPress={() => setSafeguardingView('main')}
                >
                  <FontAwesome5 name="arrow-left" size={16} color="#64748b" />
                  <Text style={styles.backToMainText}>Back</Text>
                </TouchableOpacity>
                
                <View style={styles.safeguardingHeader}>
                  <FontAwesome5 name="phone-alt" size={28} color="#2563eb" />
                  <Text style={styles.safeguardingTitle}>Request a Callback</Text>
                </View>
                
                <Text style={styles.safeguardingText}>
                  Leave your details and someone will call you back as soon as possible.
                </Text>
                
                <View style={styles.callbackForm}>
                  <Text style={styles.inputLabel}>Your Name (optional)</Text>
                  <TextInput
                    style={styles.callbackInput}
                    placeholder="Your name"
                    placeholderTextColor="#94a3b8"
                    value={callbackName}
                    onChangeText={setCallbackName}
                  />
                  
                  <Text style={styles.inputLabel}>Phone Number *</Text>
                  <TextInput
                    style={styles.callbackInput}
                    placeholder="Your phone number"
                    placeholderTextColor="#94a3b8"
                    value={callbackPhone}
                    onChangeText={setCallbackPhone}
                    keyboardType="phone-pad"
                  />
                  
                  <TouchableOpacity
                    style={styles.submitCallbackButton}
                    onPress={submitCallbackRequest}
                  >
                    <Text style={styles.submitCallbackText}>Request Callback</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
            
            {/* Connecting View */}
            {safeguardingView === 'connecting' && (
              <View style={styles.connectingView}>
                <ActivityIndicator size="large" color="#2563eb" />
                <Text style={styles.connectingTitle}>Connecting you now...</Text>
                <Text style={styles.connectingText}>
                  We're alerting the team that you need to speak with someone.
                </Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a2634',
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e0f2fe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#94a3b8',
  },
  switchButton: {
    padding: 10,
    backgroundColor: '#2d3a4d',
    borderRadius: 8,
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 8,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#64748b',
    flex: 1,
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
    marginBottom: 12,
    padding: 14,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: '#2563eb',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  buddyBubble: {
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  buddyLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 6,
  },
  buddyLabelAvatar: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  buddyLabelText: {
    fontSize: 11,
    color: '#3b82f6',
    fontWeight: '600',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: '#fff',
  },
  buddyText: {
    color: '#1e293b',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typingText: {
    fontSize: 13,
    color: '#64748b',
    fontStyle: 'italic',
  },
  realPersonButtons: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  realPersonButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#dcfce7',
    borderWidth: 1,
    borderColor: '#16a34a',
  },
  counsellorButton: {
    backgroundColor: '#dbeafe',
    borderColor: '#2563eb',
  },
  realPersonButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#16a34a',
  },
  counsellorButtonText: {
    color: '#2563eb',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    gap: 10,
  },
  textInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    backgroundColor: '#f1f5f9',
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1e293b',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
  // Safeguarding Modal Styles
  safeguardingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end',
  },
  safeguardingModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '90%',
  },
  safeguardingHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  safeguardingTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 12,
    textAlign: 'center',
  },
  safeguardingText: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 16,
  },
  safeguardingScroll: {
    maxHeight: 300,
  },
  safeguardingOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
    gap: 12,
  },
  safeguardingOptionContent: {
    flex: 1,
  },
  safeguardingOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  safeguardingOptionDesc: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  liveConnectSection: {
    marginTop: 8,
    marginBottom: 12,
  },
  liveConnectLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#16a34a',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  liveOption: {
    borderColor: '#16a34a',
    backgroundColor: '#f0fdf4',
  },
  availableDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#16a34a',
    position: 'absolute',
    top: 16,
    left: 16,
  },
  noOneAvailable: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    paddingVertical: 16,
    fontStyle: 'italic',
  },
  emergencyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 8,
    gap: 8,
    marginTop: 8,
    marginBottom: 16,
  },
  emergencyNoteText: {
    fontSize: 13,
    color: '#92400e',
    fontWeight: '500',
  },
  safeguardingContinue: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  safeguardingContinueText: {
    fontSize: 14,
    color: '#64748b',
    textDecorationLine: 'underline',
  },
  // Callback Form Styles
  backToMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  backToMainText: {
    fontSize: 14,
    color: '#64748b',
  },
  callbackForm: {
    marginTop: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  callbackInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#f9fafb',
  },
  submitCallbackButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitCallbackText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Connecting View Styles
  connectingView: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  connectingTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 20,
  },
  connectingText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 8,
  },
});
