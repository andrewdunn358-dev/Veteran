import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FavoritesContextType {
  favoriteCounsellors: string[];
  favoritePeers: string[];
  toggleFavoriteCounsellor: (id: string) => void;
  toggleFavoritePeer: (id: string) => void;
  isFavoriteCounsellor: (id: string) => boolean;
  isFavoritePeer: (id: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

const FAVORITES_COUNSELLORS_KEY = '@veterans_favorite_counsellors';
const FAVORITES_PEERS_KEY = '@veterans_favorite_peers';

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favoriteCounsellors, setFavoriteCounsellors] = useState<string[]>([]);
  const [favoritePeers, setFavoritePeers] = useState<string[]>([]);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const [counsellors, peers] = await Promise.all([
        AsyncStorage.getItem(FAVORITES_COUNSELLORS_KEY),
        AsyncStorage.getItem(FAVORITES_PEERS_KEY),
      ]);
      
      if (counsellors) setFavoriteCounsellors(JSON.parse(counsellors));
      if (peers) setFavoritePeers(JSON.parse(peers));
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const toggleFavoriteCounsellor = async (id: string) => {
    try {
      const newFavorites = favoriteCounsellors.includes(id)
        ? favoriteCounsellors.filter(fav => fav !== id)
        : [...favoriteCounsellors, id];
      
      await AsyncStorage.setItem(FAVORITES_COUNSELLORS_KEY, JSON.stringify(newFavorites));
      setFavoriteCounsellors(newFavorites);
    } catch (error) {
      console.error('Error toggling favorite counsellor:', error);
    }
  };

  const toggleFavoritePeer = async (id: string) => {
    try {
      const newFavorites = favoritePeers.includes(id)
        ? favoritePeers.filter(fav => fav !== id)
        : [...favoritePeers, id];
      
      await AsyncStorage.setItem(FAVORITES_PEERS_KEY, JSON.stringify(newFavorites));
      setFavoritePeers(newFavorites);
    } catch (error) {
      console.error('Error toggling favorite peer:', error);
    }
  };

  const isFavoriteCounsellor = (id: string) => favoriteCounsellors.includes(id);
  const isFavoritePeer = (id: string) => favoritePeers.includes(id);

  return (
    <FavoritesContext.Provider value={{
      favoriteCounsellors,
      favoritePeers,
      toggleFavoriteCounsellor,
      toggleFavoritePeer,
      isFavoriteCounsellor,
      isFavoritePeer,
    }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
