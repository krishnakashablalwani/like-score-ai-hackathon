import React, { useState } from 'react';
import type { GameState } from '../data';
import { questions, teamsDatabase } from '../data';
import { useStorage } from '../useStorage';

interface QuestionnaireProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
}

export const Questionnaire: React.FC<QuestionnaireProps> = ({ gameState, setGameState }) => {
  const { saveMemberAnswers } = useStorage();
  
  const team = teamsDatabase.find(t => t.id === gameState.teamId);
  const currentMember = gameState.currentMember;
  const question = questions[gameState.currentQuestionIndex];
  const totalQuestions = questions.length;
  
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  if (!team || !currentMember) return null;

  const options = question.options.length > 0 ? question.options : team.members;

  const handleNext = () => {
    if (selectedOption === null) return;

    const newAnswers = [...gameState.currentSessionAnswers, selectedOption];

    if (gameState.currentQuestionIndex < totalQuestions - 1) {
      setGameState({
        ...gameState,
        currentSessionAnswers: newAnswers,
        currentQuestionIndex: gameState.currentQuestionIndex + 1
      });
      setSelectedOption(null);
    } else {
      // Finished!
      // Save to local storage
      saveMemberAnswers(team.id, currentMember, newAnswers);
      
      setGameState({
        ...gameState,
        currentSessionAnswers: newAnswers,
        step: 'live_results'
      });
    }
  };

  const progressPercentage = ((gameState.currentQuestionIndex + 1) / totalQuestions) * 100;

  return (
    <div className="glass-panel slide-in" style={{ width: '100%' }}>
      <div className="hud">
        <span className="player-tag">PLAYER: {currentMember.toUpperCase()}</span>
        <span className="level-tag">Q {gameState.currentQuestionIndex + 1}/{totalQuestions}</span>
      </div>
      
      <div className="progress-container">
        <div className="progress-bar" style={{ width: `${progressPercentage}%` }}></div>
      </div>

      <h2 className="question-text">
        {question.text}
      </h2>

      <div className="options-grid">
        {options.map((opt, idx) => (
          <button
            key={idx}
            className={`game-btn option-btn ${selectedOption === idx ? 'selected' : ''}`}
            onClick={() => setSelectedOption(idx)}
          >
            {opt}
          </button>
        ))}
      </div>

      <button 
        className="btn-primary huge-btn" 
        onClick={handleNext} 
        disabled={selectedOption === null}
      >
        {gameState.currentQuestionIndex === totalQuestions - 1 ? 'FINISH' : 'NEXT'}
      </button>
    </div>
  );
};
