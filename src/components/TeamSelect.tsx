import React, { useState, useMemo } from 'react';
import type { GameState } from '../data';
import { useConfig } from '../ConfigContext';

interface TeamSelectProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
}

export const TeamSelect: React.FC<TeamSelectProps> = ({ gameState, setGameState }) => {
  const { teams } = useConfig();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTeams = useMemo(() => {
    return teams.filter(team => 
      team.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, teams]);

  const handleSelect = (teamId: string) => {
    setGameState({
      ...gameState,
      teamId,
      step: 'identity_select',
    });
  };

  return (
    <div className="glass-panel text-center slide-in" style={{ width: '100%' }}>
      <h2>SELECT YOUR TEAM</h2>
      <p className="subtitle-small">Find your squad to begin</p>

      <div style={{ marginBottom: '1.5rem' }}>
        <input 
          type="text" 
          placeholder="Search team name..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '8px',
            border: '2px solid rgba(255, 255, 255, 0.2)',
            background: 'rgba(0, 0, 0, 0.3)',
            color: 'white',
            fontSize: '1.1rem',
            outline: 'none'
          }}
        />
      </div>

      <div className="team-grid">
        {filteredTeams.length > 0 ? (
          filteredTeams.map(team => (
            <button 
              key={team.id} 
              className="game-btn team-card" 
              onClick={() => handleSelect(team.id)}
            >
              <div className="team-icon">👾</div>
              <h3>{team.name}</h3>
              <span className="member-count">{team.members.length} Players</span>
            </button>
          ))
        ) : (
          <p>No teams found.</p>
        )}
      </div>

      <button className="btn-secondary" onClick={() => setGameState(prev => ({ ...prev, step: 'welcome' }))}>
        BACK
      </button>
    </div>
  );
};
