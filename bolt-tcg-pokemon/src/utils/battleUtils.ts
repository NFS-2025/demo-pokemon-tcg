import { TcgdexCard } from '../services/tcgdexApi';

// Table des types et leurs forces/faiblesses
const TYPE_MATCHUPS: Record<string, { strengths: string[], weaknesses: string[] }> = {
  Fire: {
    strengths: ['Grass', 'Bug', 'Steel', 'Ice'],
    weaknesses: ['Water', 'Ground', 'Rock']
  },
  Water: {
    strengths: ['Fire', 'Ground', 'Rock'],
    weaknesses: ['Grass', 'Electric']
  },
  Grass: {
    strengths: ['Water', 'Ground', 'Rock'],
    weaknesses: ['Fire', 'Ice', 'Poison', 'Flying', 'Bug']
  },
  Electric: {
    strengths: ['Water', 'Flying'],
    weaknesses: ['Ground']
  },
  Psychic: {
    strengths: ['Fighting', 'Poison'],
    weaknesses: ['Dark', 'Ghost']
  },
  Fighting: {
    strengths: ['Normal', 'Ice', 'Rock', 'Dark', 'Steel'],
    weaknesses: ['Flying', 'Psychic', 'Fairy']
  },
  // Ajouter d'autres types selon besoin
};

export interface BattleResult {
  winner: TcgdexCard;
  loser: TcgdexCard;
  reason: 'type' | 'hp' | 'default';
  description: string;
}

export const determineBattleWinner = (card1: TcgdexCard, card2: TcgdexCard): BattleResult => {
  const type1 = card1.types?.[0];
  const type2 = card2.types?.[0];

  // Si les deux cartes ont des types
  if (type1 && type2) {
    // Vérifier si type1 est fort contre type2
    if (TYPE_MATCHUPS[type1]?.strengths.includes(type2)) {
      return {
        winner: card1,
        loser: card2,
        reason: 'type',
        description: `${type1} est super efficace contre ${type2}!`
      };
    }
    
    // Vérifier si type2 est fort contre type1
    if (TYPE_MATCHUPS[type2]?.strengths.includes(type1)) {
      return {
        winner: card2,
        loser: card1,
        reason: 'type',
        description: `${type2} est super efficace contre ${type1}!`
      };
    }
  }

  // Si pas d'avantage de type, comparer les HP
  const hp1 = card1.hp || 0;
  const hp2 = card2.hp || 0;

  if (hp1 !== hp2) {
    return {
      winner: hp1 > hp2 ? card1 : card2,
      loser: hp1 > hp2 ? card2 : card1,
      reason: 'hp',
      description: `Victoire par points de vie supérieurs (${Math.max(hp1, hp2)} vs ${Math.min(hp1, hp2)})`
    };
  }

  // En cas d'égalité totale, le premier joueur gagne
  return {
    winner: card1,
    loser: card2,
    reason: 'default',
    description: 'Égalité - Premier joueur gagnant'
  };
};
