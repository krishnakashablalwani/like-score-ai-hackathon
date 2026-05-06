import React from 'react';
import { useApp } from '../AppContext';

export const IdentitySelect: React.FC = () => {
  const { teams, teamId, getTeamAnswers, selectMember, setStep } = useApp();
  
  if (!teamId) return null;
  const team = teams.find(t => t.id === teamId);
  if (!team) return null;

  const teamAnswers = getTeamAnswers(team.id);

  const handleSelect = (member: string) => {
    if (teamAnswers[member]) {
      // If already played, we let them view results
      selectMember(member);
      setStep('live_results');
      return;
    }
    selectMember(member);
  };

  return (
    <div className="glass-panel text-center slide-in" style={{ width: '100%' }}>
      <h2 className="team-badge" style={{ display: 'inline-block', padding: '5px 15px', background: 'var(--primary-color)', borderRadius: '10px', fontSize: '1rem', marginBottom: '1rem' }}>{team.name}</h2>
      <h1 style={{ fontSize: '2.5rem', margin: '1rem 0 2rem' }}>WHO ARE YOU?</h1>

      <div className="identity-grid">
        {team.members.map(member => {
          const hasPlayed = !!teamAnswers[member];
          return (
            <button 
              key={member} 
              className={`game-btn identity-card ${hasPlayed ? 'played' : ''}`} 
              onClick={() => !hasPlayed && handleSelect(member)}
              disabled={hasPlayed}
              style={hasPlayed ? { cursor: 'not-allowed', opacity: 0.6 } : {}}
            >
              <div className="avatar">{hasPlayed ? '✅' : '🧑‍🚀'}</div>
              <h3>{member}</h3>
              {hasPlayed && <span className="status-badge">COMPLETED</span>}
            </button>
          );
        })}
      </div>

      <button className="btn-secondary" onClick={() => setStep('team_select')} style={{ marginTop: '2rem' }}>
        BACK
      </button>
    </div>
  );
};

export default IdentitySelect;
