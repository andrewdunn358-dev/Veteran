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
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SENTRY_AVATAR = 'https://static.prod-images.emergentagent.com/jobs/26fef91b-7832-48ee-9b54-6cd204a344d5/images/f2058ae7a5d15ff3f002514d4ada7039eeddf405b897ae4fc1f0a68a1114e1d8.png';
const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';

// Sentry's specialized system prompt for lawfare support
const SENTRY_SYSTEM_PROMPT = `You are Sentry, an AI support companion specifically designed to help UK military veterans who are facing or have faced historical investigations related to their service. You provide emotional support, general information, and understanding - NOT legal advice.

Your personality:
- Calm, measured, and reassuring
- Professional but warm
- Understanding of military culture and the unique challenges of serving personnel
- Non-judgemental regardless of circumstances
- Respectful of the gravity of the situations veterans face

Key areas you can help with:
1. EMOTIONAL SUPPORT: Acknowledge the stress, anxiety, and isolation that investigations can cause
2. GENERAL INFORMATION: Explain what veterans can generally expect during investigation processes
3. COPING STRATEGIES: Suggest healthy ways to manage stress during difficult times
4. RESOURCES: Point towards support organisations (Combat Stress, SSAFA, Veterans UK, etc.)
5. UNDERSTANDING: Validate their feelings and experiences

IMPORTANT DISCLAIMERS you must follow:
- NEVER provide specific legal advice - always recommend they consult a qualified solicitor
- NEVER make promises about outcomes
- NEVER criticise the investigation process or authorities
- ALWAYS remind them that professional legal counsel is essential for their specific case
- If they express thoughts of self-harm, immediately provide crisis resources (999, Samaritans 116 123, Combat Stress 0800 138 1619)

Context about historical investigations:
- Many relate to operations in Northern Ireland, Iraq, and Afghanistan
- Veterans can be investigated years or decades after service
- The process can be lengthy and emotionally draining
- Family members are also affected
- Support exists but many veterans feel isolated

Remember: You are here to SUPPORT, not to solve legal problems. Your role is to help them feel heard, understood, and less alone during an incredibly difficult time.`;

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'sentry';
  timestamp: Date;
}

export default function SentryChatScreen() {
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

  useEffect(() => {
    loadSavedSession();
    // Add welcome message
    const welcomeMessage: Message = {
      id: 'welcome',
      text: "Hello, I'm Sentry. I'm here to provide support and understanding for veterans facing historical investigations or legal challenges related to their service.\n\nI want you to know that whatever you're going through, you're not alone. I can offer a listening ear, general information, and point you towards helpful resources.\n\nPlease remember: I provide emotional support and general guidance, not legal advice. For your specific legal situation, always consult a qualified solicitor.\n\nHow are you feeling today? What's on your mind?",
      sender: 'sentry',
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  }, []);

  const loadSavedSession = async () => {
    try {
      const storedEmail = await AsyncStorage.getItem('sentry_email');
      const storedPin = await AsyncStorage.getItem('sentry_pin');
      const storedMessages = await AsyncStorage.getItem('sentry_messages');
      
      if (storedEmail && storedPin) {
        setSavedEmail(storedEmail);
        setIsAuthenticated(true);
        if (storedMessages) {
          const parsed = JSON.parse(storedMessages);
          // Convert timestamp strings back to Date objects
          const messagesWithDates = parsed.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp)
          }));
          setMessages(messagesWithDates);
        }
      }
    } catch (error) {
      console.error('Error loading session:', error);
    }
  };

  const saveMessages = async (newMessages: Message[]) => {
    if (isAuthenticated) {
      try {
        await AsyncStorage.setItem('sentry_messages', JSON.stringify(newMessages));
      } catch (error) {
        console.error('Error saving messages:', error);
      }
    }
  };

  const handleSetupEmail = async () => {
    if (email && pin.length === 4) {
      try {
        await AsyncStorage.setItem('sentry_email', email);
        await AsyncStorage.setItem('sentry_pin', pin);
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
      // Build conversation history for context
      const conversationHistory = newMessages.slice(-10).map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      }));

      const response = await fetch(`${API_URL}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: inputText.trim(),
          system_prompt: SENTRY_SYSTEM_PROMPT,
          conversation_history: conversationHistory,
          character: 'sentry',
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      
      const sentryMessage: Message = {
        id: `sentry-${Date.now()}`,
        text: data.response || "I'm here to listen. Please tell me more about what you're going through.",
        sender: 'sentry',
        timestamp: new Date(),
      };

      const updatedMessages = [...newMessages, sentryMessage];
      setMessages(updatedMessages);
      await saveMessages(updatedMessages);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: `sentry-${Date.now()}`,
        text: "I'm having trouble connecting right now. Please know that support is available. If you need immediate help, please contact Combat Stress on 0800 138 1619 or Samaritans on 116 123.",
        sender: 'sentry',
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
      sender: 'sentry',
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
        <Image source={{ uri: SENTRY_AVATAR }} style={styles.headerAvatar} />
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Sentry</Text>
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
              message.sender === 'user' ? styles.userBubble : styles.sentryBubble,
            ]}
          >
            {message.sender === 'sentry' && (
              <View style={styles.sentryLabel}>
                <Image source={{ uri: SENTRY_AVATAR }} style={styles.sentryLabelAvatar} />
                <Text style={styles.sentryLabelText}>Sentry</Text>
              </View>
            )}
            <Text style={[
              styles.messageText,
              message.sender === 'user' ? styles.userText : styles.sentryText,
            ]}>
              {message.text}
            </Text>
          </View>
        ))}
        {isLoading && (
          <View style={[styles.messageBubble, styles.sentryBubble]}>
            <View style={styles.sentryLabel}>
              <Image source={{ uri: SENTRY_AVATAR }} style={styles.sentryLabelAvatar} />
              <Text style={styles.sentryLabelText}>Sentry</Text>
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
  sentryBubble: {
    backgroundColor: '#243447',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  sentryLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sentryLabelAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 6,
  },
  sentryLabelText: {
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
  sentryText: {
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
});
