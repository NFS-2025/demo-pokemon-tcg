import React from 'react';
import { PokemonCard } from '../../services/pokemonTcgApi';
import CardItem from './CardItem';
import './CardGrid.css';

interface CardGridProps {
  cards: PokemonCard[];
  loading: boolean;
  onCardClick: (card: PokemonCard) => void;
}

const CardGrid: React.FC<CardGridProps> = ({ cards, loading, onCardClick }) => {
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
        <CardItem key={card.id} card={card} onClick={() => onCardClick(card)} />
      ))}
    </div>
  );
};

export default CardGrid;
