import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '../AppContext';

export const LiveResults: React.FC = () => {
  const { teams, teamId, getTeamAnswers, questions, resetGame } = useApp();
  const [timeLeft, setTimeLeft] = useState(15);
  
  const team = teams.find(t => t.id === teamId);
  const teamAnswers = getTeamAnswers(teamId || '');

  // Auto reset timer for booth mode
  useEffect(() => {
    if (timeLeft <= 0) {
      resetGame();
      return;
    }
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, resetGame]);

  const { score, matches, total, isComplete, membersFinished } = useMemo(() => {
    if (!team) return { score: 0, matches: 0, total: 0, isComplete: false, membersFinished: [] };
    
    const totalQuestions = questions.length;
    let matchingAnswers = 0;
    
    const finished = Object.keys(teamAnswers);
    const complete = finished.length === team.members.length;

    if (complete) {
      for (let qIdx = 0; qIdx < totalQuestions; qIdx++) {
        const answersForThisQuestion = finished.map(member => teamAnswers[member][qIdx]);
        const allMatch = answersForThisQuestion.every(val => val !== undefined && val === answersForThisQuestion[0]);
        if (allMatch) {
          matchingAnswers++;
        }
      }
    }

    const calculatedScore = totalQuestions > 0 ? Math.round((matchingAnswers / totalQuestions) * 100) : 0;
    return { score: calculatedScore, matches: matchingAnswers, total: totalQuestions, isComplete: complete, membersFinished: finished };
  }, [team, teamAnswers, questions]);

  if (!team) return null;

  const isWinner = score >= 90 && isComplete;

  const getCircleColor = () => {
    if (!isComplete && membersFinished.length < 2) return 'var(--primary-color)';
    if (score >= 90) return 'var(--success-color)';
    if (score >= 50) return '#f59e0b';
    return 'var(--error-color)';
  };

  return (
    <div className="glass-panel text-center slide-in scrollable-panel" style={{ width: '100%' }}>
      {isComplete ? (
        <h1>FINAL LIKE SCORE!</h1>
      ) : (
        <h1>LIVE LIKE SCORE</h1>
      )}
      
      <p className="subtitle-small">
        {membersFinished.length} / {team.members.length} players completed
      </p>

      {!isComplete ? (
        <div className="fade-in" style={{ margin: '2rem 0' }}>

          <div style={{ marginTop: '2rem' }}>
            {membersFinished.length === 1 ? (
              <h2>You're the first one!</h2>
            ) : (
              <h2>Looking good so far...</h2>
            )}
            <p>Tell the rest of <strong>{team.name}</strong> to finish so you can reveal your final Like score!</p>
          </div>
        </div>
      ) : (
        <>
          <div className="result-circle fade-in heartbeat" style={{ borderColor: getCircleColor(), boxShadow: `0 0 30px ${getCircleColor()}40` }}>
            <h3 style={{ color: getCircleColor(), textShadow: `0 0 10px ${getCircleColor()}80` }}>{score}%</h3>
            <span>{matches} / {total} MATCHES</span>
          </div>

          {isWinner ? (
            <div className="fade-in">
              <h2 className="glitch-small" data-text="JACKPOT!">JACKPOT!</h2>
              <p>Your team is perfectly in sync!</p>
              <div className="gift-box bounce">
                <h3>🎁 WINNER!</h3>
                <p>Show this code to the booth staff:</p>
                <div className="gift-code">LIKE-SCORE-99</div>
              </div>
            </div>
          ) : (
            <div className="fade-in">
              <h2 style={{ color: getCircleColor() }}>NOT QUITE! 😬</h2>
              <p>Maybe it's time for a team-building exercise?</p>
            </div>
          )}
        </>
      )}

      <div style={{ marginTop: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        Resetting screen in {timeLeft}s...
      </div>
      <button 
        className="btn-secondary" 
        onClick={() => resetGame()} 
        style={{ marginTop: '1rem' }}
      >
        FINISH NOW
      </button>
    </div>
  );
};

export default LiveResults;
