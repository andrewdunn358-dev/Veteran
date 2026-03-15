/**
 * Character Service - Fetches AI characters from the database via API
 * This replaces hardcoded character config with dynamic data
 */

import { API_URL } from '../config/api';

export interface AICharacter {
  id: string;
  name: string;
  avatar: string;
  role: string;
  description: string;
  welcomeMessage: string;
  systemPrompt: string;
  accentColor: string;
  consentKey: string;
  bio?: string;
  topics?: string[];
  category?: string;
}

interface CharactersResponse {
  characters: AICharacter[];
  source: string;
}

// Cache for characters
let cachedCharacters: AICharacter[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch all characters from the API
 */
export async function fetchCharacters(): Promise<AICharacter[]> {
  // Return cached data if fresh
  if (cachedCharacters && Date.now() - cacheTimestamp < CACHE_DURATION) {
    return cachedCharacters;
  }

  try {
    const response = await fetch(`${API_URL}/api/ai-characters`);
    if (!response.ok) {
      throw new Error('Failed to fetch characters');
    }
    
    const data: CharactersResponse = await response.json();
    cachedCharacters = data.characters || [];
    cacheTimestamp = Date.now();
    
    console.log('[CharacterService] Loaded', cachedCharacters.length, 'characters from', data.source);
    return cachedCharacters;
  } catch (error) {
    console.error('[CharacterService] Error fetching characters:', error);
    // Return cached data even if stale, or empty array
    return cachedCharacters || [];
  }
}

/**
 * Get a single character by ID
 */
export async function getCharacter(id: string): Promise<AICharacter | null> {
  const characters = await fetchCharacters();
  return characters.find(c => c.id === id) || null;
}

/**
 * Get characters by category
 */
export async function getCharactersByCategory(category: string): Promise<AICharacter[]> {
  const characters = await fetchCharacters();
  return characters.filter(c => c.category === category);
}

/**
 * Get crisis support characters (Tommy & Rachel)
 */
export async function getCrisisCharacters(): Promise<AICharacter[]> {
  const characters = await fetchCharacters();
  return characters.filter(c => ['tommy', 'doris'].includes(c.id));
}

/**
 * Clear the cache (useful after admin updates)
 */
export function clearCharacterCache(): void {
  cachedCharacters = null;
  cacheTimestamp = 0;
}
