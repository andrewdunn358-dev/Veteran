/**
 * Conversation Storage Service
 * ============================
 * 
 * Stores conversation history on the user's device for continuity across sessions.
 * 
 * Features:
 * - Stores last 50 messages per AI character
 * - Generates AI summaries of conversations
 * - Privacy controls (view/delete/opt-out)
 * - Feeds into safeguarding system for cross-session context
 * 
 * Storage structure:
 * - Full transcripts (last 50 messages per character)
 * - Session summaries (AI-generated)
 * - Risk flags from previous sessions
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const STORAGE_KEYS = {
  CONVERSATIONS: 'radiocheck_conversations',
  SUMMARIES: 'radiocheck_summaries',
  OPT_OUT: 'radiocheck_storage_opt_out',
  LAST_SYNC: 'radiocheck_last_sync',
};

// Configuration
const MAX_MESSAGES_PER_CHARACTER = 50;
const MAX_SESSIONS_TO_KEEP = 10;

// Types
export interface StoredMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  riskScore?: number;
  riskLevel?: string;
}

export interface ConversationData {
  characterId: string;
  characterName: string;
  messages: StoredMessage[];
  lastUpdated: string;
  totalMessageCount: number;
}

export interface SessionSummary {
  sessionId: string;
  characterId: string;
  characterName: string;
  date: string;
  summary: string;
  keyTopics: string[];
  emotionalState?: string;
  riskFlags: string[];
  messageCount: number;
}

export interface StorageStatus {
  optedOut: boolean;
  totalMessages: number;
  totalSessions: number;
  characters: string[];
  storageSize: string;
}

/**
 * Check if user has opted out of conversation storage
 */
export async function isStorageOptedOut(): Promise<boolean> {
  try {
    const optOut = await AsyncStorage.getItem(STORAGE_KEYS.OPT_OUT);
    return optOut === 'true';
  } catch (error) {
    console.error('[ConversationStorage] Error checking opt-out:', error);
    return false;
  }
}

/**
 * Set opt-out preference
 */
export async function setStorageOptOut(optOut: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.OPT_OUT, optOut ? 'true' : 'false');
    
    // If opting out, clear all stored data
    if (optOut) {
      await clearAllStoredData();
    }
  } catch (error) {
    console.error('[ConversationStorage] Error setting opt-out:', error);
  }
}

/**
 * Store a new message in the conversation history
 */
export async function storeMessage(
  characterId: string,
  characterName: string,
  message: StoredMessage
): Promise<void> {
  try {
    // Check opt-out
    if (await isStorageOptedOut()) {
      return;
    }
    
    // Get existing conversations
    const conversations = await getConversations();
    
    // Find or create conversation for this character
    let conversation = conversations.find(c => c.characterId === characterId);
    
    if (!conversation) {
      conversation = {
        characterId,
        characterName,
        messages: [],
        lastUpdated: new Date().toISOString(),
        totalMessageCount: 0,
      };
      conversations.push(conversation);
    }
    
    // Add the message
    conversation.messages.push(message);
    conversation.lastUpdated = new Date().toISOString();
    conversation.totalMessageCount++;
    
    // Trim to max messages
    if (conversation.messages.length > MAX_MESSAGES_PER_CHARACTER) {
      conversation.messages = conversation.messages.slice(-MAX_MESSAGES_PER_CHARACTER);
    }
    
    // Save back
    await AsyncStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
    
  } catch (error) {
    console.error('[ConversationStorage] Error storing message:', error);
  }
}

/**
 * Store multiple messages at once (for batch updates)
 */
export async function storeMessages(
  characterId: string,
  characterName: string,
  messages: StoredMessage[]
): Promise<void> {
  for (const message of messages) {
    await storeMessage(characterId, characterName, message);
  }
}

/**
 * Get all stored conversations
 */
export async function getConversations(): Promise<ConversationData[]> {
  try {
    if (await isStorageOptedOut()) {
      return [];
    }
    
    const data = await AsyncStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('[ConversationStorage] Error getting conversations:', error);
    return [];
  }
}

/**
 * Get conversation history for a specific character
 */
export async function getConversationForCharacter(characterId: string): Promise<ConversationData | null> {
  try {
    const conversations = await getConversations();
    return conversations.find(c => c.characterId === characterId) || null;
  } catch (error) {
    console.error('[ConversationStorage] Error getting conversation:', error);
    return null;
  }
}

/**
 * Get recent messages for a character (for AI context)
 */
export async function getRecentMessages(
  characterId: string,
  count: number = 50
): Promise<StoredMessage[]> {
  try {
    const conversation = await getConversationForCharacter(characterId);
    if (!conversation) {
      return [];
    }
    return conversation.messages.slice(-count);
  } catch (error) {
    console.error('[ConversationStorage] Error getting recent messages:', error);
    return [];
  }
}

/**
 * Store a session summary
 */
export async function storeSessionSummary(summary: SessionSummary): Promise<void> {
  try {
    if (await isStorageOptedOut()) {
      return;
    }
    
    const summaries = await getSessionSummaries();
    summaries.push(summary);
    
    // Trim to max sessions
    if (summaries.length > MAX_SESSIONS_TO_KEEP) {
      summaries.splice(0, summaries.length - MAX_SESSIONS_TO_KEEP);
    }
    
    await AsyncStorage.setItem(STORAGE_KEYS.SUMMARIES, JSON.stringify(summaries));
    
  } catch (error) {
    console.error('[ConversationStorage] Error storing summary:', error);
  }
}

/**
 * Get all session summaries
 */
export async function getSessionSummaries(): Promise<SessionSummary[]> {
  try {
    if (await isStorageOptedOut()) {
      return [];
    }
    
    const data = await AsyncStorage.getItem(STORAGE_KEYS.SUMMARIES);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('[ConversationStorage] Error getting summaries:', error);
    return [];
  }
}

/**
 * Get session summaries for a specific character
 */
export async function getSessionSummariesForCharacter(characterId: string): Promise<SessionSummary[]> {
  try {
    const summaries = await getSessionSummaries();
    return summaries.filter(s => s.characterId === characterId);
  } catch (error) {
    console.error('[ConversationStorage] Error getting character summaries:', error);
    return [];
  }
}

/**
 * Get previous session context for AI (formatted for prompts)
 */
export async function getPreviousSessionContext(characterId: string): Promise<{
  summaries: SessionSummary[];
  recentMessages: StoredMessage[];
  hasRiskHistory: boolean;
  riskFlags: string[];
}> {
  try {
    const summaries = await getSessionSummariesForCharacter(characterId);
    const recentMessages = await getRecentMessages(characterId, 20);
    
    // Collect all risk flags from previous sessions
    const allRiskFlags = summaries.flatMap(s => s.riskFlags);
    const uniqueRiskFlags = [...new Set(allRiskFlags)];
    
    return {
      summaries: summaries.slice(-5), // Last 5 sessions
      recentMessages,
      hasRiskHistory: uniqueRiskFlags.length > 0,
      riskFlags: uniqueRiskFlags,
    };
  } catch (error) {
    console.error('[ConversationStorage] Error getting session context:', error);
    return {
      summaries: [],
      recentMessages: [],
      hasRiskHistory: false,
      riskFlags: [],
    };
  }
}

/**
 * Delete conversation history for a specific character
 */
export async function deleteConversationForCharacter(characterId: string): Promise<void> {
  try {
    const conversations = await getConversations();
    const filtered = conversations.filter(c => c.characterId !== characterId);
    await AsyncStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(filtered));
    
    // Also delete summaries for this character
    const summaries = await getSessionSummaries();
    const filteredSummaries = summaries.filter(s => s.characterId !== characterId);
    await AsyncStorage.setItem(STORAGE_KEYS.SUMMARIES, JSON.stringify(filteredSummaries));
    
  } catch (error) {
    console.error('[ConversationStorage] Error deleting conversation:', error);
  }
}

/**
 * Clear all stored data
 */
export async function clearAllStoredData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.CONVERSATIONS,
      STORAGE_KEYS.SUMMARIES,
      STORAGE_KEYS.LAST_SYNC,
    ]);
  } catch (error) {
    console.error('[ConversationStorage] Error clearing data:', error);
  }
}

/**
 * Get storage status for privacy settings
 */
export async function getStorageStatus(): Promise<StorageStatus> {
  try {
    const optedOut = await isStorageOptedOut();
    
    if (optedOut) {
      return {
        optedOut: true,
        totalMessages: 0,
        totalSessions: 0,
        characters: [],
        storageSize: '0 KB',
      };
    }
    
    const conversations = await getConversations();
    const summaries = await getSessionSummaries();
    
    const totalMessages = conversations.reduce((sum, c) => sum + c.messages.length, 0);
    const characters = conversations.map(c => c.characterName);
    
    // Estimate storage size
    const convSize = JSON.stringify(conversations).length;
    const sumSize = JSON.stringify(summaries).length;
    const totalBytes = convSize + sumSize;
    const sizeKB = (totalBytes / 1024).toFixed(1);
    
    return {
      optedOut: false,
      totalMessages,
      totalSessions: summaries.length,
      characters,
      storageSize: `${sizeKB} KB`,
    };
  } catch (error) {
    console.error('[ConversationStorage] Error getting status:', error);
    return {
      optedOut: false,
      totalMessages: 0,
      totalSessions: 0,
      characters: [],
      storageSize: '0 KB',
    };
  }
}

/**
 * Generate a session summary (to be called by AI service)
 */
export function createSessionSummary(
  sessionId: string,
  characterId: string,
  characterName: string,
  messages: StoredMessage[],
  aiGeneratedSummary: string,
  keyTopics: string[],
  emotionalState?: string,
  riskFlags: string[] = []
): SessionSummary {
  return {
    sessionId,
    characterId,
    characterName,
    date: new Date().toISOString(),
    summary: aiGeneratedSummary,
    keyTopics,
    emotionalState,
    riskFlags,
    messageCount: messages.length,
  };
}

/**
 * Export conversation data (for user to download)
 */
export async function exportConversationData(): Promise<string> {
  try {
    const conversations = await getConversations();
    const summaries = await getSessionSummaries();
    
    const exportData = {
      exportDate: new Date().toISOString(),
      conversations,
      summaries,
    };
    
    return JSON.stringify(exportData, null, 2);
  } catch (error) {
    console.error('[ConversationStorage] Error exporting data:', error);
    return '{}';
  }
}
