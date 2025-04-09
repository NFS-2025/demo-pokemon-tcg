import React from 'react';
import { TcgdexCard } from '../../services/tcgdexApi';
import CardItem from './CardItem';
import './CardGrid.css';

interface CardGridProps {
  cards: TcgdexCard[];
  loading: boolean;
  onCardClick: (card: TcgdexCard) => void;
  selectedCardId?: string;
}

const CardGrid: React.FC<CardGridProps> = ({ 
  cards, 
  loading, 
  onCardClick,
  selectedCardId 
}) => {
  if (loading) {
    return (
      <div className="card-grid-loading">
        <div className="spinner"></div>
        <p>Chargement des cartes...</p>
      </div>
    );
  }

  if (cards.length === 0) {
    return <div className="card-grid-empty">Aucune carte trouvée</div>;
  }

  return (
    <div className="card-grid">
      {cards.map((card) => (
        <CardItem 
          key={card.id} 
          card={card} 
          onClick={() => onCardClick(card)}
          isSelected={card.id === selectedCardId}
        />
      ))}
    </div>
  );
};

export default CardGrid;
