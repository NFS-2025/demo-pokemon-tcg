import React, { useState } from 'react';
import { PokemonCard } from '../../services/pokemonTcgApi';
import { useDeck } from '../../context/DeckContext';
import './CardDetail.css';
import toast from "react-hot-toast";

interface CardDetailProps {
  card: PokemonCard | null;
  onClose: () => void;
}

const CardDetail: React.FC<CardDetailProps> = ({ card, onClose }) => {
  const [imageError, setImageError] = useState(false);
  const { addCardToDeck, isCardInDeck } = useDeck();

  if (!card) return null;
  
  // Utiliser l'image JPG si WebP échoue
  const handleImageError = () => {
    // Si l'URL de l'image se termine par .webp, essayer avec .jpg à la place
    if (card.images.large.endsWith('.webp')) {
      const jpgUrl = card.images.large.replace('.webp', '.jpg');
      (document.querySelector(`img[src="${card.images.large}"]`) as HTMLImageElement).src = jpgUrl;
    } else {
      // Si ce n'est pas un .webp ou si l'erreur persiste après avoir changé pour .jpg
      setImageError(true);
    }
  };

  const handleAddToDeck = () => {
    // Convertir la carte PokemonCard en TcgdexCard pour la compatibilité avec le contexte
    const tcgdexCard = {
      id: card.id,
      name: card.name,
      image: card.images.small,
      hp: card.hp ? parseInt(card.hp, 10) : 0,
      types: card.types || [],
      // Autres propriétés si nécessaire
    };

    const result = addCardToDeck(tcgdexCard);
    console.log("result", result)
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  const cardInDeck = isCardInDeck(card.id);

  return (
    <div className="card-detail-overlay">
      <div className="card-detail-container">
        <button className="close-button" onClick={onClose}>×</button>
        
        <div className="card-detail-content">
          <div className="card-detail-image">
            {!imageError ? (
              <img 
                src={card.images.large} 
                alt={card.name} 
                onError={handleImageError}
              />
            ) : (
              <div className="card-detail-image-placeholder">
                <span>{card.name}</span>
              </div>
            )}
          </div>
          
          <div className="card-detail-info">
            <h2>{card.name}</h2>
            
            <div className="card-detail-specs">
              <p><strong>Type:</strong> {card.supertype}</p>
              {card.subtypes && <p><strong>Sous-types:</strong> {card.subtypes.join(', ')}</p>}
              {card.hp && <p><strong>HP:</strong> {card.hp}</p>}
              {card.types && <p><strong>Types:</strong> {card.types.join(', ')}</p>}
              {card.rarity && <p><strong>Rareté:</strong> {card.rarity}</p>}
              <p><strong>Set:</strong> {card.set.name} ({card.set.series || 'N/A'})</p>
            </div>
            
            <div className="card-detail-actions">
              <button 
                className={`add-to-deck-button ${cardInDeck ? 'in-deck' : ''}`}
                onClick={handleAddToDeck}
                disabled={cardInDeck}
              >
                {cardInDeck ? 'Déjà dans le deck' : 'Ajouter au deck'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardDetail;
