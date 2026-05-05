import React from 'react';
import type { GameState } from '../data';

interface WelcomeProps {
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
}

export const Welcome: React.FC<WelcomeProps> = ({ setGameState }) => {
  const handleAdminClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.location.href = '/admin';
  };

  return (
    <div className="glass-panel text-center pulse-container" style={{ width: '100%', cursor: 'pointer', position: 'relative' }} onClick={() => setGameState(prev => ({ ...prev, step: 'team_select' }))}>
      <button 
        onClick={handleAdminClick}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: 'transparent',
          border: 'none',
          color: 'rgba(255,255,255,0.1)',
          cursor: 'pointer',
          zIndex: 10
        }}
      >
        Admin
      </button>

      <div style={{ marginBottom: '1rem' }}>
        <img src="/logo.png" alt="Logo" style={{ maxWidth: '300px', height: 'auto' }} />
      </div>

      <div className="arcade-title fade-in">
        <h1 className="glitch" data-text="TEAM MATCH">TEAM MATCH</h1>
        <h2 className="subtitle">LIKE SCORE TEST</h2>
      </div>
      
      <div className="tap-to-start bounce">
        <p>TAP ANYWHERE TO START</p>
      </div>

      <div className="decorations">
        <span className="star star-1">✨</span>
        <span className="star star-2">🎮</span>
        <span className="star star-3">🚀</span>
      </div>
    </div>
  );
};
