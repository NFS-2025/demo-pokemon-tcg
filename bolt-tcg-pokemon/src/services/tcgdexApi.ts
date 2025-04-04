import axios from 'axios';

const API_URL = 'https://api.tcgdex.net/v2';

const apiClient = axios.create({
  baseURL: API_URL
});

export interface TcgdexCard {
  id: string;
  name: string;
  image: string;
  supertype: string;
  subtypes?: string[];
  hp?: number;
  types?: string[];
  rarity?: string;
  set: {
    id: string;
    name: string;
    series: string;
    releaseDate?: string;
  };
  legal?: {
    standard: boolean;
    expanded: boolean;
  };
}

export interface TcgdexSet {
  id: string;
  name: string;
  serie: string;
  releaseDate?: string;
  cardCount: {
    total: number;
    official: number;
  };
  logo?: string;
  symbol?: string;
}

export interface SearchParams {
  page?: number;
  pageSize?: number;
}

export const tcgdexApi = {
  async getCards(): Promise<TcgdexCard[]> {
    try {
      // L'API TCGdex ne supporte pas directement la pagination
      // donc nous récupérons d'abord un set puis ses cartes
      const response = await apiClient.get('/en/sets/base1');
      return response.data;
    } catch (error) {
      console.error('Error fetching cards:', error);
      throw error;
    }
  },

  async getCardById(id: string): Promise<TcgdexCard> {
    try {
      const response = await apiClient.get(`/en/cards/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching card with id ${id}:`, error);
      throw error;
    }
  },

  async getSets(): Promise<TcgdexSet[]> {
    try {
      const response = await apiClient.get('/en/sets');
      return response.data;
    } catch (error) {
      console.error('Error fetching sets:', error);
      throw error;
    }
  },

  async getCardsBySetId(setId: string): Promise<TcgdexCard[]> {
    try {
      const response = await apiClient.get(`/en/sets/${setId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching cards from set ${setId}:`, error);
      throw error;
    }
  },
  
  async searchCards(searchTerm: string): Promise<TcgdexCard[]> {
    try {
      // TCGdex n'a pas de point de terminaison de recherche directe
      // Nous devons obtenir toutes les cartes d'un ensemble et filtrer côté client
      const cards = await this.getCards();
      return cards.filter(card => 
        card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (card.id && card.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (card.types && card.types.some(type => type.toLowerCase().includes(searchTerm.toLowerCase())))
      );
    } catch (error) {
      console.error('Error searching cards:', error);
      throw error;
    }
  }
};
