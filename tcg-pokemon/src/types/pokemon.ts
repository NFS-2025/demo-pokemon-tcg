export interface PokemonCard {
  id: string;
  name: string;
  image: string;
  types: string[];
  hp: number;
  attacks: Attack[];
}

export interface Attack {
  name: string;
  damage: number;
  cost: string[];
}

export interface User {
  username: string;
  avatar: string;
}

export interface Battle {
  id: string;
  players: {
    [key: string]: {
      deck: PokemonCard[];
      hand: PokemonCard[];
      active: PokemonCard | null;
      knocked: PokemonCard[];
    };
  };
  currentTurn: string;
  status: 'waiting' | 'active' | 'finished';
  winner?: string;
}