import axios from 'axios';

const API_URL = 'https://api.pokemontcg.io/v2';
const API_KEY = 'your-api-key'; // Remplacez par votre clé API ou utilisez une variable d'environnement

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'X-Api-Key': API_KEY,
  },
});

export interface PokemonCard {
  id: string;
  name: string;
  supertype: string;
  subtypes: string[];
  hp?: string;
  types?: string[];
  images: {
    small: string;
    large: string;
  };
  rarity?: string;
  set: {
    id: string;
    name: string;
    series: string;
  };
}

export interface PokemonCardSet {
  id: string;
  name: string;
  series: string;
  releaseDate: string;
  images: {
    symbol: string;
    logo: string;
  };
}

export interface SearchParams {
  page?: number;
  pageSize?: number;
  q?: string;
  orderBy?: string;
}

export const pokemonTcgApi = {
  async getCards(params: SearchParams = { page: 1, pageSize: 20 }): Promise<{ data: PokemonCard[], totalCount: number }> {
    try {
      const response = await apiClient.get('/cards', { params });
      return {
        data: response.data.data,
        totalCount: response.data.totalCount,
      };
    } catch (error) {
      console.error('Error fetching cards:', error);
      throw error;
    }
  },

  async getCardById(id: string): Promise<PokemonCard> {
    try {
      const response = await apiClient.get(`/cards/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching card with id ${id}:`, error);
      throw error;
    }
  },

  async getSets(): Promise<PokemonCardSet[]> {
    try {
      const response = await apiClient.get('/sets');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching sets:', error);
      throw error;
    }
  },

  async searchCards(searchTerm: string, params: SearchParams = { page: 1, pageSize: 20 }): Promise<{ data: PokemonCard[], totalCount: number }> {
    const queryParams = {
      ...params,
      q: searchTerm,
    };
    
    try {
      const response = await apiClient.get('/cards', { params: queryParams });
      return {
        data: response.data.data,
        totalCount: response.data.totalCount,
      };
    } catch (error) {
      console.error('Error searching cards:', error);
      throw error;
    }
  }
};
