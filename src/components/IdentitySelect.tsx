import React from 'react';
import type { GameState } from '../data';
import { teamsDatabase } from '../data';
import { useStorage } from '../useStorage';

interface IdentitySelectProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
}

export const IdentitySelect: React.FC<IdentitySelectProps> = ({ gameState, setGameState }) => {
  const { getTeamAnswers } = useStorage();
  
  if (!gameState.teamId) return null;
  const team = teamsDatabase.find(t => t.id === gameState.teamId);
  if (!team) return null;

  const teamAnswers = getTeamAnswers(team.id);

  const handleSelect = (member: string) => {
    if (teamAnswers[member]) {
      // Already taken! We can either prevent them or let them retake.
      // For a fun booth experience, let's just let them view live results if they click themselves
      setGameState({
        ...gameState,
        currentMember: member,
        step: 'live_results',
      });
      return;
    }

    setGameState({
      ...gameState,
      currentMember: member,
      currentQuestionIndex: 0,
      currentSessionAnswers: [],
      step: 'questionnaire',
    });
  };

  return (
    <div className="glass-panel text-center slide-in" style={{ width: '100%' }}>
      <h2 className="team-badge">{team.name}</h2>
      <h1 style={{ fontSize: '2.5rem', margin: '2rem 0' }}>WHO ARE YOU?</h1>

      <div className="identity-grid">
        {team.members.map(member => {
          const hasPlayed = !!teamAnswers[member];
          return (
            <button 
              key={member} 
              className={`game-btn identity-card ${hasPlayed ? 'played' : ''}`} 
              onClick={() => handleSelect(member)}
            >
              <div className="avatar">🧑‍🚀</div>
              <h3>{member}</h3>
              {hasPlayed && <span className="status-badge">DONE</span>}
            </button>
          );
        })}
      </div>

      <button className="btn-secondary" onClick={() => setGameState(prev => ({ ...prev, step: 'team_select' }))} style={{ marginTop: '2rem' }}>
        BACK
      </button>
    </div>
  );
};
