import React, { useState, useEffect } from 'react';
import { tcgdexApi, TcgdexCard } from '../services/tcgdexApi';
import SearchBar from '../components/collection/SearchBar';
import Filters from '../components/collection/Filters';
import CardGrid from '../components/collection/CardGrid';
import DeckBuilder from '../components/deck/DeckBuilder';
import { useDeck } from '../context/DeckContext';
import './Collection.css';
import toast from "react-hot-toast";

export function Collection() {
  const [cards, setCards] = useState<TcgdexCard[]>([]);
  const [filteredCards, setFilteredCards] = useState<TcgdexCard[]>([]);

  const [selectedCard, setSelectedCard] = useState<TcgdexCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSet, setActiveSet] = useState<string>('base1');
  const { addCardToDeck, isCardInDeck } = useDeck();
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

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
    setSelectedCard(card);
  };

  const handleAddToDeck = () => {
    if (!selectedCard) return;

    addCardToDeck(selectedCard)
      .then((result) => {
        
      // Optionnellement, désélectionner la carte après l'ajout
      console.log("adding", result)
      if (result.success) {
        toast.success(result.message);
        setTimeout(() => setSelectedCard(null), 1500);
      } else {
        toast.error(result.message);
      }
      });
    //setMessage(result.message);
    //setMessageType(result.success ? 'success' : 'error');
    
  };

  return (
    <div className="collection-page">
      <div className="main-content">
        <h1>Collection de Cartes Pokémon</h1>
        
        <div className="search-filter-container">
          <SearchBar onSearch={handleSearch} />
          <Filters onFilterChange={handleFilter} />
        </div>
        
        <CardGrid 
          cards={filteredCards}
          loading={loading} 
          onCardClick={handleCardClick}
          selectedCardId={selectedCard?.id}
        />
      </div>

      <div className="sidebar">
        {selectedCard ? (
          <div className="selected-card-panel">
            <h3>Carte Sélectionnée</h3>
            <div className="selected-card-content">
              <img 
                src={selectedCard.image} 
                alt={selectedCard.name} 
                className="selected-card-image"
              />
              <div className="selected-card-info">
                <h4>{selectedCard.name}</h4>
                {selectedCard.hp && <p>HP: {selectedCard.hp}</p>}
                {selectedCard.types && (
                  <p>Types: {selectedCard.types.join(', ')}</p>
                )}
                <button 
                  className={`add-to-deck-button ${isCardInDeck(selectedCard.id) ? 'in-deck' : ''}`}
                  onClick={handleAddToDeck}
                  disabled={isCardInDeck(selectedCard.id)}
                >
                  {isCardInDeck(selectedCard.id) ? 'Déjà dans le deck' : 'Ajouter au deck'}
                </button>
                <button 
                  className="close-selection-button"
                  onClick={() => setSelectedCard(null)}
                >
                  Fermer
                </button>
              </div>
            </div>
            {message && (
              <div className={`message ${messageType}`}>
                {message}
                <button onClick={() => setMessage('')} className="close-message">×</button>
              </div>
            )}
          </div>
        ) : (
          <div className="empty-selection">
            <p>Sélectionnez une carte pour voir les détails</p>
          </div>
        )}
        
        <DeckBuilder />
      </div>
    </div>
  );
}

export default Collection;