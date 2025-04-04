import React, { useState, useEffect } from 'react';
import { TcgdexCard } from '../services/tcgdexApi';
import { determineBattleWinner, BattleResult } from '../utils/battleUtils';
import { useDeck } from '../context/DeckContext';
import './Battle.css';
import BattleArena from '../components/battle/BattleArena';

type GamePhase = 'deck_selection' | 'deck_reveal' | 'card_selection' | 'battle' | 'round_summary' | 'game_over';
type Player = 'player1' | 'player2';

interface PlayerState {
  deck: TcgdexCard[];
  selectedCard: TcgdexCard | null;
  score: number;
}

export function Battle() {
  const [phase, setPhase] = useState<GamePhase>('deck_selection');
  const [players, setPlayers] = useState<Record<Player, PlayerState>>({
    player1: { deck: [], selectedCard: null, score: 0 },
    player2: { deck: [], selectedCard: null, score: 0 }
  });
  const [battleResult, setBattleResult] = useState<BattleResult | null>(null);
  const [currentRound, setCurrentRound] = useState(1);
  
  const { loadDeck } = useDeck();
  const [savedDecks, setSavedDecks] = useState<Record<string, any>>({});

  useEffect(() => {
    // Charger les decks sauvegardés
    const saved = localStorage.getItem('savedDecks');
    if (saved) {
      setSavedDecks(JSON.parse(saved));
    }
  }, []);

  const handleDeckSelection = (player: Player, deckName: string) => {
    const selectedDeck = savedDecks[deckName].cards;
    setPlayers(prev => ({
      ...prev,
      [player]: { ...prev[player], deck: selectedDeck }
    }));

    // Si les deux joueurs ont sélectionné leur deck
    if (players[player === 'player1' ? 'player2' : 'player1'].deck.length > 0) {
      setPhase('deck_reveal');
    }
  };

  const handleCardSelection = (player: Player, card: TcgdexCard) => {
    setPlayers(prev => {
      const newPlayers = {
        ...prev,
        [player]: { ...prev[player], selectedCard: card }
      }

      // Si les deux joueurs ont sélectionné leur carte
      if (newPlayers[player === 'player1' ? 'player2' : 'player1'].selectedCard) {
        console.log("process", newPlayers)
        processBattleResult(newPlayers);
      }
      return newPlayers
    } );
  };

  console.log("players", players, phase)

  const processBattleResult = (playersInfo: Record<Player, PlayerState>) => {
    const { player1, player2 } = playersInfo;
    if (!player1.selectedCard || !player2.selectedCard) return;

    setPhase('battle');
    const result = determineBattleWinner(player1.selectedCard, player2.selectedCard);
    setBattleResult(result);

    // Attendre que l'animation de combat soit terminée
    setTimeout(() => {
      // Mettre à jour le score
      const winner = result.winner.id === player1.selectedCard.id ? 'player1' : 'player2';
      setPlayers(prev => ({
        ...prev,
        [winner]: { ...prev[winner], score: prev[winner].score + 1 }
      }));

      // Vérifier si un joueur a gagné le match
      if (players[winner].score + 1 >= 3) {
        setPhase('game_over');
      } else {
        // Au lieu d'aller directement à la sélection, on va à la phase de résumé
        setPhase('round_summary');
      }
    }, 4000); // Durée totale des animations
  };

  const startNextRound = () => {
    setCurrentRound(prev => prev + 1);
    setPlayers(prev => ({
      player1: { ...prev.player1, selectedCard: null },
      player2: { ...prev.player2, selectedCard: null }
    }));
    setBattleResult(null);
    setPhase('card_selection');
  };

  return (
    <div className="battle-container">
      {phase === 'deck_selection' && (
        <div className="deck-selection-phase">
          <h2>Sélection des Decks</h2>
          <div className="players-container">
            <div className="player-selection">
              <h3>Joueur 1</h3>
              <select onChange={(e) => handleDeckSelection('player1', e.target.value)}>
                <option value="">Choisir un deck</option>
                {Object.keys(savedDecks).map(deckName => (
                  <option key={deckName} value={deckName}>{deckName}</option>
                ))}
              </select>
            </div>
            <div className="player-selection">
              <h3>Joueur 2</h3>
              <select onChange={(e) => handleDeckSelection('player2', e.target.value)}>
                <option value="">Choisir un deck</option>
                {Object.keys(savedDecks).map(deckName => (
                  <option key={deckName} value={deckName}>{deckName}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {phase === 'deck_reveal' && (
        <div className="deck-reveal-phase">
          <h2>Révélation des Decks</h2>
          <div className="decks-container">
            <div className="player-deck">
              <h3>Deck Joueur 1</h3>
              <div className="deck-cards">
                {players.player1.deck.map(card => (
                  <img key={card.id} src={card.image} alt={card.name} className="deck-card" />
                ))}
              </div>
            </div>
            <div className="player-deck">
              <h3>Deck Joueur 2</h3>
              <div className="deck-cards">
                {players.player2.deck.map(card => (
                  <img key={card.id} src={card.image} alt={card.name} className="deck-card" />
                ))}
              </div>
            </div>
          </div>
          <button onClick={() => setPhase('card_selection')} className="continue-button">
            Commencer le Combat
          </button>
        </div>
      )}

      {phase === 'card_selection' && (
        <div className="card-selection-phase">
          <div className="round-header">
            <h2>Round {currentRound}</h2>
            <div className="score-display">
              <div className={`player-score ${players.player1.score > players.player2.score ? 'leading' : ''}`}>
                Joueur 1: {players.player1.score}
              </div>
              <div className="score-separator">-</div>
              <div className={`player-score ${players.player2.score > players.player1.score ? 'leading' : ''}`}>
                Joueur 2: {players.player2.score}
              </div>
            </div>
          </div>

          <div className="players-container">
            <div className="player-selection">
              <h3>Joueur 1 {players.player1.selectedCard ? '(Prêt)' : ''}</h3>
              {!players.player1.selectedCard && (
                <div className="player-cards">
                  {players.player1.deck.map(card => (
                    <img 
                      key={card.id} 
                      src={card.image} 
                      alt={card.name} 
                      className="card-choice"
                      onClick={() => handleCardSelection('player1', card)}
                    />
                  ))}
                </div>
              )}
            </div>
            <div className="player-selection">
              <h3>Joueur 2 {players.player2.selectedCard ? '(Prêt)' : ''}</h3>
              {!players.player2.selectedCard && (
                <div className="player-cards">
                  {players.player2.deck.map(card => (
                    <img 
                      key={card.id} 
                      src={card.image} 
                      alt={card.name} 
                      className="card-choice"
                      onClick={() => handleCardSelection('player2', card)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {phase === 'round_summary' && battleResult && (
        <div className="round-summary-phase">
          <h2>Résumé du Round {currentRound}</h2>
          
          <div className="summary-content">
            <div className="battle-outcome">
              <div className="winner-section">
                <img 
                  src={battleResult.winner.image} 
                  alt={battleResult.winner.name} 
                  className="winner-card" 
                />
                <div className="winner-details">
                  <h3>{battleResult.winner.name} remporte la manche!</h3>
                  <p>{battleResult.description}</p>
                </div>
              </div>

              <div className="current-score">
                <h4>Score actuel</h4>
                <div className="score-display large">
                  <div className={`player-score ${players.player1.score > players.player2.score ? 'leading' : ''}`}>
                    Joueur 1: {players.player1.score}
                  </div>
                  <div className="score-separator">-</div>
                  <div className={`player-score ${players.player2.score > players.player1.score ? 'leading' : ''}`}>
                    Joueur 2: {players.player2.score}
                  </div>
                </div>
              </div>
            </div>

            {players.player1.score < 3 && players.player2.score < 3 && (
              <button 
                className="next-round-button"
                onClick={startNextRound}
              >
                Continuer vers le Round {currentRound + 1}
              </button>
            )}
          </div>
        </div>
      )}

      {phase === 'result' && battleResult && (
        <div className="battle-result-phase">
          <h2>Résultat du Round {currentRound}</h2>
          <div className="battle-cards">
            <div className={`battle-card ${battleResult.winner.id === players.player1.selectedCard?.id ? 'winner' : 'loser'}`}>
              <img src={players.player1.selectedCard?.image} alt="Joueur 1" />
            </div>
            <div className="battle-info">
              <div className="battle-description">{battleResult.description}</div>
              <div className="scores">
                <span>Joueur 1: {players.player1.score}</span>
                <span>Joueur 2: {players.player2.score}</span>
              </div>
            </div>
            <div className={`battle-card ${battleResult.winner.id === players.player2.selectedCard?.id ? 'winner' : 'loser'}`}>
              <img src={players.player2.selectedCard?.image} alt="Joueur 2" />
            </div>
          </div>
        </div>
      )}

      {phase === 'battle' && battleResult && players.player1.selectedCard && players.player2.selectedCard && (
        <BattleArena
          player1Card={players.player1.selectedCard}
          player2Card={players.player2.selectedCard}
          battleResult={battleResult}
          onAnimationComplete={() => {
            if (players.player1.score >= 3 || players.player2.score >= 3) {
              setPhase('game_over');
            } else {
              setPhase('card_selection');
            }
          }}
        />
      )}

      {phase === 'game_over' && (
        <div className="game-over-phase">
          <h2>Fin du Match!</h2>
          <div className="final-result">
            <h3>
              {players.player1.score > players.player2.score ? 'Joueur 1' : 'Joueur 2'} 
              remporte la victoire!
            </h3>
            <div className="final-scores">
              <p>Joueur 1: {players.player1.score}</p>
              <p>Joueur 2: {players.player2.score}</p>
            </div>
            <button 
              onClick={() => window.location.reload()} 
              className="new-game-button"
            >
              Nouvelle Partie
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Battle;
