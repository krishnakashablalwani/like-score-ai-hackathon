import React, { useMemo } from 'react';
import type { GameState } from '../data';
import { teamsDatabase, questions } from '../data';
import { useStorage } from '../useStorage';

interface AdminProps {
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
}

export const Admin: React.FC<AdminProps> = ({ setGameState }) => {
  const { globalAnswers, clearAllData } = useStorage();
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [passcode, setPasscode] = React.useState('');

  const progressData = useMemo(() => {
    return teamsDatabase.map(team => {

      const teamAnswers = globalAnswers[team.id] || {};
      const membersCompleted = Object.keys(teamAnswers).length;
      
      let matches = 0;
      let score = 0;
      
      if (membersCompleted === team.members.length && membersCompleted > 0) {
        for (let qIdx = 0; qIdx < questions.length; qIdx++) {
          const answersForThisQuestion = team.members.map(member => teamAnswers[member]?.[qIdx]);
          // Check if all answered members match
          const answeredValues = answersForThisQuestion.filter(val => val !== undefined);
          if (answeredValues.length > 0 && answeredValues.every(val => val === answeredValues[0])) {
            matches++;
          }
        }
        score = Math.round((matches / questions.length) * 100);
      }

      return {
        ...team,
        membersCompleted,
        matches,
        score
      };
    });
  }, [globalAnswers]);

  if (!isAuthenticated) {
    return (
      <div className="glass-panel text-center slide-in" style={{ width: '100%', maxWidth: '400px' }}>
        <h2>Admin Access</h2>
        <div style={{ margin: '1.5rem 0' }}>
          <input 
            type="password" 
            placeholder="Enter Admin Passcode" 
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (passcode === import.meta.env.VITE_ADMIN_SECRET) {
                  setIsAuthenticated(true);
                } else {
                  alert('Incorrect passcode');
                }
              }
            }}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              background: 'rgba(0, 0, 0, 0.3)',
              color: 'white',
              fontSize: '1.1rem',
              outline: 'none',
              textAlign: 'center'
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className="btn-secondary" 
            onClick={() => setGameState(prev => ({ ...prev, step: 'welcome' }))}
            style={{ flex: 1 }}
          >
            Cancel
          </button>
          <button 
            className="btn-primary" 
            style={{ flex: 1 }}
            onClick={() => {
              if (passcode === import.meta.env.VITE_ADMIN_SECRET) {
                setIsAuthenticated(true);
              } else {
                alert('Incorrect passcode');
              }
            }}
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{ width: '100%', maxWidth: '800px', textAlign: 'left' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>Admin Dashboard</h2>
        <button className="btn-secondary" onClick={() => setGameState(prev => ({ ...prev, step: 'welcome' }))}>
          Close
        </button>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem' }}>
        <button 
          className="btn-secondary" 
          style={{ background: 'var(--success-color)', color: '#000', borderColor: 'var(--success-color)' }}
          onClick={() => {
            const csvContent = "data:text/csv;charset=utf-8," 
              + "Team Name,Members Completed,Total Members,Matches,Like Score,Status\n"
              + progressData.map(t => {
                  const status = t.membersCompleted === 0 ? "Not Started" : t.membersCompleted === t.members.length ? "Finished" : "In Progress";
                  const scoreDisplay = t.membersCompleted === t.members.length ? `${t.score}%` : "Pending";
                  return `"${t.name}",${t.membersCompleted},${t.members.length},${t.matches},${scoreDisplay},${status}`;
              }).join("\n");
              
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "team_like_scores.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}
        >
          Export Teams Data
        </button>
        <button 
          className="btn-secondary" 
          style={{ background: 'var(--error-color)', color: 'white' }}
          onClick={() => {
            if (window.confirm("Are you sure you want to clear all team data? This cannot be undone.")) {
              clearAllData();
            }
          }}
        >
          Clear All Data
        </button>
      </div>

      <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--primary-color)', textAlign: 'left' }}>
              <th style={{ padding: '8px' }}>Team Name</th>
              <th style={{ padding: '8px' }}>Progress</th>
              <th style={{ padding: '8px' }}>Like Score</th>
              <th style={{ padding: '8px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {progressData.map(team => (
              <tr key={team.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <td style={{ padding: '12px 8px' }}>{team.name}</td>
                <td style={{ padding: '12px 8px' }}>{team.membersCompleted} / {team.members.length} members</td>
                <td style={{ padding: '12px 8px' }}>
                  {team.membersCompleted === team.members.length ? `${team.score}%` : 'Pending'}
                </td>
                <td style={{ padding: '12px 8px' }}>
                  {team.membersCompleted === 0 ? (
                    <span style={{ color: '#aaa' }}>Not Started</span>
                  ) : team.membersCompleted === team.members.length ? (
                    <span style={{ color: team.score >= 90 ? 'var(--success-color)' : 'var(--error-color)' }}>
                      Finished
                    </span>
                  ) : (
                    <span style={{ color: '#f59e0b' }}>In Progress</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
