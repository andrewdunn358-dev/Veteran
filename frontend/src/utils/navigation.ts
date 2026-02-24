import { Router } from 'expo-router';

/**
 * Safely navigate back, handling the case where there's no history
 * (e.g., after a page refresh in web browser)
 * 
 * @param router - The expo-router router instance
 * @param fallbackPath - The path to navigate to if there's no history (default: '/home')
 */
export const safeGoBack = (router: Router, fallbackPath: string = '/home') => {
  if (typeof window !== 'undefined') {
    // Check if we can go back by testing history state
    // If history.length is 1 or less, or if this appears to be a direct load
    // (referrer is empty and history.length is small), navigate to fallback
    const canGoBack = window.history.length > 2 || document.referrer !== '';
    
    if (!canGoBack) {
      router.replace(fallbackPath);
      return;
    }
  }
  router.back();
};
