import React, { useState } from 'react';
import { TcgdexCard } from '../../services/tcgdexApi';
import { useDeck, MAX_CARDS_IN_DECK, MAX_TOTAL_HP } from '../../context/DeckContext';
import './DeckBuilder.css';

const DeckBuilder: React.FC = () => {
  const { deck, totalCards, totalHP, removeCardFromDeck, clearDeck, saveDeck } = useDeck();
  const [deckName, setDeckName] = useState('');
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  // Grouper les cartes par type pour une meilleure présentation
  const cardsByType = deck.reduce((acc, card) => {
    const type = card.types && card.types.length > 0 ? card.types[0] : 'Autre';
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(card);
    return acc;
  }, {} as Record<string, TcgdexCard[]>);

  const handleSaveDeck = () => {
    if (deck.length === 0) {
      setMessage('Vous ne pouvez pas sauvegarder un deck vide');
      setMessageType('error');
      return;
    }
    
    if (!deckName.trim()) {
      setMessage('Veuillez donner un nom à votre deck');
      setMessageType('error');
      return;
    }
    
    saveDeck(deckName);
    setMessage(`Deck "${deckName}" sauvegardé avec succès!`);
    setMessageType('success');
    setShowSaveForm(false);
    setDeckName('');
  };

  return (
    <div className="deck-builder">
      <div className="deck-stats">
        <h2>Deck ({totalCards}/{MAX_CARDS_IN_DECK})</h2>
        <div className="hp-meter">
          <div className="hp-bar">
            <div 
              className="hp-progress" 
              style={{ 
                width: `${(totalHP / MAX_TOTAL_HP) * 100}%`,
                backgroundColor: totalHP > MAX_TOTAL_HP ? '#dc3545' : '#28a745'
              }}
            />
          </div>
          <span className="hp-text">
            HP Total: {totalHP}/{MAX_TOTAL_HP}
          </span>
        </div>
      </div>
      <div className="deck-header">
        <div className="deck-actions">
          <button 
            className="save-button" 
            onClick={() => setShowSaveForm(!showSaveForm)}
            disabled={deck.length === 0}
          >
            Sauvegarder
          </button>
          <button 
            className="clear-button" 
            onClick={clearDeck}
            disabled={deck.length === 0}
          >
            Vider
          </button>
        </div>
        
        {showSaveForm && (
          <div className="save-form">
            <input
              type="text"
              placeholder="Nom du deck"
              value={deckName}
              onChange={(e) => setDeckName(e.target.value)}
              className="deck-name-input"
            />
            <button onClick={handleSaveDeck} className="confirm-save-button">
              Confirmer
            </button>
          </div>
        )}
        
        {message && (
          <div className={`message ${messageType}`}>
            {message}
            <button onClick={() => setMessage('')} className="close-message">×</button>
          </div>
        )}
      </div>
      
      {deck.length === 0 ? (
        <div className="empty-deck">
          <p>Votre deck est vide. Ajoutez des cartes depuis la collection.</p>
        </div>
      ) : (
        <div className="deck-content">
          {Object.entries(cardsByType).map(([type, cards]) => (
            <div key={type} className="deck-section">
              <h3 className="section-title">{type} ({cards.length})</h3>
              <div className="card-list">
                {cards.map((card, index) => (
                  <div key={`${card.id}-${index}`} className="deck-card">
                    <img 
                      src={card.image} 
                      alt={card.name} 
                      className="deck-card-image"
                      onClick={() => {/* Potentiellement afficher les détails */}}
                    />
                    <div className="deck-card-info">
                      <p className="card-name">{card.name}</p>
                      {card.hp && <p className="card-hp">HP: {card.hp}</p>}
                      <button 
                        className="remove-card" 
                        onClick={() => removeCardFromDeck(card.id)}
                        title="Retirer du deck"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeckBuilder;
