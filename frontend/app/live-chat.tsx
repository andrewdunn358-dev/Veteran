import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  Alert,
  Linking,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'staff';
  timestamp: Date;
}

export default function LiveChat() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    staffType: string;
    alertId: string;
    sessionId: string;
  }>();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [chatRoomId, setChatRoomId] = useState<string | null>(null);
  const [waitingForStaff, setWaitingForStaff] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);
  const pollInterval = useRef<NodeJS.Timeout | null>(null);

  const staffType = params.staffType || 'counsellor';
  const alertId = params.alertId || '';
  const sessionId = params.sessionId || '';

  // Initialize chat room
  useEffect(() => {
    initializeChat();
    return () => {
      if (pollInterval.current) {
        clearInterval(pollInterval.current);
      }
    };
  }, []);

  const initializeChat = async () => {
    setIsLoading(true);
    try {
      // Create a live chat room - no specific staff assigned
      // All staff will see this and can pick it up
      const response = await fetch(`${API_URL}/api/live-chat/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staff_type: staffType,
          safeguarding_alert_id: alertId || null,
          ai_session_id: sessionId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setChatRoomId(data.room_id);
        setIsConnected(true);
        
        // Add initial system message
        setMessages([{
          id: 'welcome',
          text: `You're now connected. ${staffName} has been notified and will respond shortly. In the meantime, feel free to share what's on your mind.`,
          sender: 'staff',
          timestamp: new Date(),
        }]);

        // Start polling for new messages
        startPolling(data.room_id);
      } else {
        throw new Error('Failed to create chat room');
      }
    } catch (error) {
      console.error('Error initializing chat:', error);
      Alert.alert(
        'Connection Issue',
        'Unable to start live chat. Would you like to try calling instead?',
        [
          { text: 'Go Back', onPress: () => router.back() },
          { text: 'Call Support', onPress: () => Linking.openURL('tel:116123') },
        ]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const startPolling = (roomId: string) => {
    // Poll for new messages every 3 seconds
    pollInterval.current = setInterval(async () => {
      try {
        const response = await fetch(`${API_URL}/api/live-chat/rooms/${roomId}/messages`);
        if (response.ok) {
          const data = await response.json();
          if (data.messages && data.messages.length > 0) {
            setMessages(prev => {
              const existingIds = new Set(prev.map(m => m.id));
              const newMessages = data.messages.filter((m: any) => !existingIds.has(m.id));
              if (newMessages.length > 0) {
                return [...prev, ...newMessages.map((m: any) => ({
                  id: m.id,
                  text: m.text,
                  sender: m.sender as 'user' | 'staff',
                  timestamp: new Date(m.timestamp),
                }))];
              }
              return prev;
            });
          }
        }
      } catch (error) {
        console.log('Polling error:', error);
      }
    }, 3000);
  };

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading || !chatRoomId) return;

    const messageText = inputText.trim();
    const tempId = `user-${Date.now()}`;
    
    // Optimistically add message
    const userMessage: Message = {
      id: tempId,
      text: messageText,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    try {
      await fetch(`${API_URL}/api/live-chat/rooms/${chatRoomId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: messageText,
          sender: 'user',
        }),
      });
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Message failed to send. Please try again.');
    }
  };

  const handleEndChat = () => {
    Alert.alert(
      'End Chat',
      'Are you sure you want to end this chat? You can always request another callback or call directly.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'End Chat', 
          style: 'destructive',
          onPress: async () => {
            if (chatRoomId) {
              try {
                await fetch(`${API_URL}/api/live-chat/rooms/${chatRoomId}/end`, {
                  method: 'POST',
                });
              } catch (e) {
                console.log('Error ending chat:', e);
              }
            }
            if (pollInterval.current) {
              clearInterval(pollInterval.current);
            }
            router.replace('/home');
          }
        },
      ]
    );
  };

  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (isLoading && !isConnected) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Connecting you with {staffName}...</Text>
        <Text style={styles.loadingSubtext}>This may take a moment</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleEndChat} style={styles.endButton}>
          <FontAwesome5 name="times" size={18} color="#ef4444" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={styles.staffAvatar}>
            <FontAwesome5 
              name={staffType === 'counsellor' ? 'user-md' : 'users'} 
              size={18} 
              color="#fff" 
            />
          </View>
          <View>
            <Text style={styles.headerTitle}>{staffName}</Text>
            <View style={styles.statusRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.headerSubtitle}>Live Chat</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.callButton}
          onPress={() => Linking.openURL('tel:116123')}
        >
          <FontAwesome5 name="phone-alt" size={16} color="#16a34a" />
        </TouchableOpacity>
      </View>

      {/* Connection Banner */}
      <View style={styles.connectionBanner}>
        <FontAwesome5 name="shield-alt" size={14} color="#16a34a" />
        <Text style={styles.connectionText}>
          Secure connection - this chat is confidential
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
              message.sender === 'user' ? styles.userBubble : styles.staffBubble,
            ]}
          >
            {message.sender === 'staff' && (
              <View style={styles.staffLabel}>
                <FontAwesome5 
                  name={staffType === 'counsellor' ? 'user-md' : 'user'} 
                  size={12} 
                  color="#16a34a" 
                />
                <Text style={styles.staffLabelText}>{staffName}</Text>
              </View>
            )}
            <Text
              style={[
                styles.messageText,
                message.sender === 'user' ? styles.userText : styles.staffText,
              ]}
            >
              {message.text}
            </Text>
            <Text style={styles.timestamp}>
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={styles.quickAction}
          onPress={() => Linking.openURL('tel:116123')}
        >
          <FontAwesome5 name="phone-alt" size={14} color="#64748b" />
          <Text style={styles.quickActionText}>Call Samaritans</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.quickAction}
          onPress={() => router.push('/crisis-support')}
        >
          <FontAwesome5 name="list" size={14} color="#64748b" />
          <Text style={styles.quickActionText}>More Options</Text>
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
        />
        <TouchableOpacity
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!inputText.trim()}
        >
          <FontAwesome5 name="paper-plane" size={16} color="#fff" />
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
  loadingContainer: {
    flex: 1,
    backgroundColor: '#1a2634',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginTop: 20,
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a2634',
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  endButton: {
    padding: 10,
    backgroundColor: '#2d3a4d',
    borderRadius: 8,
    marginRight: 12,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  staffAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#16a34a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#16a34a',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#94a3b8',
  },
  callButton: {
    padding: 12,
    backgroundColor: '#2d3a4d',
    borderRadius: 8,
  },
  connectionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0fdf4',
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 8,
  },
  connectionText: {
    fontSize: 12,
    color: '#16a34a',
    fontWeight: '500',
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
  staffBubble: {
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  staffLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 6,
  },
  staffLabelText: {
    fontSize: 11,
    color: '#16a34a',
    fontWeight: '600',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: '#fff',
  },
  staffText: {
    color: '#1e293b',
  },
  timestamp: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
  },
  quickActionText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
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
    backgroundColor: '#16a34a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
});
