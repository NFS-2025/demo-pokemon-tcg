import React from 'react';
import { PokemonCard } from '../../services/pokemonTcgApi';
import './CardDetail.css';

interface CardDetailProps {
  card: PokemonCard | null;
  onClose: () => void;
  onAddToDeck: (card: PokemonCard) => void;
}

const CardDetail: React.FC<CardDetailProps> = ({ card, onClose, onAddToDeck }) => {
  if (!card) return null;

  return (
    <div className="card-detail-overlay">
      <div className="card-detail-container">
        <button className="close-button" onClick={onClose}>×</button>
        
        <div className="card-detail-content">
          <div className="card-detail-image">
            <img src={card.images.large} alt={card.name} />
          </div>
          
          <div className="card-detail-info">
            <h2>{card.name}</h2>
            
            <div className="card-detail-specs">
              <p><strong>Type:</strong> {card.supertype}</p>
              {card.subtypes && <p><strong>Sous-types:</strong> {card.subtypes.join(', ')}</p>}
              {card.hp && <p><strong>HP:</strong> {card.hp}</p>}
              {card.types && <p><strong>Types:</strong> {card.types.join(', ')}</p>}
              {card.rarity && <p><strong>Rareté:</strong> {card.rarity}</p>}
              <p><strong>Set:</strong> {card.set.name} ({card.set.series})</p>
            </div>
            
            <div className="card-detail-actions">
              <button 
                className="add-to-deck-button"
                onClick={() => onAddToDeck(card)}
              >
                Ajouter au deck
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardDetail;
