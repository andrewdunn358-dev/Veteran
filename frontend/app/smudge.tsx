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
} from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'https://veterans-support-api.onrender.com';

// Smudge avatar image
const SMUDGE_AVATAR = 'https://customer-assets.emergentagent.com/job_47488e3d-c9ce-4f22-ba89-b000b32c4954/artifacts/p19mvb79_Gemini_Generated_Image_aoryglaoryglaory.png';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'smudge';
  timestamp: Date;
}

export default function SmudgeChat() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `smudge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  const scrollViewRef = useRef<ScrollView>(null);

  // Welcome message on mount
  useEffect(() => {
    setMessages([{
      id: 'welcome',
      text: "Hello, I'm Smudge. I'm an AI listener here to provide a space for you to talk. I'm not a counsellor and can't give advice, but I can listen and help you feel heard. How are you doing today?",
      sender: 'smudge',
      timestamp: new Date(),
    }]);
  }, []);

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
      const response = await fetch(`${API_URL}/api/smudge/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.text,
          sessionId: sessionId,
        }),
      });

      const data = await response.json();

      if (response.ok && data.reply) {
        const smudgeMessage: Message = {
          id: `smudge-${Date.now()}`,
          text: data.reply,
          sender: 'smudge',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, smudgeMessage]);
      } else {
        const errorMessage: Message = {
          id: `error-${Date.now()}`,
          text: data.detail || "I'm having trouble right now. Please try again or speak to a real person using the buttons below.",
          sender: 'smudge',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        text: "I'm having trouble connecting. Please check your internet or speak to a real person using the buttons below.",
        sender: 'smudge',
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
          <Image source={{ uri: SMUDGE_AVATAR }} style={styles.avatarImage} />
          <View>
            <Text style={styles.headerTitle}>Smudge</Text>
            <Text style={styles.headerSubtitle}>AI Listener</Text>
          </View>
        </View>
      </View>

      {/* Disclaimer */}
      <View style={styles.disclaimer}>
        <FontAwesome5 name="info-circle" size={14} color="#64748b" />
        <Text style={styles.disclaimerText}>
          Smudge is an AI and cannot provide advice or replace human support.
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
              message.sender === 'user' ? styles.userBubble : styles.smudgeBubble,
            ]}
          >
            {message.sender === 'smudge' && (
              <View style={styles.smudgeLabel}>
                <Image source={{ uri: SMUDGE_AVATAR }} style={styles.smudgeLabelAvatar} />
                <Text style={styles.smudgeLabelText}>Smudge (AI listener)</Text>
              </View>
            )}
            <Text
              style={[
                styles.messageText,
                message.sender === 'user' ? styles.userText : styles.smudgeText,
              ]}
            >
              {message.text}
            </Text>
          </View>
        ))}
        {isLoading && (
          <View style={[styles.messageBubble, styles.smudgeBubble]}>
            <View style={styles.smudgeLabel}>
              <Image source={{ uri: SMUDGE_AVATAR }} style={styles.smudgeLabelAvatar} />
              <Text style={styles.smudgeLabelText}>Smudge (AI listener)</Text>
            </View>
            <View style={styles.typingIndicator}>
              <ActivityIndicator size="small" color="#4a90d9" />
              <Text style={styles.typingText}>Smudge is typing...</Text>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#94a3b8',
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
  smudgeBubble: {
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  smudgeLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 6,
  },
  smudgeLabelAvatar: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  smudgeLabelText: {
    fontSize: 11,
    color: '#4a90d9',
    fontWeight: '600',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: '#fff',
  },
  smudgeText: {
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
