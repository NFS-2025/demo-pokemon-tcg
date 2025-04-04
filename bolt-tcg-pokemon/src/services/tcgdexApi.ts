import axios from 'axios';

const API_URL = 'https://api.tcgdex.net/v2';
const ASSETS_URL = 'https://assets.tcgdex.net';

const apiClient = axios.create({
  baseURL: API_URL
});

export interface TcgdexCard {
  id: string;
  name: string;
  image: string; // URL de l'image
  localId?: string;
  // Champs additionnels qui peuvent être présents dans la réponse détaillée
  category?: string;
  illustrator?: string;
  hp?: number;
  types?: string[];
  evolveFrom?: string;
  stage?: string;
  attacks?: any[];
  resistances?: any[];
  weaknesses?: any[];
  // Ajout de textures pour la carte détaillée
  textures?: {
    small: string;
    large: string;
    etched?: string;
  };
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
  symbol?: string;
  cards?: TcgdexCard[];
}

export interface SearchParams {
  page?: number;
  pageSize?: number;
}

const quality = "low"
const extension = "webp"
// Fonction utilitaire pour construire les URLs d'assets correctement
const buildAssetUrl = (baseUrl: string): string => {
  // Structure des URLs selon la documentation:
  // https://assets.tcgdex.net/[lang]/[type]/[id]/[resource]
  // Par exemple: https://assets.tcgdex.net/en/cards/base1-1/high.webp

  return `${baseUrl}/${quality}.${extension}`;
};

export const tcgdexApi = {
  async getCards(setId: string = 'base1'): Promise<TcgdexCard[]> {
    try {
      const response = await apiClient.get(`/en/sets/${setId}`);
      
      // S'assurer que chaque carte a une image complète
      const cardsWithImages = (response.data.cards || []).map((card: TcgdexCard) => {
        return {
          ...card,
          // L'URL de l'image: /en/cards/[id]
          image: buildAssetUrl(card.image)
        };
      });
      
      return cardsWithImages;
    } catch (error) {
      console.error('Error fetching cards:', error);
      throw error;
    }
  },

  async getCardById(id: string): Promise<any> {
    try {
      const response = await apiClient.get(`/en/cards/${id}`);
      const card = response.data;
      
      // Ajouter les URLs complètes pour les textures
      return {
        ...card,
        image: buildAssetUrl(card.image),
        textures: {
          small: buildAssetUrl(card.image),
          large: buildAssetUrl(card.image),
        }
      };
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
      
      // Ajouter les URLs complètes pour les logos et symboles
      return sets.map(set => ({
        ...set,
        logo: buildAssetUrl(set.logo),
        symbol: buildAssetUrl(set.logo),
      }));
    } catch (error) {
      console.error('Error fetching sets:', error);
      throw error;
    }
  },

  async getSetById(setId: string): Promise<TcgdexSet> {
    try {
      const response = await apiClient.get(`/en/sets/${setId}`);
      const set = response.data;
      
      // Ajouter les URLs complètes pour le logo et le symbole
      const enhancedSet = {
        ...set,
        logo: buildAssetUrl(set.logo),
        symbol: buildAssetUrl(set.logo),
      };
      
      // S'assurer que chaque carte a une image complète
      if (enhancedSet.cards) {
        enhancedSet.cards = enhancedSet.cards.map((card: TcgdexCard) => ({
          ...card,
          image: buildAssetUrl(card.image)
        }));
      }
      
      return enhancedSet;
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
