import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { tcgdexApi, TcgdexCard } from '../services/tcgdexApi';

// Constantes pour les limites du deck
export const MAX_CARDS_IN_DECK = 6;
export const MAX_TOTAL_HP = 400; // Nouvelle limite de HP
export const MAX_SAME_CARD = 1; // Un seul exemplaire de chaque carte

interface DeckContextProps {
  deck: TcgdexCard[];
  totalCards: number;
  totalHP: number;
  addCardToDeck: (card: TcgdexCard) => Promise<{ success: boolean; message: string }>;
  removeCardFromDeck: (cardId: string) => void;
  saveDeck: (name: string) => void;
  loadDeck: (name: string) => void;
  isCardInDeck: (cardId: string) => boolean;
  clearDeck: () => void;
  getDeckStats: () => {
    totalCards: number;
    totalHP: number;
    countByType: Record<string, number>;
  };
}

const DeckContext = createContext<DeckContextProps | undefined>(undefined);

interface DeckProviderProps {
  children: ReactNode;
}

export const DeckProvider: React.FC<DeckProviderProps> = ({ children }) => {
  const [deck, setDeck] = useState<TcgdexCard[]>([]);
  const [totalCards, setTotalCards] = useState(0);
  const [totalHP, setTotalHP] = useState(0);

  // Charger le deck sauvegardé au démarrage
  useEffect(() => {
    const savedDeck = localStorage.getItem('currentDeck');
    if (savedDeck) {
      try {
        const parsedDeck = JSON.parse(savedDeck);
        setDeck(parsedDeck);
        updateDeckStats(parsedDeck);
      } catch (error) {
        console.error('Erreur lors du chargement du deck:', error);
        localStorage.removeItem('currentDeck');
      }
    }
  }, []);

  // Mettre à jour les statistiques du deck
  const updateDeckStats = (currentDeck: TcgdexCard[]) => {
    const total = currentDeck.length;
    const hp = currentDeck.reduce((sum, card) => sum + (parseInt(card.hp?.toString() || '0', 10) || 0), 0);
    setTotalCards(total);
    setTotalHP(hp);
  };

  // Ajouter une carte au deck avec validation
  const addCardToDeck = async (card: TcgdexCard): Promise<{ success: boolean; message: string }> => {
    try {
      // Récupérer les détails de la carte pour avoir les HP précis
      const cardDetails = await tcgdexApi.getCardDetailsForBattle(card.id);
      const currentTotalHP = deck.reduce((sum, c) => sum + (c.hp || 0), 0);
      const newTotalHP = currentTotalHP + (cardDetails.hp || 0);

      // Vérifications
      if (deck.length >= MAX_CARDS_IN_DECK) {
        return { success: false, message: `Votre deck a atteint la limite de ${MAX_CARDS_IN_DECK} cartes.` };
      }

      if (newTotalHP > MAX_TOTAL_HP) {
        return { 
          success: false, 
          message: `L'ajout de cette carte dépasserait la limite de ${MAX_TOTAL_HP} HP (Total actuel: ${currentTotalHP}, Carte: ${cardDetails.hp} HP)`
        };
      }

      const sameNameCount = deck.filter(c => c.name === card.name).length;
      if (sameNameCount >= MAX_SAME_CARD) {
        return { success: false, message: `Vous ne pouvez pas avoir plus de ${MAX_SAME_CARD} exemplaire de "${card.name}".` };
      }

      // Ajouter la carte avec les HP précis
      const newDeck = [...deck, cardDetails];
      setDeck(newDeck);
      updateDeckStats(newDeck);
      localStorage.setItem('currentDeck', JSON.stringify(newDeck));
      
      return { 
        success: true, 
        message: `${card.name} (${cardDetails.hp} HP) a été ajouté à votre deck.` 
      };
    } catch (error) {
      console.error('Error adding card to deck:', error);
      return { success: false, message: "Erreur lors de l'ajout de la carte." };
    }
  };

  // Retirer une carte du deck
  const removeCardFromDeck = (cardId: string) => {
    const cardIndex = deck.findIndex(card => card.id === cardId);
    if (cardIndex !== -1) {
      const newDeck = [...deck];
      newDeck.splice(cardIndex, 1);
      setDeck(newDeck);
      updateDeckStats(newDeck);
      localStorage.setItem('currentDeck', JSON.stringify(newDeck));
    }
  };

  // Sauvegarder le deck avec un nom
  const saveDeck = (name: string) => {
    if (deck.length === 0) return;
    
    const savedDecks = localStorage.getItem('savedDecks');
    let decks = savedDecks ? JSON.parse(savedDecks) : {};
    
    decks[name] = {
      cards: deck,
      createdAt: new Date().toISOString(),
      totalCards,
      totalHP
    };
    
    localStorage.setItem('savedDecks', JSON.stringify(decks));
    localStorage.setItem('currentDeck', JSON.stringify(deck));
  };

  // Charger un deck sauvegardé
  const loadDeck = (name: string) => {
    const savedDecks = localStorage.getItem('savedDecks');
    if (!savedDecks) return;
    
    const decks = JSON.parse(savedDecks);
    if (!decks[name]) return;
    
    const loadedDeck = decks[name].cards;
    setDeck(loadedDeck);
    updateDeckStats(loadedDeck);
    localStorage.setItem('currentDeck', JSON.stringify(loadedDeck));
  };

  // Vérifier si une carte est déjà dans le deck
  const isCardInDeck = (cardId: string): boolean => {
    return deck.some(card => card.id === cardId);
  };

  // Vider le deck
  const clearDeck = () => {
    setDeck([]);
    setTotalCards(0);
    setTotalHP(0);
    localStorage.removeItem('currentDeck');
  };

  // Obtenir des statistiques sur le deck
  const getDeckStats = () => {
    const countByType = deck.reduce((acc, card) => {
      if (card.types && card.types.length > 0) {
        card.types.forEach(type => {
          acc[type] = (acc[type] || 0) + 1;
        });
      } else {
        acc['Unknown'] = (acc['Unknown'] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    
    return {
      totalCards,
      totalHP,
      countByType
    };
  };

  return (
    <DeckContext.Provider 
      value={{ 
        deck, 
        totalCards, 
        totalHP, 
        addCardToDeck, 
        removeCardFromDeck, 
        saveDeck, 
        loadDeck, 
        isCardInDeck, 
        clearDeck, 
        getDeckStats
      }}
    >
      {children}
    </DeckContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte du deck
export const useDeck = () => {
  const context = useContext(DeckContext);
  if (context === undefined) {
    throw new Error('useDeck doit être utilisé à l\'intérieur d\'un DeckProvider');
  }
  return context;
};
