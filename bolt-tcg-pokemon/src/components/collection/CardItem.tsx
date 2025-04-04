import React from 'react';
import { PokemonCard } from '../../services/pokemonTcgApi';
import './CardItem.css';

interface CardItemProps {
  card: PokemonCard;
  onClick: () => void;
}

const CardItem: React.FC<CardItemProps> = ({ card, onClick }) => {
  return (
    <div className="card-item" onClick={onClick}>
      <img 
        src={card.images.small} 
        alt={card.name} 
        className="card-image"
        loading="lazy"
      />
      <div className="card-info">
        <h3 className="card-name">{card.name}</h3>
        <div className="card-details">
          {card.rarity && <span className="card-rarity">{card.rarity}</span>}
          <span className="card-set">{card.set.name}</span>
        </div>
      </div>
    </div>
  );
};

export default CardItem;
