import React, { useEffect, useState } from 'react';
import { TcgdexCard } from '../../services/tcgdexApi';
import { BattleResult } from '../../utils/battleUtils';
import './BattleArena.css';

interface BattleArenaProps {
  player1Card: TcgdexCard;
  player2Card: TcgdexCard;
  battleResult: BattleResult;
  onAnimationComplete: () => void;
}

const BattleArena: React.FC<BattleArenaProps> = ({
  player1Card,
  player2Card,
  battleResult,
  onAnimationComplete
}) => {
  const [phase, setPhase] = useState<'entrance' | 'battle' | 'result'>('entrance');

  useEffect(() => {
    // Séquence d'animation
    const entranceTimer = setTimeout(() => {
      setPhase('battle');
      
      const battleTimer = setTimeout(() => {
        setPhase('result');
        
        // Augmenter le délai avant la fin pour mieux voir le résultat
        const resultTimer = setTimeout(() => {
          onAnimationComplete();
        }, 3000); // Augmenté de 2000 à 3000
        
        return () => clearTimeout(resultTimer);
      }, 2000);
      
      return () => clearTimeout(battleTimer);
    }, 1000);
    
    return () => clearTimeout(entranceTimer);
  }, [onAnimationComplete]);

  return (
    <div className="battle-arena">
      <div className="versus-text">VS</div>
      
      <div className="battle-scene">
        <div className={`battle-card player1 ${phase} ${
          battleResult.isDraw 
            ? 'draw'
            : battleResult.winner?.id === player1Card.id 
              ? 'winner' 
              : 'loser'
        }`}>
          <img src={player1Card.image} alt={player1Card.name} />
          <div className="card-stats">
            <div className="card-name">{player1Card.name}</div>
            <div className="card-type">{player1Card.types?.[0]}</div>
            <div className="card-hp">HP: {player1Card.hp}</div>
          </div>
        </div>

        {phase === 'battle' && (
          <div className="battle-effects">
            <div className="clash-effect">⚡</div>
            {battleResult.reason === 'type' && !battleResult.isDraw && (
              <div className="type-effect">Super Efficace!</div>
            )}
          </div>
        )}

        <div className={`battle-card player2 ${phase} ${
          battleResult.isDraw 
            ? 'draw'
            : battleResult.winner?.id === player2Card.id 
              ? 'winner' 
              : 'loser'
        }`}>
          <img src={player2Card.image} alt={player2Card.name} />
          <div className="card-stats">
            <div className="card-name">{player2Card.name}</div>
            <div className="card-type">{player2Card.types?.[0]}</div>
            <div className="card-hp">HP: {player2Card.hp}</div>
          </div>
        </div>
      </div>

      {phase === 'result' && (
        <div className="battle-result">
          <div className={`result-message ${battleResult.reason} ${battleResult.isDraw ? 'draw' : ''}`}>
            {battleResult.description}
          </div>
        </div>
      )}
    </div>
  );
};

export default BattleArena;
