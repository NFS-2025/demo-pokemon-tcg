import React from 'react';
import { Shield, Plus, Heart } from 'lucide-react';
import type { Attack } from '../types/pokemon';

interface PokemonCardProps {
  id: string;
  name: string;
  image: string;
  types: string[];
  hp: number;
  attacks?: Attack[];
  onAddToDeck?: () => void;
  inDeck?: boolean;
  showActions?: boolean;
}

export function PokemonCard({ 
  id, 
  name, 
  image, 
  types, 
  hp, 
  attacks, 
  onAddToDeck, 
  inDeck,
  showActions = true 
}: PokemonCardProps) {
  return (
    <div className="relative bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow w-64">
      <div className="relative h-48 bg-gray-100">
        <img 
          src={image} 
          alt={name}
          className="absolute inset-0 w-full h-full object-contain p-4"
        />
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-white/90 px-2 py-1 rounded-full">
          <Heart className="w-4 h-4 text-red-500" />
          <span className="font-bold text-sm">{hp}</span>
        </div>
      </div>
      <div className="p-4">
        <h2 className="text-xl font-bold capitalize mb-2 flex items-center gap-2">
          {name}
          <Shield className="w-4 h-4 text-blue-500" />
        </h2>
        <div className="flex gap-2 mb-3">
          {types.map((type) => (
            <span 
              key={type}
              className="px-2 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
            >
              {type}
            </span>
          ))}
        </div>
        {attacks && (
          <div className="mb-3 space-y-2">
            {attacks.map((attack) => (
              <div key={attack.name} className="text-sm">
                <div className="font-medium">{attack.name}</div>
                <div className="text-gray-600">Damage: {attack.damage}</div>
              </div>
            ))}
          </div>
        )}
        {showActions && onAddToDeck && (
          <button
            onClick={onAddToDeck}
            disabled={inDeck}
            className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-md ${
              inDeck 
                ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <Plus className="w-4 h-4" />
            {inDeck ? 'In Deck' : 'Add to Deck'}
          </button>
        )}
      </div>
    </div>
  );
}