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
  winner: TcgdexCard | null; // Peut être null en cas d'égalité
  loser: TcgdexCard | null;  // Peut être null en cas d'égalité
  reason: 'type' | 'hp' | 'draw';  // Ajout de 'draw' pour les égalités
  description: string;
  isDraw: boolean;  // Nouveau champ pour identifier facilement une égalité
}

export const determineBattleWinner = (card1: TcgdexCard, card2: TcgdexCard): BattleResult => {
  // Log détaillé pour le debugging
  console.log('Battle calculation:', {
    card1: {
      name: card1.name,
      types: card1.types,
      hp: card1.hp,
      weaknesses: card1.weaknesses,
      resistances: card1.resistances
    },
    card2: {
      name: card2.name,
      types: card2.types,
      hp: card2.hp,
      weaknesses: card2.weaknesses,
      resistances: card2.resistances
    }
  });

  const type1 = card1.types?.[0];
  const type2 = card2.types?.[0];

  if (type1 && type2) {
    // Vérifier les avantages mutuels
    const card2WeakTo = card2.weaknesses?.find(w => w.type === type1);
    const card1WeakTo = card1.weaknesses?.find(w => w.type === type2);

    // Si les deux cartes ont un avantage l'une sur l'autre
    if (card2WeakTo && card1WeakTo) {
      return {
        winner: null,
        loser: null,
        reason: 'draw',
        description: `Match nul ! ${card1.name} et ${card2.name} sont tous les deux efficaces l'un contre l'autre.`,
        isDraw: true
      };
    }

    // Vérifier les résistances mutuelles
    const card2ResistsTo = card2.resistances?.find(r => r.type === type1);
    const card1ResistsTo = card1.resistances?.find(r => r.type === type2);

    // Si les deux cartes résistent l'une à l'autre
    if (card2ResistsTo && card1ResistsTo) {
      return {
        winner: null,
        loser: null,
        reason: 'draw',
        description: `Match nul ! Les deux Pokémon se résistent mutuellement.`,
        isDraw: true
      };
    }

    // Cas d'un seul avantage
    if (card2WeakTo && !card1WeakTo) {
      return {
        winner: card1,
        loser: card2,
        reason: 'type',
        description: `${card2.name} est faible contre le type ${type1}!`,
        isDraw: false
      };
    }

    if (card1WeakTo && !card2WeakTo) {
      return {
        winner: card2,
        loser: card1,
        reason: 'type',
        description: `${card1.name} est faible contre le type ${type2}!`,
        isDraw: false
      };
    }

    // Cas d'une seule résistance
    if (card2ResistsTo && !card1ResistsTo) {
      return {
        winner: card2,
        loser: card1,
        reason: 'type',
        description: `${card2.name} résiste aux attaques de type ${type1}!`,
        isDraw: false
      };
    }

    if (card1ResistsTo && !card2ResistsTo) {
      return {
        winner: card1,
        loser: card2,
        reason: 'type',
        description: `${card1.name} résiste aux attaques de type ${type2}!`,
        isDraw: false
      };
    }
  }

  // Si pas d'avantage de type, comparer les HP
  const hp1 = card1.hp || 0;
  const hp2 = card2.hp || 0;

  if (hp1 !== hp2) {
    const winner = hp1 > hp2 ? card1 : card2;
    const loser = hp1 > hp2 ? card2 : card1;
    return {
      winner,
      loser,
      reason: 'hp',
      description: `${winner.name} gagne avec ${winner.hp} HP contre ${loser.hp} HP!`,
      isDraw: false
    };
  }

  // En cas d'égalité totale
  return {
    winner: null,
    loser: null,
    reason: 'draw',
    description: 'Match nul ! Aucun point attribué.',
    isDraw: true
  };
};
