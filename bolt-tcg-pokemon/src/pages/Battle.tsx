import React, { useState, useEffect } from 'react';
import { tcgdexApi, TcgdexCard } from '../services/tcgdexApi';
import { determineBattleWinner, BattleResult } from '../utils/battleUtils';
import { useDeck } from '../context/DeckContext';
import './Battle.css';
import BattleArena from '../components/battle/BattleArena';

type GamePhase = 'deck_selection' | 'card_selection' | 'battle' | 'round_summary' | 'game_over';
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

    // Si les deux joueurs ont sélectionné leur deck, passer directement à la sélection des cartes
    if (players[player === 'player1' ? 'player2' : 'player1'].deck.length > 0) {
      setPhase('card_selection');
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

  const processBattleResult = async (playersInfo: Record<Player, PlayerState>) => {
    const { player1, player2 } = playersInfo;
    if (!player1.selectedCard || !player2.selectedCard) return;

    setPhase('battle');
    
    try {
      // Récupérer les détails complets des deux cartes
      const [card1Details, card2Details] = await Promise.all([
        tcgdexApi.getCardDetailsForBattle(player1.selectedCard.id),
        tcgdexApi.getCardDetailsForBattle(player2.selectedCard.id)
      ]);

      console.log('Battle details fetched:', { card1Details, card2Details });

      const result = determineBattleWinner(card1Details, card2Details);
      setBattleResult(result);

      // Mettre à jour le score après la résolution du combat
      //const winner = result.winner.id === player1.selectedCard.id ? 'player1' : 'player2';
      //setPlayers(prev => ({
      //  ...prev,
      //  [winner]: { ...prev[winner], score: prev[winner].score + 1 }
      //}));

      // Vérifier si la partie est terminée
      //if (players[winner].score + 1 >= 3) {
      //  setTimeout(() => setPhase('game_over'), 3000);
      //} else {
      //  setTimeout(() => setPhase('round_summary'), 3000);
      //}

    } catch (error) {
      console.error('Error during battle resolution:', error);
      // Gérer l'erreur (peut-être revenir à la sélection des cartes)
      setPhase('card_selection');
    }
  };

  console.log("phase", phase)

  const handleBattleComplete = () => {
    if (!battleResult) return;
    
    // Mettre à jour le score
    const winner = battleResult.winner.id === players.player1.selectedCard?.id ? 'player1' : 'player2';
    setPlayers(prev => ({
      ...prev,
      [winner]: { ...prev[winner], score: prev[winner].score + 1 }
    }));

    // Passer à l'écran de résumé
    setPhase('round_summary');
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

            {players.player1.score >= 3 || players.player2.score >= 3 ? (
              <button 
                className="end-game-button"
                onClick={() => setPhase('game_over')}
              >
                Voir les résultats finaux
              </button>
            ) : (
              <button 
                className="next-round-button"
                onClick={startNextRound}
              >
                Passer au Round {currentRound + 1}
              </button>
            )}
          </div>
        </div>
      )}

      {phase === 'battle' && battleResult && players.player1.selectedCard && players.player2.selectedCard && (
        <BattleArena
          player1Card={players.player1.selectedCard}
          player2Card={players.player2.selectedCard}
          battleResult={battleResult}
          onAnimationComplete={handleBattleComplete}
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
