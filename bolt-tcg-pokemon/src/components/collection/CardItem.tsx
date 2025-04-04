import React, { useState } from 'react';
import { TcgdexCard } from '../../services/tcgdexApi';
import './CardItem.css';

interface CardItemProps {
  card: TcgdexCard;
  onClick: () => void;
  isSelected?: boolean;
}

const CardItem: React.FC<CardItemProps> = ({ card, onClick, isSelected }) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div 
      className={`card-item ${isSelected ? 'selected' : ''}`} 
      onClick={onClick}
    >
      {!imageError ? (
        <img 
          src={card.image} 
          alt={card.name} 
          className="card-image"
          loading="lazy"
          onError={handleImageError}
        />
      ) : (
        <div className="card-image-placeholder">
          <span>{card.name}</span>
        </div>
      )}
      <div className="card-info">
        <h3 className="card-name">{card.name}</h3>
      </div>
    </div>
  );
};

export default CardItem;
