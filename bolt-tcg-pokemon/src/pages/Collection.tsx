import React, { useState, useEffect } from 'react';
import { tcgdexApi, TcgdexCard, TcgdexSet } from '../services/tcgdexApi';
import SearchBar from '../components/collection/SearchBar';
import Filters, { FilterOptions } from '../components/collection/Filters';
import CardGrid from '../components/collection/CardGrid';
import CardDetail from '../components/collection/CardDetail';
import './Collection.css';

export function Collection() {
  const [cards, setCards] = useState<TcgdexCard[]>([]);
  const [filteredCards, setFilteredCards] = useState<TcgdexCard[]>([]);
  const [selectedCard, setSelectedCard] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSet, setActiveSet] = useState<string>('base1'); // Default to base set
  const [deck, setDeck] = useState<TcgdexCard[]>([]);

  // Charger les cartes du set actif
  useEffect(() => {
    const fetchCards = async () => {
      setLoading(true);
      try {
        const set = await tcgdexApi.getSetById(activeSet);
        if (set.cards) {
          setCards(set.cards);
          setFilteredCards(set.cards);
        } else {
          setCards([]);
          setFilteredCards([]);
        }
      } catch (error) {
        console.error('Error loading cards:', error);
        setCards([]);
        setFilteredCards([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCards();
  }, [activeSet]);

  // Charger le deck sauvegardé du local storage
  useEffect(() => {
    const savedDeck = localStorage.getItem('savedDeck');
    if (savedDeck) {
      try {
        setDeck(JSON.parse(savedDeck));
      } catch (e) {
        console.error('Error parsing saved deck:', e);
      }
    }
  }, []);

  const handleSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setFilteredCards(cards);
      return;
    }
    
    setLoading(true);
    try {
      // Filtrer dans les cartes actuellement chargées
      const filtered = cards.filter(card => 
        card.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCards(filtered);
    } catch (error) {
      console.error('Error searching cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = async (filters: FilterOptions) => {
    if (filters.setId && filters.setId !== activeSet) {
      setActiveSet(filters.setId);
      return; // Le changement de set va recharger les cartes
    }
    
    // Pour l'instant, on ne peut filtrer que par set
    // Les autres filtres nécessitent des informations détaillées sur les cartes
    // que nous n'avons pas dans la réponse de base
  };

  const handleCardClick = async (card: TcgdexCard) => {
    try {
      // Récupérer les détails complets de la carte
      const cardDetails = await tcgdexApi.getCardById(card.id);
      setSelectedCard(cardDetails);
    } catch (error) {
      console.error('Error loading card details:', error);
      // Utiliser les informations basiques que nous avons déjà
      setSelectedCard(card);
    }
  };

  const closeCardDetail = () => {
    setSelectedCard(null);
  };

  const addToDeck = (card: TcgdexCard) => {
    // Vérifier si le deck a déjà 60 cartes
    if (deck.length >= 60) {
      alert('Votre deck est complet! (maximum 60 cartes)');
      return;
    }
    
    const newDeck = [...deck, card];
    setDeck(newDeck);
    
    // Sauvegarder dans le localStorage
    localStorage.setItem('savedDeck', JSON.stringify(newDeck));
  };

  const removeFromDeck = (cardId: string) => {
    const cardIndex = deck.findIndex(card => card.id === cardId);
    
    if (cardIndex !== -1) {
      const newDeck = [...deck];
      newDeck.splice(cardIndex, 1);
      setDeck(newDeck);
      
      localStorage.setItem('savedDeck', JSON.stringify(newDeck));
    }
  };

  // Convertir les cartes TCGdex au format attendu par CardGrid
  const convertToPokemonCard = (card: TcgdexCard) => {
    return {
      id: card.id,
      name: card.name,
      supertype: "Pokémon", // Par défaut
      subtypes: [],
      images: {
        small: card.image,
        large: card.image
      },
      set: {
        id: activeSet,
        name: "Set", // Sera remplacé si on a les détails
        series: ""
      }
    };
  };

  return (
    <div className="collection-container">
      <div className="sidebar">
        <h2>Mon Deck ({deck.length}/60)</h2>
        <div className="deck-list">
          {deck.length === 0 ? (
            <p className="empty-deck-message">Ajoutez des cartes à votre deck</p>
          ) : (
            <div>
              {deck.map((card, index) => (
                <div key={`${card.id}-${index}`} className="deck-card">
                  <img src={card.image} alt={card.name} className="deck-card-image" />
                  <div className="deck-card-info">
                    <p>{card.name}</p>
                    <button 
                      className="remove-from-deck-button"
                      onClick={() => removeFromDeck(card.id)}
                    >
                      &times;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="main-content">
        <h1>Collection de Cartes Pokémon</h1>
        
        <div className="search-filter-container">
          <SearchBar onSearch={handleSearch} />
          <Filters 
            onFilterChange={handleFilter}
          />
        </div>
        
        <CardGrid 
          cards={filteredCards.map(convertToPokemonCard)}
          loading={loading} 
          onCardClick={handleCardClick} 
        />
        
        {selectedCard && (
          <CardDetail 
            card={selectedCard.supertype ? selectedCard : convertToPokemonCard(selectedCard)}
            onClose={closeCardDetail} 
            onAddToDeck={() => addToDeck(selectedCard)} 
          />
        )}
      </div>
    </div>
  );
}

export default Collection;