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

export default function AIChat() {
  const router = useRouter();
  const { character = 'tommy' } = useLocalSearchParams<{ character: string }>();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [characterInfo, setCharacterInfo] = useState<CharacterInfo>({ name: 'Tommy', avatar: '' });
  const [sessionId] = useState(() => `${character}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  const [showSafeguardingModal, setShowSafeguardingModal] = useState(false);
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
            <Text style={styles.headerSubtitle}>AI Battle Buddy</Text>
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
});
