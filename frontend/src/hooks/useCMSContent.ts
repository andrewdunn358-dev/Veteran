import { useState, useEffect, useCallback } from 'react';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';

export interface CMSCard {
  id: string;
  section_id: string;
  card_type: string;
  title: string;
  description: string | null;
  icon: string | null;
  image_url: string | null;
  color: string | null;
  bg_color: string | null;
  route: string | null;
  external_url: string | null;
  phone: string | null;
  order: number;
  is_visible: boolean;
  metadata: any;
}

export interface CMSSection {
  id: string;
  page_slug: string;
  section_type: string;
  title: string | null;
  subtitle: string | null;
  content: string | null;
  order: number;
  is_visible: boolean;
  settings: any;
  cards: CMSCard[];
}

export interface CMSPage {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  icon: string | null;
  is_visible: boolean;
  show_in_nav: boolean;
  nav_order: number;
  sections: CMSSection[];
}

interface UseCMSContentResult {
  page: CMSPage | null;
  sections: CMSSection[];
  cards: CMSCard[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useCMSContent(pageSlug: string): UseCMSContentResult {
  const [page, setPage] = useState<CMSPage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContent = useCallback(async () => {
    if (!pageSlug) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/api/cms/pages/${pageSlug}`);
      
      if (response.status === 404) {
        // Page not found in CMS - this is not an error, just means no CMS content
        setPage(null);
        setIsLoading(false);
        return;
      }
      
      if (!response.ok) {
        throw new Error(`Failed to fetch CMS content: ${response.status}`);
      }
      
      const data = await response.json();
      setPage(data);
    } catch (err) {
      console.error('CMS fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load content');
      setPage(null);
    } finally {
      setIsLoading(false);
    }
  }, [pageSlug]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  // Extract all sections and cards for convenience
  const sections = page?.sections || [];
  const cards = sections.flatMap(s => s.cards || []);

  return {
    page,
    sections,
    cards,
    isLoading,
    error,
    refetch: fetchContent,
  };
}

// Helper to get cards by section type
export function getCardsByType(sections: CMSSection[], sectionType: string): CMSCard[] {
  const section = sections.find(s => s.section_type === sectionType);
  return section?.cards || [];
}

// Helper to get a specific section
export function getSection(sections: CMSSection[], sectionType: string): CMSSection | undefined {
  return sections.find(s => s.section_type === sectionType);
}
