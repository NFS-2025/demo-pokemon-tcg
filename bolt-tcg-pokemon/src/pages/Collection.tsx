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
  const [selectedCard, setSelectedCard] = useState<TcgdexCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [sets, setSets] = useState<TcgdexSet[]>([]);
  const [deck, setDeck] = useState<TcgdexCard[]>([]);
  const [activeSet, setActiveSet] = useState<string>('base1'); // Default to base set

  // Charger les sets au chargement initial
  useEffect(() => {
    const fetchSets = async () => {
      try {
        const setsData = await tcgdexApi.getSets();
        setSets(setsData);
      } catch (error) {
        console.error('Error loading sets:', error);
      }
    };
    
    fetchSets();
  }, []);

  // Charger les cartes du set actif
  useEffect(() => {
    const fetchCards = async () => {
      setLoading(true);
      try {
        const cardsData = await tcgdexApi.getCardsBySetId(activeSet);
        setCards(cardsData);
        setFilteredCards(cardsData);
        setLoading(false);
      } catch (error) {
        console.error('Error loading cards:', error);
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

  const handleFilter = (filters: FilterOptions) => {
    let filteredResults = [...cards];
    
    if (filters.setId) {
      setActiveSet(filters.setId);
      return; // Le changement de set va recharger les cartes, pas besoin de continuer
    }
    
    if (filters.types && filters.types.length > 0) {
      filteredResults = filteredResults.filter(card => 
        card.types && card.types.some(type => filters.types?.includes(type))
      );
    }
    
    if (filters.subtypes && filters.subtypes.length > 0) {
      filteredResults = filteredResults.filter(card => 
        card.subtypes && card.subtypes.some(subtype => filters.subtypes?.includes(subtype))
      );
    }
    
    if (filters.rarity) {
      filteredResults = filteredResults.filter(card => 
        card.rarity === filters.rarity
      );
    }
    
    setFilteredCards(filteredResults);
  };

  const handleCardClick = (card: TcgdexCard) => {
    setSelectedCard(card);
  };

  const closeCardDetail = () => {
    setSelectedCard(null);
  };

  const addToDeck = (card: TcgdexCard) => {
    // Vérifier si le deck a déjà 60 cartes (maximum pour un deck Pokémon TCG)
    if (deck.length >= 60) {
      alert('Votre deck est complet! (maximum 60 cartes)');
      return;
    }
    
    // Vérifier les règles du deck Pokémon TCG (max 4 du même nom sauf énergies de base)
    const sameNameCount = deck.filter(c => c.name === card.name).length;
    const isBasicEnergy = card.supertype === 'Energy' && card.subtypes?.includes('Basic');
    
    if (!isBasicEnergy && sameNameCount >= 4) {
      alert(`Vous ne pouvez pas avoir plus de 4 cartes "${card.name}" dans votre deck.`);
      return;
    }
    
    const newDeck = [...deck, card];
    setDeck(newDeck);
    
    // Sauvegarder dans le localStorage
    localStorage.setItem('savedDeck', JSON.stringify(newDeck));
  };

  const removeFromDeck = (cardId: string) => {
    // Trouver l'index de la première occurrence de cette carte
    const cardIndex = deck.findIndex(card => card.id === cardId);
    
    if (cardIndex !== -1) {
      const newDeck = [...deck];
      newDeck.splice(cardIndex, 1);
      setDeck(newDeck);
      
      // Mettre à jour le localStorage
      localStorage.setItem('savedDeck', JSON.stringify(newDeck));
    }
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
          cards={filteredCards.map(card => ({
            id: card.id,
            name: card.name,
            supertype: card.supertype,
            subtypes: card.subtypes || [],
            hp: card.hp?.toString(),
            types: card.types,
            images: {
              small: card.image,
              large: card.image
            },
            rarity: card.rarity,
            set: {
              id: card.set.id,
              name: card.set.name,
              series: card.set.series
            }
          }))}
          loading={loading} 
          onCardClick={handleCardClick} 
        />
        
        {selectedCard && (
          <CardDetail 
            card={{
              id: selectedCard.id,
              name: selectedCard.name,
              supertype: selectedCard.supertype,
              subtypes: selectedCard.subtypes || [],
              hp: selectedCard.hp?.toString(),
              types: selectedCard.types,
              images: {
                small: selectedCard.image,
                large: selectedCard.image
              },
              rarity: selectedCard.rarity,
              set: {
                id: selectedCard.set.id,
                name: selectedCard.set.name,
                series: selectedCard.set.series
              }
            }}
            onClose={closeCardDetail} 
            onAddToDeck={() => addToDeck(selectedCard)} 
          />
        )}
      </div>
    </div>
  );
}

export default Collection;