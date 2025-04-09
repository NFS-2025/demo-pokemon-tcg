import React from 'react';
import './Profile.css';
import { useAuth } from '../context/AuthContext';

interface Stats {
  gamesPlayed: number;
  gamesWon: number;
  winRate: number;
  favoriteType: string;
  totalDecks: number;
  bestWinStreak: number;
  battlePoints: number;
  rank: string;
}

const mockStats: Stats = {
  gamesPlayed: 147,
  gamesWon: 89,
  winRate: 60.5,
  favoriteType: "Fire",
  totalDecks: 8,
  bestWinStreak: 7,
  battlePoints: 1250,
  rank: "Gold Trainer"
};

export function Profile() {
  const { user } = useAuth();

  const achievements = [
    { name: "First Victory", description: "Gagnez votre première bataille", completed: true },
    { name: "Deck Master", description: "Créez 5 decks différents", completed: true },
    { name: "Win Streak", description: "Gagnez 5 batailles d'affilée", completed: true },
    { name: "Type Specialist", description: "Gagnez 10 batailles avec le même type", completed: false },
    { name: "Champion", description: "Atteignez le rang Platinum", completed: false },
  ];

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${user?.email}`} alt="Avatar" />
        </div>
        <div className="profile-info">
          <h1>{user?.email}</h1>
          <span className="rank-badge">{mockStats.rank}</span>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Parties jouées</h3>
          <div className="stat-value">{mockStats.gamesPlayed}</div>
        </div>
        <div className="stat-card">
          <h3>Victoires</h3>
          <div className="stat-value">{mockStats.gamesWon}</div>
        </div>
        <div className="stat-card">
          <h3>Taux de victoire</h3>
          <div className="stat-value">{mockStats.winRate}%</div>
        </div>
        <div className="stat-card">
          <h3>Type favori</h3>
          <div className="stat-value">{mockStats.favoriteType}</div>
        </div>
        <div className="stat-card">
          <h3>Nombre de decks</h3>
          <div className="stat-value">{mockStats.totalDecks}</div>
        </div>
        <div className="stat-card">
          <h3>Meilleure série</h3>
          <div className="stat-value">{mockStats.bestWinStreak}</div>
        </div>
      </div>

      <div className="achievements-section">
        <h2>Succès</h2>
        <div className="achievements-grid">
          {achievements.map((achievement) => (
            <div 
              key={achievement.name} 
              className={`achievement-card ${achievement.completed ? 'completed' : ''}`}
            >
              <div className="achievement-icon">
                {achievement.completed ? '🏆' : '🔒'}
              </div>
              <div className="achievement-info">
                <h4>{achievement.name}</h4>
                <p>{achievement.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="battle-points-section">
        <h2>Points de Combat: {mockStats.battlePoints}</h2>
        <div className="progress-bar">
          <div 
            className="progress" 
            style={{ width: `${(mockStats.battlePoints % 1000) / 10}%` }}
          />
        </div>
        <p>Plus que {1000 - (mockStats.battlePoints % 1000)} points pour le prochain rang</p>
      </div>
    </div>
  );
}

export default Profile;
