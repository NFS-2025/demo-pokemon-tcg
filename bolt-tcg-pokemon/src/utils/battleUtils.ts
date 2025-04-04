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
  Dragon: {
    strengths: ['Dragon'],
    weaknesses: ['Ice', 'Dragon', 'Fairy']
  },
  Dark: {
    strengths: ['Psychic', 'Ghost'],
    weaknesses: ['Fighting', 'Bug', 'Fairy']
  },
  Fairy: {
    strengths: ['Fighting', 'Dragon', 'Dark'],
    weaknesses: ['Poison', 'Steel']
  },
  Normal: {
    strengths: [],
    weaknesses: ['Fighting']
  },
  Ghost: {
    strengths: ['Psychic', 'Ghost'],
    weaknesses: ['Ghost', 'Dark']
  },
  Steel: {
    strengths: ['Ice', 'Rock', 'Fairy'],
    weaknesses: ['Fire', 'Fighting', 'Ground']
  }
};

export interface BattleResult {
  winner: TcgdexCard;
  loser: TcgdexCard;
  reason: 'type' | 'hp' | 'default';
  description: string;
}

export const determineBattleWinner = (card1: TcgdexCard, card2: TcgdexCard): BattleResult => {
  console.log('Battle between:', {
    card1: { name: card1.name, types: card1.types, hp: card1.hp },
    card2: { name: card2.name, types: card2.types, hp: card2.hp }
  });

  const type1 = card1.types?.[0];
  const type2 = card2.types?.[0];

  // Si les deux cartes ont des types
  if (type1 && type2 && TYPE_MATCHUPS[type1] && TYPE_MATCHUPS[type2]) {
    // Vérifier si type1 est fort contre type2
    if (TYPE_MATCHUPS[type1].strengths.includes(type2)) {
      return {
        winner: card1,
        loser: card2,
        reason: 'type',
        description: `${type1} est super efficace contre ${type2}!`
      };
    }
    
    // Vérifier si type2 est fort contre type1
    if (TYPE_MATCHUPS[type2].strengths.includes(type1)) {
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

  console.log('Comparing HP:', { hp1, hp2 });

  if (hp1 !== hp2) {
    const winner = hp1 > hp2 ? card1 : card2;
    const loser = hp1 > hp2 ? card2 : card1;
    const winnerHP = Math.max(hp1, hp2);
    const loserHP = Math.min(hp1, hp2);

    return {
      winner,
      loser,
      reason: 'hp',
      description: `${winner.name} gagne avec ${winnerHP} HP contre ${loserHP} HP!`
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
