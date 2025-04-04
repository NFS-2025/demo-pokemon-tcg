import axios from 'axios';

const API_URL = 'https://api.tcgdex.net/v2';

const apiClient = axios.create({
  baseURL: API_URL
});

export interface TcgdexCard {
  id: string;
  name: string;
  image: string; // URL de l'image
  localId?: string;
}

export interface TcgdexSet {
  id: string;
  name: string;
  serie: {
    id: string;
    name: string;
  };
  releaseDate?: string;
  cardCount: {
    total: number;
    official: number;
  };
  logo?: string;
  cards?: TcgdexCard[];
}

export interface SearchParams {
  page?: number;
  pageSize?: number;
}

export const tcgdexApi = {
  async getCards(setId: string = 'base1'): Promise<TcgdexCard[]> {
    try {
      const response = await apiClient.get(`/en/sets/${setId}`);
      return response.data.cards || [];
    } catch (error) {
      console.error('Error fetching cards:', error);
      throw error;
    }
  },

  async getCardById(id: string): Promise<any> {
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
      // Transforme l'objet en tableau
      const sets = Object.values(response.data) as TcgdexSet[];
      return sets;
    } catch (error) {
      console.error('Error fetching sets:', error);
      throw error;
    }
  },

  async getSetById(setId: string): Promise<TcgdexSet> {
    try {
      const response = await apiClient.get(`/en/sets/${setId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching set ${setId}:`, error);
      throw error;
    }
  },
  
  async searchCards(searchTerm: string, setId: string = 'base1'): Promise<TcgdexCard[]> {
    try {
      // Récupère les cartes du set spécifié
      const set = await this.getSetById(setId);
      
      if (!set.cards || set.cards.length === 0) {
        return [];
      }
      
      // Filtre les cartes selon le terme de recherche
      return set.cards.filter(card => 
        card.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } catch (error) {
      console.error('Error searching cards:', error);
      throw error;
    }
  }
};
