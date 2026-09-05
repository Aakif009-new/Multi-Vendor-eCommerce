import axios from 'axios';
import { env } from '../config/env';

export class PexelsService {
  private static readonly BASE_URL = 'https://api.pexels.com/v1';

  /**
   * Search Pexels API for a relevant product photo by name & category query
   */
  static async searchProductImage(query: string, fallbackTerm = 'product'): Promise<string> {
    try {
      if (!env.PEXELS_API_KEY || env.PEXELS_API_KEY.includes('your_pexels_api_key')) {
        return this.getCuratedFallbackImage(fallbackTerm);
      }

      const response = await axios.get(`${this.BASE_URL}/search`, {
        headers: {
          Authorization: env.PEXELS_API_KEY,
        },
        params: {
          query,
          per_page: 1,
          orientation: 'square',
        },
        timeout: 8000,
      });

      if (response.data && response.data.photos && response.data.photos.length > 0) {
        const photo = response.data.photos[0];
        return photo.src.large2x || photo.src.large || photo.src.medium;
      }

      return this.getCuratedFallbackImage(fallbackTerm);
    } catch (error: any) {
      console.warn(`[Pexels API]: Could not fetch for "${query}". Using curated fallback:`, error?.message || error);
      return this.getCuratedFallbackImage(fallbackTerm);
    }
  }

  /**
   * Fallback curated high-resolution photography URLs by category
   */
  private static getCuratedFallbackImage(category: string): string {
    const categoryMap: Record<string, string> = {
      electronics: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
      computers: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80',
      mens_fashion: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
      womens_fashion: 'https://images.unsplash.com/photo-1618244972963-dbee1a7edc95?auto=format&fit=crop&w=800&q=80',
      home_kitchen: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=800&q=80',
      beauty: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
      grocery: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80',
      sports: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
      books: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
      toys: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=800&q=80',
      automotive: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
      mobile_accessories: 'https://images.unsplash.com/photo-1586105251261-72a756497a11?auto=format&fit=crop&w=800&q=80',
    };

    return categoryMap[category.toLowerCase()] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80';
  }
}
