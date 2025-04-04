import React, { useState, useEffect } from 'react';
import { Search, Save, Trash2 } from 'lucide-react';
import { PokemonCard } from '../components/Card';
import type { PokemonCardType } from '../types/pokemon';
import pokemon from 'pokemon-tcg-sdk-typescript';

export function Collection() {
  const [cards, setCards] = useState<PokemonCardType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [deck, setDeck] = useState<PokemonCardType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const response = await pokemon.card.where({ q: 'set.id:base1' });
        
        const formattedCards: PokemonCardType[] = response.map((card) => ({
          id: card.id,
          name: card.name,
          image: card.images.small,
          types: card.types || [],
          hp: parseInt(card.hp || '0', 10),
          attacks: (card.attacks || []).map((attack) => ({
            name: attack.name,
            damage: parseInt(attack.damage || '0', 10),
            cost: attack.cost || []
          }))
        }));
        
        setCards(formattedCards);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching cards:', error);
        setLoading(false);
      }
    };

    fetchCards();
  }, []);

  const filteredCards = cards.filter(card =>
    card.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToDeck = (card: PokemonCardType) => {
    if (deck.length < 6) {
      setDeck([...deck, card]);
    } else {
      alert('Your deck is full! (maximum 6 cards)');
    }
  };

  const removeFromDeck = (cardToRemove: PokemonCardType) => {
    setDeck(deck.filter(card => card.id !== cardToRemove.id));
  };

  const saveDeck = () => {
    // In a real app, this would save to a backend
    localStorage.setItem('savedDeck', JSON.stringify(deck));
    alert('Deck saved!');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Deck Builder Section */}
        <div className="lg:w-1/4">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Your Deck</h2>
              <span className="text-gray-600">{deck.length}/6</span>
            </div>
            
            {deck.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Add cards to your deck to begin
              </p>
            ) : (
              <div className="space-y-4">
                {deck.map((card) => (
                  <div
                    key={card.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={card.image}
                        alt={card.name}
                        className="w-12 h-12 object-contain"
                      />
                      <span className="font-medium">{card.name}</span>
                    </div>
                    <button
                      onClick={() => removeFromDeck(card)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
                
                <button
                  onClick={saveDeck}
                  disabled={deck.length === 0}
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed mt-4"
                >
                  <Save className="w-5 h-5" />
                  Save Deck
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Pokemon Collection Section */}
        <div className="lg:w-3/4">
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for a card..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading cards...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCards.map((card) => (
                <PokemonCard
                  key={card.id}
                  {...card}
                  onAddToDeck={() => addToDeck(card)}
                  inDeck={deck.some((p) => p.id === card.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}